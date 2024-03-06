<template>
  <div>SOme Basic component for future {{ state }}</div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const state = reactive({
  count: 0,
})

defineExpose({
  increment() {
    state.count++
  },
})
</script>

<!-- <style scoped lang="sass"></style> -->
