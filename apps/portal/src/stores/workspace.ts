import { defineStore } from 'pinia'
import type { SurveyDto } from '@intake24-dietician/common/entities-new/survey.dto'
import { ref } from 'vue'

export const useWorkspaceStore = defineStore('workspace', () => {
  const currentWorkspace = ref<SurveyDto & { avatarColor: string }>()

  return { currentWorkspace }
})
