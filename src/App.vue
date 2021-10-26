<script setup lang="ts">
import SYCanvas from "./components/SYCanvas.vue"
import { NDialogProvider } from "naive-ui"
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
html {
  touch-action: none;
}
</style>
