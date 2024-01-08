<template>
  <v-list-item loading="!currentClinic">
    <template v-if="clinic" v-slot:prepend>
      <v-avatar :color="clinic.avatarColor">
        <span class="text-h5">
          {{ clinic.surveyName[0]?.toLocaleUpperCase() }}
        </span>
      </v-avatar>
    </template>
    <div v-if="clinic" class="d-flex align-center">
      <div>
        <div class="font-weight-medium text-black">
          {{ clinic.surveyName }}
        </div>
        <div>ID: {{ clinic.id }}</div>
      </div>
    </div>
  </v-list-item>
</template>

<script setup lang="ts">
import { SurveyPlainDto } from '@intake24-dietician/common/entities-new/survey.dto'

defineProps<{
  clinic: SurveyPlainDto & { avatarColor: string }
}>()
</script>
