import { defineStore } from 'pinia'
import type { SurveyDTO } from '@intake24-dietician/common/entities/survey.dto'
import { ref } from 'vue'

export const useWorkspaceStore = defineStore('workspace', () => {
  const currentWorkspace = ref<SurveyDTO & { avatarColor: string }>()

  return { currentWorkspace }
})
