<template>
  <v-container>
    <div>
      <v-tabs v-model="activeTab">
        <v-tab v-for="tab in tabs" :key="tab.name" :value="tab.value">
          {{ tab.name }}
        </v-tab>
      </v-tabs>
    </div>

    <v-window v-model="activeTab" class="content">
      <v-window-item v-for="tab in tabs" :key="tab.name" :value="tab.value">
        <component :is="tabs[activeTab]!.component"></component>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup lang="ts">
import { defineComponent, ref } from 'vue'

interface Tab {
  name: string
  value: number
  component: ReturnType<typeof defineComponent>
}

defineProps<{ tabs: Tab[] }>()

const activeTab = ref(0)
</script>
