<template>
  <v-btn
    prepend-icon="mdi-chevron-left"
    flat
    class="text-none pa-0"
    variant="text"
    @click="handleBackButtonClick"
  >
    Go Back
  </v-btn>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '@intake24-dietician/portal/stores/workspace'

const workspaceStore = useWorkspaceStore()

const handleBackButtonClick = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    workspaceStore.navigateToSurveyPatientList()
  }
}
</script>
