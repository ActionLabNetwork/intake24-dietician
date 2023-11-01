<template>
  <div>
    <p class="font-weight-medium">
      Send patient automated feedback after every recall
    </p>
    <p class="subheading w-50">
      Every time a patient completes their recall, an automated feedback based
      on their recall data and pre-defined feedbacks will be shared with them on
      their email address
    </p>
    <v-card
      class="card rounded-lg px-4 d-flex justify-space-between align-center mt-5"
      width="75%"
      flat
    >
      <div>Send automated feedback?</div>
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

const props = defineProps<{ defaultState: boolean }>()
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
  font-family: Roboto;
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
