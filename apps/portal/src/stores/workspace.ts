import { defineStore } from 'pinia'
import type { SurveyPlainDto } from '@intake24-dietician/common/entities-new/survey.dto'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSurveys } from '../queries/useSurveys'
import { generateDistinctColors } from '../utils/colors'

export const useWorkspaceStore = defineStore('workspace', () => {
  const router = useRouter()
  const surveysQuery = useSurveys()

  const currentWorkspace = ref<SurveyPlainDto & { avatarColor: string }>()
  const workspaces = ref<(SurveyPlainDto & { avatarColor: string })[]>([])

  const otherWorkspaces = computed(() =>
    workspaces.value.filter(
      workspace => workspace.id !== currentWorkspace.value?.id,
    ),
  )

  const switchToFirstWorkspace = () => {
    const firstWorkspace = workspaces.value[0]
    if (!firstWorkspace) return

    currentWorkspace.value = firstWorkspace
  }

  const switchCurrentWorkspace = (id: number) => {
    const _currentWorkspace = workspaces.value.find(
      workspace => workspace.id === id,
    )

    if (!_currentWorkspace) return

    currentWorkspace.value = _currentWorkspace
  }

  const refetchWorkspaces = async () => {
    await surveysQuery.invalidateSurveysQuery()
  }
  const navigateToSurveyPatientList = () => {
    if (!currentWorkspace.value) return

    router.push({
      name: 'Survey Patient List',
      params: { surveyId: currentWorkspace.value.id },
    })
  }

  watch(
    () => surveysQuery.data.value,
    newSurveysQueryData => {
      if (!newSurveysQueryData || newSurveysQueryData.length === 0) return

      const surveys = newSurveysQueryData
      const colors = generateDistinctColors(
        surveys.map(survey => survey.id.toString()),
      )

      const surveysWithAvatarColors = surveys.map((survey, index) => ({
        ...survey,
        avatarColor: colors[index]!,
      }))

      workspaces.value = surveysWithAvatarColors
      const currentWorkspaceId = currentWorkspace.value?.id
      const _currentWorkspace =
        surveysWithAvatarColors.find(
          survey => survey.id === currentWorkspaceId,
        ) || workspaces.value[0]

      currentWorkspace.value = _currentWorkspace
    },
    { immediate: true },
  )

  return {
    currentWorkspace,
    workspaces,
    otherWorkspaces,
    refetchWorkspaces,
    switchToFirstWorkspace,
    switchCurrentWorkspace,
    navigateToSurveyPatientList,
  }
})
