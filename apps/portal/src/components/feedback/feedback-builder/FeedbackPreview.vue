<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <div class="my-5 ml-4 d-print-none">
    <v-btn class="text-none" color="secondary" flat @click="exportContentToPdf">
      Export to PDF
    </v-btn>
  </div>
  <div id="print-content" justify="center" elevation="2">
    <v-card flat>
      <div v-if="modules && modules.length > 0">
        <div
          v-for="(module, index) in modules"
          :key="index"
          :class="{ 'page-break': index > 1 }"
        >
          <div
            v-if="index === 0"
            class="text-wrapper d-flex align-center justify-space-between flex-wrap"
          >
            <div class="">
              <p class="text-h3 font-weight-medium">Hi {{ patientName }}</p>
              <p class="w-50 mt-4">
                Great job on completing your recall. Below, you can find a quick
                feedback based on your recall data submitted on
                {{ recallDate.toLocaleDateString() }}
              </p>
            </div>
          </div>
          <component
            :is="module.component"
            :feedback="module.feedback"
            :recalls-data="recallsData"
            :recall-date="recallDate"
            mode="preview"
            class="mt-10"
            flat
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
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING } from '@intake24-dietician/portal/constants/modules'
import type { Component } from 'vue'
import { ModuleRoute } from '@intake24-dietician/portal/types/modules.types'
import { usePdfExport } from '@/composables/usePdfExport'
import { RecallDto } from '@intake24-dietician/common/entities-new/recall.dto'

interface Props {
  patientName: string
  recallsData: RecallDto[]
  recallDate: Date
  modules: { key: ModuleRoute; component: Component; feedback: string }[]
}

defineProps<Props>()
const { exportToPdf } = usePdfExport()

const exportContentToPdf = () => {
  const element = document.querySelector('#print-content') as HTMLElement
  exportToPdf(element, 'feedback.pdf')
}
</script>

<style scoped lang="scss">
.text-wrapper {
  padding: 4.5rem 4.5rem;
}

.page-break {
  page-break-inside: avoid;
}

@media print {
  .text-wrapper {
    padding: 0 4.5rem;
  }
}
</style>
