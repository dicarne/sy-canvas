<script setup lang="ts">
import SYCanvas from "./components/SYCanvas.vue"
import { NDialogProvider } from "naive-ui"
document.ontouchmove = function(e){ e.preventDefault(); e.stopPropagation();}
document.ontouchstart = function(e){ e.preventDefault(); e.stopPropagation();}
</script>

<template>
  <n-dialog-provider>
    <SYCanvas />
  </n-dialog-provider>
</template>

<style>
body {
  margin: 0px;
  overflow: hidden;
}
</style>
