<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <div
    class="d-flex flex-column flex-sm-row justify-space-between align-center"
  >
    <div class="d-flex align-center mb-5 mb-sm-0">
      <component
        :is="typeof logo === 'string' ? 'img' : logo"
        :src="typeof logo === 'string' ? logo : undefined"
        :width="90"
        aspect-ratio="16/9"
      />
      <div class="ml-4 font-weight-medium">{{ title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  logo: string | Component
  title: string
}>()
</script>
