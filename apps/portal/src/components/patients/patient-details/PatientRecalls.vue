<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useRecallsByUserId } from '@/queries/useRecall'
import { ref, watch } from 'vue'
import moment from 'moment'
import { useRoute } from 'vue-router'

const route = useRoute()
console.log({ p: route.params })

const recallId = ref('')
// const recallsQuery = useRecallsByUserId(ref('4072'))
const recallsQuery = useRecallsByUserId(
  ref(`dietician:survey_id:${route.params['id']}`),
)

const date = ref<Date>()
const recallDates = ref<{ id: string; startTime: Date; endTime: Date }[]>([])

watch(
  () => recallsQuery.data.value?.data,
  data => {
    if (data?.ok) {
      recallDates.value = data.value.map(recall => ({
        id: recall.id,
        startTime: recall.startTime,
        endTime: recall.endTime,
      }))

      // Default to latest recall date
      date.value = recallDates.value.at(-1)?.startTime
    }
  },
)

watch(date, newDate => {
  const recall = recallDates.value.find(d =>
    moment(d.startTime).isSame(newDate, 'day'),
  )
  recallId.value = recall?.id ?? ''
})
</script>
<style scoped lang="scss">
.total-energy-container {
  border-radius: 4px;
  border: 0.5px solid rgba(0, 0, 0, 0.25);
  background: rgba(241, 241, 241, 0.5);
  padding: 1rem;
  font-weight: 500;
}

.grid-container {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
}

.grid-item {
  background: #ddd;
  padding: 1rem;
  border-radius: 10px;
}
</style>
