<template>
  <div>
    <v-menu transition="slide-y-transition" bottom>
      <template v-slot:activator="{ props }">
        <v-btn class="text-none" v-bind="props">
          Workspace <v-icon class="ml-2" icon="mdi-chevron-down" />
        </v-btn>
      </template>

      <v-card class="my-menu pa-2">
        <div v-if="workspaces.length === 0" class="pa-2">
          <p class="text-center text-body-1">No workspaces...</p>
        </div>
        <div v-else>
          <v-list v-if="currentWorkspace" style="overflow: hidden">
            <v-list-subheader>Current Workspace</v-list-subheader>
            <WorkspaceMenuItem
              :workspace="currentWorkspace"
              @click="
                router.push({
                  name: 'Survey Patient List',
                  params: { surveyId: currentWorkspace.id },
                })
              "
            />
          </v-list>
          <v-list v-if="workspaces.length > 1">
            <v-list-subheader>Other Workspaces</v-list-subheader>
            <WorkspaceMenuItem
              v-for="workspace in otherWorkspaces"
              :key="workspace.id"
              :value="workspace"
              :workspace="workspace"
              variant="plain"
              @click="
                () => {
                  currentWorkspace = workspace
                  console.log({ workspace })
                  router.push({
                    name: 'Survey Patient List',
                    params: { surveyId: currentWorkspace.id },
                  })
                }
              "
            />
          </v-list>
        </div>
        <div class="pa-3">
          <v-btn
            width="100%"
            color="primary"
            class="text-none"
            href="/dashboard/my-surveys/add-survey"
          >
            Add new workspace <v-icon class="ml-2" icon="mdi-plus" />
          </v-btn>
        </div>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import type { SurveyPlainDto } from '@intake24-dietician/common/entities-new/survey.dto'
import { useSurveys } from '@intake24-dietician/portal/queries/useSurveys'
import { useWorkspaceStore } from '@intake24-dietician/portal/stores/workspace'
import { generateDistinctColors } from '@intake24-dietician/portal/utils/colors'
import WorkspaceMenuItem from './WorkspaceMenuItem.vue'
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const surveysQuery = useSurveys()
const workspaceStore = useWorkspaceStore()
const { currentWorkspace } = storeToRefs(workspaceStore)

const workspaces = ref<(SurveyPlainDto & { avatarColor: string })[]>([])
const otherWorkspaces = computed(() =>
  workspaces.value.filter(
    workspace => workspace.id !== currentWorkspace.value?.id,
  ),
)

watch(
  () => surveysQuery.data.value,
  newSurveysQueryData => {
    if (!newSurveysQueryData || newSurveysQueryData.length === 0) return

    const surveys = newSurveysQueryData
    const colors = generateDistinctColors(
      surveys.map(survey => survey.surveyName),
    )

    const surveysWithAvatarColors = surveys.map((survey, index) => ({
      ...survey,
      avatarColor: colors[index]!,
    }))

    workspaces.value = surveysWithAvatarColors
    const currentWorkspaceId = Number(route.params['surveyId'] as string)
    const _currentWorkspace =
      surveysWithAvatarColors.find(
        survey => survey.id === currentWorkspaceId,
      ) || workspaces.value[0]

    currentWorkspace.value = _currentWorkspace
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.my-menu {
  margin-top: 40px;
  contain: initial;
  overflow: visible !important;
  border-radius: 10px !important;
}
.my-menu::before,
.my-menu::after {
  position: absolute;
  content: '';
  top: 0;
  left: 30px;
  transform: translateY(-90%);
  width: 10px;
  height: 12px;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
}

.my-menu::before {
  border-bottom: 13px solid #fff;
  z-index: -1;
}

.my-menu::after {
  border-bottom: 13px solid #000;
  filter: blur(25px);
  opacity: 0.6;
  transform: translateY(-15px);
  z-index: 2;
}
</style>
