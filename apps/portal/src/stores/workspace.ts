import { defineStore } from 'pinia'
import type { SurveyPlainDto } from '@intake24-dietician/common/entities-new/survey.dto'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useWorkspaceStore = defineStore('workspace', () => {
  const router = useRouter()

  const currentWorkspace = ref<SurveyPlainDto & { avatarColor: string }>()

  const navigateToSurveyPatientList = () => {
    if (!currentWorkspace.value) return

    router.push({
      name: 'Survey Patient List',
      params: { surveyId: currentWorkspace.value.id },
    })
  }

  return { currentWorkspace, navigateToSurveyPatientList }
})
