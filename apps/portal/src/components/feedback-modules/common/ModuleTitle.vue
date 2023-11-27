<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <div
    class="d-flex flex-column flex-sm-row justify-space-between align-center"
  >
    <div class="d-flex align-center mb-5 mb-sm-0">
      <v-img :src="logo" :width="90" aspect-ratio="16/9"></v-img>
      <div class="ml-4 font-weight-medium">Carbs Exchange</div>
    </div>
    <div>
      <VueDatePicker
        v-if="!props.recallDate"
        v-model="localSelectedDate"
        :teleport="true"
        :enable-time-picker="false"
        text-input
        format="dd/MM/yyyy"
        :allowed-dates="allowedStartDates"
        @update:model-value="emit('update:selectedDate', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { computed } from 'vue'

const props = defineProps<{
  logo: string
  title: string
  recallDate: Date
  allowedStartDates: Date[]
  selectedDate: Date
}>()

const emit = defineEmits<{
  'update:selectedDate': [date: Date]
}>()

const localSelectedDate = computed(() => props.selectedDate)
</script>
