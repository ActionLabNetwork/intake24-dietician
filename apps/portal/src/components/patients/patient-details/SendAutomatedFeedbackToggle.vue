<template>
  <div>
    <div v-if="!hideLabel">
      <p class="font-weight-medium">Automated feedbacks</p>
      <p class="subheading">
        Select this setting if you want your patient to receive automated
        feedback every time they complete a recall. Turn off this setting if you
        always want to compose a tailored feedback for this patient.
      </p>
    </div>

    <v-card
      class="card rounded-lg px-4 d-flex flex-column flex-sm-row pa-2 justify-space-between align-center mt-5"
      flat
    >
      <div>Send automated feedbacks to this patient?</div>
      <div class="ml-md-auto d-flex align-center">
        <v-switch
          v-model="sendAutomatedFeedback"
          hide-details
          inset
          color="success"
          @update:model-value="e => emit('update', e ?? false)"
        />
        <div class="ml-4 automated-feedback-switch-label">
          {{ sendAutomatedFeedback ? 'Yes' : 'No' }}
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{ defaultState: boolean; hideLabel?: boolean }>(),
  { hideLabel: false },
)
const emit = defineEmits<{
  update: [value: boolean]
}>()

const sendAutomatedFeedback = ref(false)

watch(
  () => props.defaultState,
  () => {
    sendAutomatedFeedback.value = props.defaultState
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.subheading {
  color: #555;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 135%;
  letter-spacing: 0.14px;

  @media only screen and (min-width: 768px) {
    width: 50vw;
  }
}

.automated-feedback-switch-label {
  color: #555;
  font-family: Roboto;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

.card {
  border: 0.5px solid rgba(0, 0, 0, 0.25);
  width: 100%;

  @media only screen and (min-width: 768px) {
    width: 50vw;
  }
}
</style>
