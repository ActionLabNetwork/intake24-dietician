<!-- eslint-disable vue/prefer-true-attribute-shorthand -->
<template>
  <div>
    <p v-if="!hideLabel" class="font-weight-medium">Update recall frequency</p>
    <v-card class="wrapper mt-4" width="100%" flat>
      <div class="v-row align-center">
        <div class="v-col">
          <BaseInput
            type="number"
            name="recallFrequency"
            class="text-label"
            :value="reminderConditions.reminderEvery.every.toString()"
            @update="
              newVal => {
                reminderConditions = {
                  ...reminderConditions,
                  reminderEvery: {
                    every: Number(newVal),
                    unit: reminderConditions.reminderEvery.unit,
                  },
                }
              }
            "
          >
            Remind every <span class="text-primary">(required)</span>
          </BaseInput>
        </div>
        <div class="v-col pt-10">
          <v-select
            :items="ReminderEverySchema.shape.unit.options"
            variant="solo-filled"
            flat
            :model-value="reminderConditions.reminderEvery.unit"
            density="comfortable"
            @update:model-value="
              newVal => {
                reminderConditions = {
                  ...reminderConditions,
                  reminderEvery: {
                    every: reminderConditions.reminderEvery.every,
                    unit: newVal,
                  },
                }
              }
            "
          ></v-select>
        </div>
      </div>
    </v-card>
    <v-card class="wrapper mt-4" width="100%" flat>
      <div class="pb-2 form-label text-label">
        Ends <span class="text-primary">(required)</span>
      </div>
      <div class="v-row">
        <div class="v-col">
          <v-radio-group
            v-model="frequencyRadio"
            @update:model-value="handleRadioButtonUpdate"
          >
            <v-radio
              v-for="option in frequencyEndOptions"
              :key="option.label"
              :label="option.label"
              :value="option.value"
            ></v-radio>
          </v-radio-group>
        </div>
        <div class="v-col">
          <VueDatePicker
            v-if="frequencyRadio === 'on'"
            v-model="date"
            :teleport="true"
            text-input
            format="dd/MM/yyyy HH:mm"
            @update:model-value="handleDatePickerUpdate"
          ></VueDatePicker>
          <div v-show="frequencyRadio === 'after'">
            <BaseInput
              type="number"
              name="occurences-count"
              :value="occurencesCount.toString()"
              class="base-input"
              @update="handleOccurrencesCountUpdate"
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
import { capitalize } from 'radash'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import {
  ReminderEverySchema,
  ReminderCondition,
  ReminderEndCondition,
} from '@intake24-dietician/common/entities-new/preferences.dto'

const props = withDefaults(
  defineProps<{ defaultState: ReminderCondition; hideLabel?: boolean }>(),
  { hideLabel: false },
)
const emit = defineEmits<{ update: [reminderConditions: ReminderCondition] }>()

// eslint-disable-next-line vue/no-setup-props-destructure
const reminderConditions = ref<ReminderCondition>(props.defaultState)

const frequencyEndOptions = ReminderEndCondition.options.map(type => ({
  label: capitalize(type.shape.type.value),
  value: type.shape.type.value,
}))

const frequencyRadio = ref<(typeof frequencyEndOptions)[number]['value']>(
  frequencyEndOptions[0]!.value,
)

const date = ref()
const occurencesCount = ref(0)

const handleRadioButtonUpdate = (
  value: (typeof frequencyEndOptions)[number]['value'],
) => {
  if (value === 'never') {
    reminderConditions.value = {
      ...reminderConditions.value,
      reminderEnds: {
        type: value,
      },
    }
  }
}

const handleDatePickerUpdate = (date: Date) => {
  reminderConditions.value = {
    ...reminderConditions.value,
    reminderEnds: {
      type: 'on',
      date: date.toISOString(),
    },
  }
}

const handleOccurrencesCountUpdate = (newVal: string) => {
  occurencesCount.value = Number(newVal)
  reminderConditions.value = {
    ...reminderConditions.value,
    reminderEnds: {
      type: 'after',
      occurrences: Number(newVal),
    },
  }
}

watch(
  () => reminderConditions.value,
  newVal => {
    emit('update', newVal)
  },
  { deep: true },
)

watch(
  () => props.defaultState,
  newVal => {
    if (!newVal) return

    reminderConditions.value = newVal

    // Update radio button
    frequencyRadio.value = frequencyEndOptions.find(
      option => option.value === newVal.reminderEnds.type,
    )!.value

    // Update conditional values
    if (newVal.reminderEnds.type === 'on') {
      date.value = new Date(newVal.reminderEnds.date)
    }

    if (newVal.reminderEnds.type === 'after') {
      occurencesCount.value = newVal.reminderEnds.occurrences
    }
  },
)
</script>

<style scoped lang="scss">
.wrapper {
  background-color: inherit;
}
.subheading {
  color: #555;
  font-family: Roboto;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 135%;
  letter-spacing: 0.14px;
}

.text-label {
  color: #555;
  font-family: Roboto;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.card {
  border: 0.5px solid rgba(0, 0, 0, 0.25);
}
</style>
