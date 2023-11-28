<template>
  <v-row justify="center">
    <v-dialog
      v-model="localDialog"
      fullscreen
      :scrim="false"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="emit('click:close')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Feedback preview</v-toolbar-title>
          <v-toolbar-items>
            <v-btn variant="text" @click="emit('click:close')"> Close </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <div class="text-wrapper">
          <div class="mt-10">
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
            class="pa-16"
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
              FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING[module.key]
                .feedbackBackground
            "
          ></component>
        </div>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { FEEDBACK_MODULES_OUTPUT_BACKGROUND_MAPPING } from '@intake24-dietician/portal/constants/modules'
import { IRecallExtended } from '@intake24-dietician/common/types/recall'
import { type Component, computed } from 'vue'
import { ModuleRoute } from '@intake24-dietician/portal/types/modules.types'

interface Props {
  patientName: string
  recallsData: IRecallExtended[]
  recallDate: Date
  modules: { key: ModuleRoute; component: Component; feedback: string }[]
  dialog: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'click:close': []
}>()

const localDialog = computed(() => props.dialog)
</script>

<style scoped lang="scss">
.text-wrapper {
  padding: 0 4.5rem;
  margin-top: 5rem;
}
.wrapper {
  padding: 0 10rem;
}
</style>
