<template>
  <v-row class="ml-2">
    <v-col cols="2">
      <v-card class="">
        <v-list>
          <div class="font-weight-medium pl-3">Module templates</div>
          <div
            v-for="(item, i) in items"
            :key="i"
            class="d-flex justify-center align-baseline"
          >
            <v-checkbox
              v-model="selectedModules"
              :label="item.title"
              :value="item.value"
              color="primary"
            ></v-checkbox>
          </div>
        </v-list>
      </v-card>
    </v-col>
    <v-col cols="10" width="100%">
      <!-- TODO: Replace this with the individual modules -->
      <v-card class="mx-auto" min-height="50rem">
        <v-row align="center">
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
        </v-row>

        <!-- Preview -->
        <div class="ma-4">
          <EnergyIntakeModule />
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
import { ref } from 'vue'
import EnergyIntakeModule from '../feedback-modules/standard/energy-intake/EnergyIntakeModule.vue'

const items = ref([
  {
    title: 'Alcohol Intake',
    value: 1,
  },
  {
    title: 'Carbs Intake',
    value: 2,
  },
  {
    title: 'Fibre Intake',
    value: 3,
  },
  {
    title: 'Energy Intake',
    value: 4,
  },
  {
    title: 'Fruit Intake',
    value: 5,
  },
  {
    title: 'Meal Intake',
    value: 6,
  },
  {
    title: 'Protein Intake',
    value: 7,
  },
  {
    title: 'Fibre Intake',
    value: 8,
  },
  {
    title: 'Simple & complex carbs',
    value: 9,
  },
  {
    title: 'Sodium intake',
    value: 10,
  },
  {
    title: 'Vegetable intake',
    value: 11,
  },
])

const selectedModules = ref([])
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
