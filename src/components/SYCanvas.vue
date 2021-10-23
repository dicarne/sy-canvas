<script lang="ts" setup>

import { onMounted, reactive, ref, toRaw } from 'vue';
import { decode, DrawData, DrawStoke } from "../lib/useDraw"
import { throttle } from 'lodash';
import { api, util } from "siyuan_api_cache_lib"
import { NColorPicker, NSlider, NButton, NSpace, NModal, NCard, useDialog } from "naive-ui"
const canvas = ref<any>(null)
const ctx = ref<CanvasRenderingContext2D>()
const canvas_args = reactive({
    w: 1000,
    h: 1000,
})
const mouseDown = ref(false)
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

const getMousePosition = (e: MouseEvent | TouchEvent) => {
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
    const p = getMousePosition(arg)
    mouseDown.value = true
    if (!ctx.value) return
    ctx.value.beginPath()
    stoke.value = {
        width: canvas_config.width,
        color: canvas_config.color,
        points: [p]
    }
    ctx.value.moveTo(p.x, p.y)
    ctx.value.strokeStyle = stoke.value.color
    ctx.value.lineJoin = "round"
    ctx.value.lineWidth = stoke.value.width
}

const _drawNewPoint = (p: { x: number, y: number }) => {
    if (!ctx.value) return
    stoke.value.points.push(p)
    ctx.value.lineTo(p.x, p.y)
    ctx.value.stroke()
}
const OnMouseMove = (arg: MouseEvent | TouchEvent) => {
    if (mouseDown.value) {
        const p = getMousePosition(arg)
        _drawNewPoint(p)
    }
}
const save = () => {
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
    if (mouseDown.value) {
        mouseDown.value = false
        if (!ctx.value) return
        const p = getMousePosition(arg)
        ctx.value.lineTo(p.x, p.y)
        ctx.value.stroke()
        ctx.value.closePath()
        stokes.value.push(stoke.value)
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

</script>
<template>
    <canvas
        :style="{
            width: '100vw',
            height: '100vh'
        }"
        :width="canvas_args.w"
        :height="canvas_args.h"
        ref="canvas"
        :ontouchstart="OnMouseDown"
        :ontouchmove="OnMouseMove"
        :ontouchend="OnMouseUp"
        :ontouchcancel="OnMouseUp"
        :onmousedown="OnMouseDown"
        :onmousemove="OnMouseMove"
        :onmouseleave="OnMouseUp"
        :onmouseup="OnMouseUp"
    />
    <div
        :style="{
            position: 'fixed',
            bottom: '0px',
            width: '100vw',
            backgroundColor: '#fff',
            paddingTop: '10px',
            paddingLeft: '5px'
        }"
    >
        <n-space>
            <n-button @click="setting.show = true">设置</n-button>
            <n-button @click="nooooo()">撤销</n-button>
            <n-color-picker
                :on-update:value="changeColor"
                :style="{
                    width: '40vw',
                    minWidth: '300px',
                    maxWidth: '500px'
                }"
                :show-alpha="false"
                :swatches="colorSwatches"
            />
            <n-slider
                v-model:value="canvas_config.width"
                :step="1"
                :min="1"
                :max="20"
                :style="{
                    width: '40vw',
                    minWidth: '300px',
                    maxWidth: '500px'
                }"
            />
        </n-space>
    </div>
    <n-modal
        v-model:show="setting.show"
        :style="{
            position: 'fixed',
            top: '10px',
        
        }"
    >
        <n-card :style="{ width: '100vw' }" title="设置" :bordered="false" size="huge">
            背景颜色
            <n-color-picker
                :show-alpha="false"
                :on-update:value="setting.changeColor"
                :default-value="canvas_config.background"
            />
            <n-space>
                <n-button @click="clearAll">清空</n-button>
            </n-space>
            <template #footer>
                <n-space>
                    <n-button @click="setting.show = false">取消</n-button>
                    <n-button @click="setting.ok()">确认</n-button>
                </n-space>
            </template>
        </n-card>
    </n-modal>
</template>

