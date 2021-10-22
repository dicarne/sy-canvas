<script lang="ts" setup>

import { onMounted, ref } from 'vue';
const canvas = ref<any>(null)
const ctx = ref<CanvasRenderingContext2D>()
onMounted(() => {
    if (canvas.value) {
        ctx.value = canvas.value.getContext("2d");
        if(!ctx.value) return
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
    return {
        x: e.clientX,
        y: e.clientY
    }
}
const mouseDown = ref(false)
const OnMouseDown = (arg: MouseEvent) => {
    const p = getMousePosition(arg)
    mouseDown.value = true
    ctx.value?.moveTo(0, 0)
    ctx.value!.strokeStyle = "#ffffff"
    ctx.value?.lineTo(p.x, p.y)
        ctx.value?.stroke()
}
const OnMouseMove = (arg: MouseEvent) => {
    if (mouseDown.value) {
        const p = getMousePosition(arg)
        ctx.value?.lineTo(p.x, p.y)
        ctx.value?.stroke()
        ctx.value?.moveTo(p.x, p.y)
    }
}
const OnMouseUp = (arg: MouseEvent) => {
    if (mouseDown.value) {
        const p = getMousePosition(arg)
        mouseDown.value = false
        ctx.value?.lineTo(p.x, p.y)
        ctx.value?.stroke()
    }
}
</script>
<template>
    <canvas
        :style="{
            width: '100vw',
            height: '100vh'
        }"
        width="500"
        height="500"
        ref="canvas"
        :onmousedown="OnMouseDown"
        :onmousemove="OnMouseMove"
        :onmouseleave="OnMouseUp"
        :onmouseup="OnMouseUp"
    />
</template>