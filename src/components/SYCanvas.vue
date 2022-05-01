<script lang="ts" setup>

import { onMounted, reactive, ref, toRaw } from 'vue';
import { decode, DrawData, DrawStoke, Point } from "../lib/useDraw"
import { throttle } from 'lodash';
import { api, util } from "siyuan_api_cache_lib"
import { NColorPicker, NSlider, NButton, NSpace, NModal, NCard, NInput, useDialog } from "naive-ui"
import { useConfig } from "../lib/useConfig"
const canvas = ref<any>(null)
const config = useConfig()
const ctx = ref<CanvasRenderingContext2D>()
const canvas_args = reactive({
    w: 1000,
    h: 1000,
})
const mouseDown = ref(false)
const mode = ref<"DRAW" | "EARSE">("DRAW")
const stokes = ref<DrawStoke[]>([])
const stoke = ref<DrawStoke>({
    width: 2,
    color: "#000000",
    points: []
})
const canvas_config = reactive({
    color: "#000",
    width: 3,
    background: "#fff"
})
const lock = ref(true)
const redraw = throttle(() => {
    if (!ctx.value) return
    ctx.value.fillStyle = canvas_config.background
    ctx.value.fillRect(0, 0, canvas_args.w, canvas_args.h)
    stokes.value.forEach(s => {
        if (!ctx.value || s.points.length <= 1) return
        ctx.value.beginPath()
        ctx.value.strokeStyle = s.color
        ctx.value.lineJoin = "round"
        ctx.value.lineWidth = s.width
        ctx.value.moveTo(s.points[0].x, s.points[0].y)
        for (let i = 1; i < s.points.length; i++) {
            const p = s.points[i];
            ctx.value.lineTo(p.x, p.y)
        }
        ctx.value.stroke()
        ctx.value.closePath()
    });
}, 500)
onMounted(async () => {
    const id = util.currentNodeId()
    if (canvas.value) {
        ctx.value = canvas.value.getContext("2d");
        if (!ctx.value) return
        ctx.value.imageSmoothingEnabled = true
        canvas_args.w = canvas.value.clientWidth
        canvas_args.h = canvas.value.clientHeight
        const data = await api.getBlockAttr(id!, "custom-data")
        if (data) {
            const d = JSON.parse(decode(data.value)) as DrawData
            stokes.value = d.stokes
            canvas_config.background = d.config.background
            canvas_config.color = d.config.color
            canvas_config.width = d.config.width
        } else {
            lock.value = false
        }
        setTimeout(redraw, 1)
    }
    window.onresize = () => {
        canvas_args.w = canvas.value.clientWidth
        canvas_args.h = canvas.value.clientHeight
        ctx.value = canvas.value.getContext("2d");
        setTimeout(redraw, 1)
    }
})
const getClientSize = () => {
    if (canvas.value) {
        return {
            w: canvas.value.clientWidth,
            h: canvas.value.clientHeight
        }
    }
    return null
}

const getMousePosition = (e: MouseEvent | TouchEvent | PointerEvent) => {
    const c = getClientSize()!
    if (e instanceof TouchEvent) {
        const t = e.changedTouches[0]
        return {
            x: Math.trunc(t.clientX / c.w * canvas_args.w),
            y: Math.trunc(t.clientY / c.h * canvas_args.h)
        }
    } else if (e instanceof MouseEvent) {
        return {
            x: Math.trunc(e.clientX / c.w * canvas_args.w),
            y: Math.trunc(e.clientY / c.h * canvas_args.h)
        }
    }
    throw new Error("unknown device!")
}

const OnMouseDown = (arg: MouseEvent | TouchEvent) => {
    let a_arg = arg as any
    if (a_arg.button && a_arg.button == 2) {
        mode.value = "EARSE"
    } else {
        mode.value = "DRAW"
    }
    if (lock.value) return
    const p = getMousePosition(arg)
    mouseDown.value = true
    if (!ctx.value) return
    ctx.value.beginPath()
    stoke.value = {
        width: mode.value == "DRAW" ? canvas_config.width : canvas_config.width + 8,
        color: mode.value == "DRAW" ? canvas_config.color : canvas_config.background,
        points: [p]
    }
    ctx.value.moveTo(p.x, p.y)
    ctx.value.strokeStyle = stoke.value.color
    ctx.value.lineJoin = "round"
    ctx.value.lineWidth = stoke.value.width
}
const vsub = (a: Point, b: Point) => {
    return {
        x: a.x - b.x,
        y: a.y - b.y
    }
}
const cross = (a: Point, b: Point) => {
    return a.x * b.y - b.x * a.y
}
const _earsePath = (a: Point, b: Point) => {
    for (let i = 0; i < stokes.value.length; i++) {
        const path = stokes.value[i];
        let flag = false
        for (let j = 1; j < path.points.length; j++) {
            const c = path.points[j - 1]
            const d = path.points[j]
            console.log(JSON.stringify({ a, b, c, d }))
            if (Math.max(c.x, d.x) < Math.min(a.x, b.x) || Math.max(a.x, b.x) < Math.min(c.x, d.x) || Math.max(c.y, d.y) < Math.min(a.y, b.y) || Math.max(a.y, b.y) < Math.min(c.y, d.y)) {
                console.log("skip 1")
                continue
            }
            if (cross(vsub(a, d), vsub(c, d)) * cross(vsub(b, d), vsub(c, d)) > 0 || cross(vsub(d, b), vsub(a, b)) * cross(vsub(c, b), vsub(a, b)) > 0) {
                console.log("skip 2")
                continue
            }
            flag = true
            break
        }
        if (flag) {
            stokes.value = stokes.value.splice(i, 1)
        }
    }
}
const _drawNewPoint = (p: { x: number, y: number }) => {
    if (!ctx.value) return
    // if (mode.value == "EARSE") {
    //     _earsePath(stoke.value.points[stoke.value.points.length - 1], p)
    //     stoke.value.points = [p]
    //     return
    // }
    stoke.value.points.push(p)
    ctx.value.lineTo(p.x, p.y)
    ctx.value.stroke()
}
const OnMouseMove = (arg: MouseEvent | TouchEvent) => {
    if (mouseDown.value && !lock.value) {
        const p = getMousePosition(arg)
        arg.preventDefault()
        arg.stopPropagation()
        _drawNewPoint(p)
    }
}
const save = () => {
    config.comfirm_change()
    api.setBlockAttrs({
        id: util.currentNodeId()!,
        attrs: {
            "custom-data": btoa(encodeURI(JSON.stringify({
                version: 1,
                stokes: toRaw(stokes.value),
                config: canvas_config
            })))
        }
    })
}
const OnMouseUp = (arg: MouseEvent | TouchEvent) => {
    if (mouseDown.value && !lock.value) {
        mouseDown.value = false
        if (!ctx.value) return
        //if (mode.value == "DRAW") {
        const p = getMousePosition(arg)
        ctx.value.lineTo(p.x, p.y)
        ctx.value.stroke()
        ctx.value.closePath()
        stokes.value.push(stoke.value)
        //}
        stoke.value = null as any
        save()
    }
}
const changeColor = (newc: string) => {
    canvas_config.color = newc
}
const colorSwatches = ref(['#FFFFFF', '#000', '#18A058', '#2080F0', '#F0A020', 'rgba(208, 48, 80, 1)'])

const setting = reactive({
    show: false,
    background: "#fff",
    changeColor: (newc: string) => {
        setting.background = newc
    },
    ok: () => {
        canvas_config.background = setting.background
        setting.show = false
        save()
        setTimeout(redraw, 1)
    }
})
// 撤销
const nooooo = () => {
    stokes.value.splice(stokes.value.length - 1, 1)
    redraw()
    save()
}
const dialog = useDialog()
const clearAll = () => {
    dialog.warning({
        title: '警告',
        content: '是否清空所有内容？该操作不可撤销！',
        positiveText: '确定',
        negativeText: '不确定',
        onPositiveClick: () => {
            stokes.value = []
            canvas_config.background = "#fff"
            redraw()
            save()
            setting.show = false
        },
        onNegativeClick: () => {

        }
    })
}
const openHelp = () => {
    window.open("https://github.com/dicarne/sy-canvas#设置")
}
</script>
<template>
    <canvas :style="{
        width: '100vw',
        height: '100vh'
    }" :width="canvas_args.w" :height="canvas_args.h" ref="canvas" :ontouchstart="OnMouseDown"
        :ontouchmove="OnMouseMove" :ontouchend="OnMouseUp" :ontouchcancel="OnMouseUp" :onpointerdown="OnMouseDown"
        :onpointermove="OnMouseMove" :onpointerleave="OnMouseUp" :onpointerup="OnMouseUp" />
    <div :style="{
        position: 'fixed',
        bottom: '0px',
        width: '100vw',
        backgroundColor: '#fff',
        paddingTop: '10px',
        paddingLeft: '5px',
        paddingBottom: '10px',
        'box-shadow': '0px 0px 10px #ddd'
    }">
        <n-space :align="'center'" :justify="'center'">
            <n-button @click="lock = !lock">{{ lock ? '解锁' : '锁定' }}</n-button>
            <n-button v-show="!lock" @click="setting.show = true">设置</n-button>
            <n-button v-show="!lock" @click="nooooo()" :disabled="stokes.length === 0">撤销</n-button>
            <n-color-picker v-show="!lock" :on-update:value="changeColor" :style="{
                width: '40vw',
                minWidth: '300px',
                maxWidth: '500px',
                display: 'block'
            }" :show-alpha="false"
                :swatches="config.config.value?.colors ? config.config.value.colors : colorSwatches" />
            <n-slider v-show="!lock" v-model:value="canvas_config.width" :step="1" :min="1" :max="20" :style="{
                width: '40vw',
                minWidth: '300px',
                maxWidth: '500px',
                '--rail-height': '10px'
            }" />
        </n-space>
    </div>
    <n-modal v-model:show="setting.show" :style="{
        position: 'fixed',
        top: '10px',
    
    }">
        <n-card :style="{ width: '100vw' }" title="设置" :bordered="false" size="huge">
            背景颜色
            <n-color-picker :show-alpha="false" :on-update:value="setting.changeColor"
                :default-value="canvas_config.background" />配置代码
            <n-input placeholder="代码块超链接或block id" :on-update:value="config.set_config_url"
                :value="(config.my_config_url).value" />
            <template #footer>
                <n-space>
                    <n-button @click="openHelp">帮助</n-button>
                    <n-button @click="clearAll">清空</n-button>
                    <n-button @click="setting.show = false">取消</n-button>
                    <n-button @click="setting.ok()">确认</n-button>
                </n-space>
            </template>
        </n-card>
    </n-modal>
</template>

<style>
</style>