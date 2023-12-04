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
    <div v-if="showDatepicker">
      <VueDatePicker
        v-model="localSelectedDate"
        :teleport="true"
        :enable-time-picker="false"
        text-input
        format="dd/MM/yyyy"
        :allowed-dates="allowedStartDates"
        @update:model-value="handleDateUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { computed, type Component } from 'vue'

const props = withDefaults(
  defineProps<{
    logo: string | Component
    title: string
    recallDate: Date
    allowedStartDates: Date[]
    selectedDate: Date
    showDatepicker: boolean
  }>(),
  { showDatepicker: false },
)

const emit = defineEmits<{
  'update:selectedDate': [date: Date]
}>()

const localSelectedDate = computed(() => props.selectedDate)

const handleDateUpdate = (d: Date) => {
  if (!d) return
  emit('update:selectedDate', d)
}
</script>
