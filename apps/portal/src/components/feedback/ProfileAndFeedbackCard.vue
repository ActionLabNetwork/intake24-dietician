<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <v-card class="mx-auto py-2 px-5">
    <div class="d-flex justify-space-between align-center">
      <div class="flex-container">
        <!-- Profile avatar, name and id -->
        <div class="d-flex align-center">
          <v-avatar size="x-large" :image="avatar" />
          <div class="ml-3">
            <div class="font-weight-bold">{{ fullName }}</div>
            <div>ID: {{ id }}</div>
          </div>
        </div>

        <!-- Date range -->
        <div class="d-flex">
          <div class="d-flex align-center">
            <div class="font-weight-medium">Date range:</div>
            <VueDatePicker
              v-model="date"
              :teleport="true"
              :enable-time-picker="false"
              text-input
              format="dd/MM/yyyy"
              class="ml-2"
              range
              style="width: 100%"
              @update:model-value="handleDateRangeUpdate"
            />
          </div>
        </div>

        <!-- Share status -->
        <div class="d-flex flex-column align-center">
          <p class="font-weight-medium mx-auto">Share status</p>
          <v-chip
            variant="outlined"
            :color="items[0]!.type === 'Tailored' ? 'success' : 'warning'"
            :text="items[0]!.type"
          >
          </v-chip>
        </div>

        <!-- Action buttons -->
        <div>
          <v-btn
            append-icon="mdi-eye-off-outline"
            class="text-capitalize"
            variant="text"
          >
            Hide / Preview
          </v-btn>
          <v-btn class="text-none ml-8" color="#F1F1F1" flat>
            Save as draft
          </v-btn>
          <v-btn class="text-none ml-3" color="primary" flat>
            Share feedback
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

defineProps<{ id: string; fullName: string; avatar: string }>()
const emit = defineEmits<{
  'update:daterange': [date: [Date, Date]]
}>()

interface SharedItem {
  shared: string
  type: 'Tailored' | 'Auto'
}

const date = ref()

const handleDateRangeUpdate = (date: [Date, Date]) => {
  emit('update:daterange', date)
}

onMounted(() => {
  const startDate = new Date()
  const endDate = new Date(new Date().setDate(startDate.getDate() + 7))
  date.value = [startDate, endDate]
})

const items = ref<SharedItem[]>([
  { shared: 'Real-Time', type: 'Tailored' },
  { shared: 'Audience', type: 'Tailored' },
  { shared: 'Conversions', type: 'Auto' },
])
</script>

<style scoped lang="scss">
.flex-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 4rem;
}
</style>
