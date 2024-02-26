<template>
  <v-tabs
    v-model="activeTab"
    :align-tabs="align"
    :hide-slider="hideSlider ?? false"
    :style="tabStyle"
  >
    <v-tab
      v-for="tab in tabs"
      :key="tab.name"
      :value="tab.value"
      :style="activeTab === tab.value ? activeTabStyle : {}"
    >
      <div class="d-flex text-none">
        <v-icon v-if="tab.icon" class="pr-2" :icon="tab.icon"></v-icon>
        <div>{{ tab.name }}</div>
      </div>
    </v-tab>
  </v-tabs>
</template>

<script setup lang="ts">
import { defineComponent, ref } from 'vue'

interface Tab {
  name: string
  value: number
  component: ReturnType<typeof defineComponent>
  props?: Record<string, unknown>
  icon?: string
  style?: Record<string, string>
}

withDefaults(
  defineProps<{
    tabs: Tab[]
    align?: 'start' | 'center' | 'end'
    hideSlider?: boolean
    tabStyle?: Record<string, string>
    activeTabStyle?: Record<string, string>
    showTabs?: boolean
  }>(),
  {
    showTabs: true,
    align: 'start',
    hideSlider: false,
    tabStyle: undefined,
    activeTabStyle: undefined,
  },
)

const activeTab = defineModel<number>()
</script>
