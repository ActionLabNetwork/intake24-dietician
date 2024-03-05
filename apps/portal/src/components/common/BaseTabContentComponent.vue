<template>
  <div v-if="activeTab !== undefined">
    <v-window v-model="activeTab" class="content pt-10">
      <v-window-item v-for="tab in tabs" :key="tab.name" :value="tab.value">
        <component
          :is="tabs[activeTab]?.component"
          v-bind="tabs[activeTab]?.props"
        ></component>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue'

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
