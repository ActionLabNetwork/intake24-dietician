<template>
  <v-row class="ml-2">
    <v-col cols="4">
      <ModuleSelectList
        @update="handleModuleChange"
        @update:modules="console.log"
      />
    </v-col>
    <v-col cols="0" width="100%">
      <!-- TODO: Replace this with the individual modules -->
      <v-card class="mx-auto" min-height="50rem">
        <!-- <v-row align="center">
          <v-col cols="6">
            <div class="pt-5 pl-5">
              <div class="font-weight-medium">Fibre intake</div>
              <div class="subheading font-weight-medium">
                This module provides with an overview the how much fibres (in
                grams) was consumed by the patient for each meal in timeline and
                pie-chart formats.
              </div>
            </div>
          </v-col>
          <v-spacer />
          <v-col cols="2">
            <div>
              <v-switch inset color="success" label="Use this module" />
            </div>
          </v-col>
        </v-row> -->

        <!-- Preview -->
        <div class="ma-4">
          <!-- <EnergyIntakeModule /> -->
        </div>

        <!-- Feedback Personalisation -->
        <div>
          <div class="text feedback-heading">Customise this feedback</div>
          <div class="text feedback-subheading mt-4">
            Feedback for below recommended level
            <v-textarea class="mt-3"></v-textarea>
          </div>
          <div class="text feedback-subheading">
            Feedback for meeting or above recommended level
            <v-textarea class="mt-3"></v-textarea>
          </div>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ModuleRoute } from '@intake24-dietician/portal/types/modules.types'
import ModuleSelectList from '../feedback-modules/ModuleSelectList.vue'
import { ref } from 'vue'

const selectedModule = ref<ModuleRoute>()
const handleModuleChange = (module: ModuleRoute) => {
  selectedModule.value = module
}
</script>

<style scoped lang="scss">
.text {
  padding: 0.5rem 1rem;
  &.feedback-heading {
    font-size: 18px;
    font-weight: 600;
  }

  &.feedback-subheading {
    font-size: 14px;
    font-weight: 500;
    line-height: 130%; /* 18.2px */
    letter-spacing: 0.14px;
  }
}
.subheading {
  color: #555;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 130%; /* 18.2px */
  letter-spacing: 0.14px;
}
</style>
