import { defineStore } from 'pinia'
import type { SurveyPlainDto } from '@intake24-dietician/common/entities-new/survey.dto'
import { ref } from 'vue'

export const useWorkspaceStore = defineStore('workspace', () => {
  const currentWorkspace = ref<SurveyPlainDto & { avatarColor: string }>()

  return { currentWorkspace }
})
