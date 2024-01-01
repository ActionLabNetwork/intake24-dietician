<template>
  <v-container
    class="d-flex justify-space-between align-center w-100 pa-0 pr-6"
  >
    <div class="d-flex align-center">
      <div>
        <v-avatar v-if="workspace" :color="workspace.avatarColor">
          <span class="text-h5">
            {{ workspace.surveyName[0]?.toLocaleUpperCase() }}
          </span>
        </v-avatar>
      </div>
      <div class="ml-4">
        <p class="text-h6 font-weight-bold">{{ workspace?.surveyName }}</p>
        <p class="text-subtitle-1">ID: {{ workspace?.id }}</p>
      </div>
    </div>
    <div>
      <v-icon
        icon="mdi-cog-outline"
        class="hoverable"
        @click="
          router.push({
            name: 'Survey Master Settings',
            params: { surveyId: route.params['surveyId'] as string },
          })
        "
      />
      <v-icon class="ml-6" icon="mdi-dots-horizontal" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '@intake24-dietician/portal/stores/workspace'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

const workspaceStore = useWorkspaceStore()
const { currentWorkspace: workspace } = storeToRefs(workspaceStore)

const router = useRouter()
const route = useRoute()
</script>

<style scoped>
.hoverable {
  transition: transform 0.3s;
}

.hoverable:hover {
  transform: scale(1.1);
  cursor: pointer;
}
</style>
