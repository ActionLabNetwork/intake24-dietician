<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <div justify="center" class="w-100">
    <v-card flat>
      <div class="text-wrapper">
        <div class="">
          <p class="text-h2 font-weight-medium">Hi {{ patientName }}</p>
          <p class="w-50 mt-4">
            Great job on completing your recall. Below, you can find a quick
            feedback based on your recall data submitted on Aug 1, 2023
          </p>
        </div>
      </div>
      <div v-if="modules && modules.length > 0" class="mt-10">
        <component
          :is="module.component"
          v-for="(module, index) in modules"
          :key="index"
          :feedback="module.feedback"
          :recalls-data="recallsData"
          :recall-date="recallDate"
          mode="preview"
          flat
          :class="{ 'page-break': index < modules.length - 1 }"
          :style="{
            'background-color':
              FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING[module.key]
                .mainBackground,
          }"
          :mainBgColor="
            FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING[module.key]
              .mainBackground
          "
          :feedbackBgColor="
            FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING[module.key].feedback
              .background
          "
          :feedbackTextColor="
            FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING[module.key].feedback
              .color
          "
        />
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING } from '@intake24-dietician/portal/constants/modules'
import { IRecallExtended } from '@intake24-dietician/common/types/recall'
import type { Component } from 'vue'
import { ModuleRoute } from '@intake24-dietician/portal/types/modules.types'

interface Props {
  patientName: string
  recallsData: IRecallExtended[]
  recallDate: Date
  modules: { key: ModuleRoute; component: Component; feedback: string }[]
  dialog: boolean
}

defineProps<Props>()
</script>

<style scoped>
.text-wrapper {
  padding: 0 4.5rem;
  margin-top: 5rem;
}
.wrapper {
  padding: 0 10rem;
}

.page-break {
  page-break-after: always !important;
  overflow: visible !important;
  padding-bottom: 3cm;
}

@page {
  margin: 2cm;
}
</style>
