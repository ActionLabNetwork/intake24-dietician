<template>
  <div>
    <p class="font-weight-medium">Update recall frequency</p>
    <v-card class="mt-4" width="75%" flat>
      <div class="v-row align-center">
        <div class="v-col">
          <BaseInput
            type="number"
            name="recallFrequency"
            :value="recallFrequency.value"
            label-class=""
            @update="newVal => (recallFrequency.value = newVal)"
          >
            Remind every (required)
          </BaseInput>
        </div>
        <div class="v-col pt-10">
          <v-select
            :items="units"
            variant="solo-filled"
            flat
            :model-value="recallFrequency.unit"
            density="comfortable"
          ></v-select>
        </div>
      </div>
    </v-card>
    <v-card class="mt-4" width="75%" flat>
      <div class="form-label pb-2">Ends (required)</div>
      <div class="v-row align-center">
        <div class="v-col">
          <v-radio-group v-model="frequencyRadio">
            <v-radio
              v-for="option in frequencyEndOptions"
              :key="option.label"
              :label="option.label"
              :value="option.value"
            ></v-radio>
          </v-radio-group>
        </div>
        <div class="v-col">
          <v-date-picker v-show="frequencyRadio === 'on'" class="my-2" />
          <div v-show="frequencyRadio === 'after'">
            <BaseInput
              type="number"
              name="age"
              :value="occurencesCount"
              class="base-input"
            >
              <span class="input-label"> Occurences: </span>
            </BaseInput>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseInput from '../../form/BaseInput.vue'

const units = ['days', 'weeks', 'months'] as const

interface RecallFrequency {
  value: string
  unit: (typeof units)[number]
}

const recallFrequency = ref<RecallFrequency>({
  value: '',
  unit: 'days',
})

const frequencyEndOptions = [
  { label: 'Never', value: 'never' },
  { label: 'On', value: 'on' },
  { label: 'After', value: 'after' },
] as const
const frequencyRadio = ref<(typeof frequencyEndOptions)[number]['value']>(
  frequencyEndOptions[0]?.value,
)

const occurencesCount = ref('')

watch(frequencyRadio, newVal => console.log({ newVal }))
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
