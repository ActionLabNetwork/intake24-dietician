<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <div v-if="!hideExportToPdfButton" class="my-5 ml-10 d-print-none">
    <v-btn
      :loading="pdfExportLoading"
      class="text-none"
      color="secondary"
      variant="flat"
      @click="exportContentToPdf"
    >
      Export to PDF
    </v-btn>
  </div>
  <div
    id="print-content"
    :class="constrainOutputHeight ? 'preview' : ''"
    justify="center"
    elevation="2"
  >
    <v-card flat>
      <div v-if="modules && modules.length > 0">
        <div
          v-for="(module, index) in modules"
          :key="index"
          :class="{ 'page-break': index > 1 }"
        >
          <FeedbackIntroText
            v-if="index === 0"
            :patient-name="patientName"
            :recall-daterange="recallDaterange"
          />
          <component
            :is="module.component"
            :feedback="module.feedback"
            :recalls-dates-data="recallDates"
            :recall-date="recallDaterange"
            mode="preview"
            flat
            :style="{
              'background-color':
                FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING[module.key]
                  .mainBackground,
            }"
            :main-bg-color="
              FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING[module.key]
                .mainBackground
            "
            :feedback-bg-color="
              FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING[module.key].feedback
                .background
            "
            :feedback-text-color="
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
import { ref, type Component } from 'vue'
import { ModuleName } from '@intake24-dietician/portal/types/modules.types'
import { usePdfExport } from '@/composables/usePdfExport'
import { RecallDatesDto } from '@intake24-dietician/common/entities-new/recall.dto'
import FeedbackIntroText from '@/components/feedback/feedback-builder/FeedbackIntroText.vue'
import { useRoute } from 'vue-router'

interface Props {
  patientName: string
  recallDates: RecallDatesDto[]
  recallDaterange: [Date | undefined, Date | undefined]
  modules: { key: ModuleName; component: Component; feedback: string }[]
  hideExportToPdfButton?: boolean
  constrainOutputHeight?: boolean
}

withDefaults(defineProps<Props>(), {
  hideExportToPdfButton: false,
  constrainOutputHeight: false,
})

const route = useRoute()
const { exportToPdf } = usePdfExport()

const pdfExportLoading = ref(false)

const exportContentToPdf = () => {
  pdfExportLoading.value = true
  const element = document.querySelector('#print-content') as HTMLElement
  exportToPdf(element, 'feedback.pdf')
  pdfExportLoading.value = false
}
</script>

<style scoped lang="scss">
.preview {
  border: 1px solid black;
  max-height: 50vh;
  overflow-y: auto;
  border-radius: 10px;
}

.page-break {
  page-break-inside: avoid;
}
</style>
