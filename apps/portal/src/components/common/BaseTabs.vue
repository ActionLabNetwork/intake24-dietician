<template>
  <div>
    <v-tabs
      v-model="activeTab"
      :align-tabs="align"
      :hide-slider="hideSlider ?? false"
      selected-class="active-tab"
    >
      <v-tab v-for="tab in tabs" :key="tab.name" :value="tab.value">
        <div class="d-flex text-none">
          <v-icon v-if="tab.icon" class="pr-2" :icon="tab.icon"></v-icon>
          <div>{{ tab.name }}</div>
        </div>
      </v-tab>
    </v-tabs>
  </div>

  <v-window v-model="activeTab" class="content pt-10">
    <v-window-item v-for="tab in tabs" :key="tab.name" :value="tab.value">
      <component
        :is="tabs[activeTab]!.component"
        v-bind="tabs[activeTab]!.props"
      ></component>
    </v-window-item>
  </v-window>
</template>

<script setup lang="ts">
import { defineComponent, ref, watchEffect } from 'vue'

interface Tab {
  name: string
  value: number
  component: ReturnType<typeof defineComponent>
  props?: Record<string, unknown>
  icon?: string
  style?: Record<string, string>
}

const props = defineProps<{
  tabs: Tab[]
  align?: 'start' | 'center' | 'end'
  hideSlider?: boolean
}>()

watchEffect(() => {
  console.log('in tab props', props)
})

const activeTab = ref(0)
</script>

<style scoped lang="scss">
::v-deep .v-tabs {
  background-color: #aabcb1;
  height: fit-content;
  width: fit-content;
  margin: 0 auto;
  border-radius: 8px;
  padding: 5px;
}
.active-tab {
  background-color: #34a749;
}
</style>
