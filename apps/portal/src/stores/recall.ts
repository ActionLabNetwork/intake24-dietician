import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { RecallDto } from '@intake24-dietician/common/entities-new/recall.dto'

export const useRecallsStore = defineStore('recalls', () => {
  const recalls = ref<RecallDto[]>()
  const hasRecalls = computed(() => (recalls.value?.length ?? 0) > 0)

  return { recalls, hasRecalls }
})
