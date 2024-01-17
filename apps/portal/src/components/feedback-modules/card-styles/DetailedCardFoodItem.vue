<template>
  <div>
    <p>
      {{ food.name }} ({{ usePrecision(parseFloat(food.servingWeight), 2) }}g)
    </p>
    <div class="d-flex justify-between flex-wrap">
      <div v-for="(_, i) in food.value" :key="i" class="pt-2 pr-4">
        <component
          :is="mascot"
          :fill="chroma(colors.valueCardBgColor).darken(1).saturate(5).hex()"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RecallDto } from '@intake24-dietician/common/entities-new/recall.dto'
import { usePrecision } from '@vueuse/math'
import chroma from 'chroma-js'
import type { Component } from 'vue'

defineProps<{
  food: RecallDto['recall']['meals'][0]['foods'][0]
  mascot: Component
  colors: {
    backgroundColor: string
    valueCardBgColor: string
    valueCardBorderColor: string
  }
}>()
</script>
