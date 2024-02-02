<template>
  <div class="text feedback-heading">
    Customise the recommended level and the default messages according to your
    patient's profile
  </div>
  <div class="d-flex justify-space-between align-center px-5">
    <div class="font-weight-medium d-flex align-center w-50">
      <p>Set recommendation level</p>
      <div class="mx-5">=</div>
      <v-text-field
        v-model="recommendationLevel"
        type="number"
        class="mt-5"
        variant="outlined"
        suffix="g"
      ></v-text-field>
    </div>
    <div>
      <BaseButton>Reset values</BaseButton>
    </div>
  </div>
  <div v-if="feedback">
    <div class="text feedback-heading">Feedback message if:</div>
    <div class="px-4">
      <p class="text-primary font-weight-medium">
        Fibre intake is above {{ recommendationLevel }}
      </p>
      <v-text-field
        v-model="feedback.feedbackAbove"
        class="mt-5"
        variant="outlined"
        suffix="g"
      ></v-text-field>
    </div>
    <div class="px-4">
      <p class="text-primary font-weight-medium">
        Fibre intake is below {{ recommendationLevel }}
      </p>
      <v-text-field
        v-model="feedback.feedbackBelow"
        class="mt-5"
        variant="outlined"
        suffix="g"
      ></v-text-field>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeedbackAboveAndBelowRecommendedLevels } from '@intake24-dietician/portal/types/modules.types'
import BaseButton from '../common/BaseButton.vue'
import { ref } from 'vue'

const feedback = defineModel<FeedbackAboveAndBelowRecommendedLevels>()
const recommendationLevel = ref('')
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
