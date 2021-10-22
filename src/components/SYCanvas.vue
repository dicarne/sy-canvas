<script lang="ts" setup>

import { onMounted, reactive, ref, toRaw } from 'vue';
import { decode, DrawData, DrawStoke } from "../lib/useDraw"
import { throttle } from 'lodash';
import { api, util } from "siyuan_api_cache_lib"
import { NColorPicker, NSlider, NButton, NSpace, c } from "naive-ui"
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
        if(data) {
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

const getMousePosition = (e: MouseEvent) => {
    const c = getClientSize()!
    return {
        x: Math.trunc(e.clientX / c.w * canvas_args.w),
        y: Math.trunc(e.clientY / c.h * canvas_args.h)
    }
}

const OnMouseDown = (arg: MouseEvent) => {
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
const OnMouseMove = (arg: MouseEvent) => {
    if (mouseDown.value) {
        const p = getMousePosition(arg)
        _drawNewPoint(p)
    }
}
const OnMouseUp = (arg: MouseEvent) => {
    if (mouseDown.value) {
        mouseDown.value = false
        if (!ctx.value) return
        const p = getMousePosition(arg)
        ctx.value.lineTo(p.x, p.y)
        ctx.value.stroke()
        ctx.value.closePath()
        stokes.value.push(stoke.value)
        stoke.value = null as any

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
}
const changeColor = (newc: string) => {
    canvas_config.color = newc
}
const colorSwatches = ref(['#FFFFFF', '#000', '#18A058', '#2080F0', '#F0A020', 'rgba(208, 48, 80, 1)'])
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
        :onmousedown="OnMouseDown"
        :onmousemove="OnMouseMove"
        :onmouseleave="OnMouseUp"
        :onmouseup="OnMouseUp"
    />
    <div
        :style="{
            position: 'fixed',
            bottom: '0px',
            width: '100vw'
        }"
    >
        <n-space>
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
</template>