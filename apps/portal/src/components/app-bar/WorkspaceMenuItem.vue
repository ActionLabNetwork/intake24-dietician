<template>
  <v-list-item loading="!currentWorkspace">
    <template v-if="workspace" v-slot:prepend>
      <v-avatar :color="workspace.avatarColor">
        <span class="text-h5">
          {{ workspace.surveyName[0]?.toLocaleUpperCase() }}
        </span>
      </v-avatar>
    </template>
    <div v-if="workspace">
      <div class="font-weight-medium text-black">
        {{ workspace.surveyName }}
      </div>
      <div>ID: {{ workspace.id }}</div>
    </div>
  </v-list-item>
</template>

<script setup lang="ts">
import { SurveyPlainDto } from '@intake24-dietician/common/entities-new/survey.dto'

defineProps<{
  workspace: SurveyPlainDto & { avatarColor: string }
}>()
</script>
