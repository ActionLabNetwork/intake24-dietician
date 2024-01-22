<template>
  <div>
    <div v-if="!hideLabel">
      <p class="font-weight-medium">Automated feedbacks</p>
      <p class="subheading w-50">
        Select this setting if you want your patient to receive automated
        feedback every time they complete a recall.
      </p>
    </div>

    <v-card
      class="card rounded-lg px-4 d-flex justify-space-between align-center mt-5"
      width="100%"
      flat
    >
      <div>Send automated feedback to the patient?</div>
      <div class="ml-auto">
        <v-switch
          v-model="sendAutomatedFeedback"
          hide-details
          inset
          color="success"
          @update:model-value="e => emit('update', e ?? false)"
        ></v-switch>
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
}

.card {
  border: 0.5px solid rgba(0, 0, 0, 0.25);
}
</style>
