<template>
  <BaseTabs
    :tabs="tabs"
    :tab-style="{
      backgroundColor: background.color,
      height: 'fit-content',
      width: 'fit-content',
      margin: '0 auto',
      borderRadius: '8px',
      padding: '5px',
      color: 'white',
    }"
    :active-tab-style="{
      backgroundColor: background.active,
      borderRadius: '8px',
    }"
    align="center"
    :hide-slider="true"
    show-tabs
  />
</template>

<script setup lang="ts">
import type { PieAndTimelineTabs } from '../types/index'
import BaseTabs from '../../common/BaseTabs.vue'

defineProps<{
  tabs: PieAndTimelineTabs
  showTabs: boolean
  background: {
    color: string
    active: string
  }
}>()
</script>
