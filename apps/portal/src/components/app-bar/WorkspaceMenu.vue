<template>
  <div>
    <v-menu transition="slide-y-transition" bottom>
      <template v-slot:activator="{ props }">
        <v-btn class="text-none" v-bind="props">
          Workspace <v-icon class="ml-2" icon="mdi-chevron-down" />
        </v-btn>
      </template>
      <v-card class="my-menu pa-2">
        <v-list style="overflow: hidden">
          <v-list-subheader>Current Workspace</v-list-subheader>
          <v-list-item loading="!currentWorkspace">
            <template v-if="currentWorkspace" v-slot:prepend>
              <v-avatar :color="currentWorkspace.avatarColor">
                <span class="text-h5">
                  {{ currentWorkspace.name[0]?.toLocaleUpperCase() }}
                </span>
              </v-avatar>
            </template>
            <div v-if="currentWorkspace">
              <div class="font-weight-medium text-black">
                {{ currentWorkspace.name }}
              </div>
              <div>ID: {{ currentWorkspace.id }}</div>
            </div>
          </v-list-item>
        </v-list>
        <v-list>
          <v-list-subheader>Other Workspaces</v-list-subheader>
          <v-list-item
            v-for="(workspace, i) in otherWorkspaces"
            :key="i"
            :value="workspace"
            variant="plain"
            @click="currentWorkspace = workspace"
          >
            <template v-slot:prepend>
              <v-avatar :color="workspace.avatarColor">
                <span class="text-h5">
                  {{ workspace.name[0]?.toLocaleUpperCase() }}
                </span>
              </v-avatar>
            </template>
            <div>
              <div class="font-weight-medium text-black">
                {{ workspace.name }}
              </div>
              <div>ID: {{ workspace.id }}</div>
            </div>
          </v-list-item>
        </v-list>
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
import { SurveyDTO } from '@intake24-dietician/common/entities/survey.dto'
import { useSurveys } from '@intake24-dietician/portal/queries/useSurveys'
import { useWorkspaceStore } from '@intake24-dietician/portal/stores/workspace'
import { generateDistinctColors } from '@intake24-dietician/portal/utils/colors'
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

const surveysQuery = useSurveys()
const workspaceStore = useWorkspaceStore()
const { currentWorkspace } = storeToRefs(workspaceStore)

// const currentWorkspace = ref<SurveyDTO & { avatarColor: string }>()
const workspaces = ref<(SurveyDTO & { avatarColor: string })[]>([])
const otherWorkspaces = computed(() =>
  workspaces.value.filter(
    workspace => workspace.id !== currentWorkspace.value?.id,
  ),
)

watch(
  () => surveysQuery.data.value,
  newSurveysQueryData => {
    if (!newSurveysQueryData || !newSurveysQueryData.data.ok) return

    const surveys = newSurveysQueryData.data.value
    const colors = generateDistinctColors(surveys.map(survey => survey.name))

    const surveysWithAvatarColors = surveys.map((survey, index) => ({
      ...survey,
      avatarColor: colors[index]!,
    }))

    console.log({ surveys })
    workspaces.value = surveysWithAvatarColors
    currentWorkspace.value = surveysWithAvatarColors[0]
  },
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
  filter: blur(10px);
  opacity: 0.6;
  transform: translateY(-15px);
  z-index: -2;
}
</style>
