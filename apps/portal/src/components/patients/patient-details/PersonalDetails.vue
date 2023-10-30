<template>
  <div>
    <p class="font-weight-medium">Personal details</p>
    <v-card :width="mdAndUp ? '75%' : '100%'" class="mt-5">
      <v-container>
        <v-row dense align="center">
          <v-col cols="12" md="6">
            <!-- Age -->
            <BaseInput
              type="number"
              name="age"
              :value="formValues.age"
              class="base-input"
              suffix="yrs"
              @update="newVal => handleFieldUpdate('age', newVal)"
            >
              <span class="input-label"> Age: </span>
            </BaseInput>
          </v-col>
          <v-col cols="12" md="6">
            <!-- Gender -->
            <div class="form-label pl-2 pb-2">Gender:</div>
            <v-select
              :items="['male', 'female', 'other']"
              variant="solo-filled"
              flat
              :model-value="formValues.gender"
              @update:model-value="
                newVal => handleFieldUpdate('gender', newVal)
              "
            ></v-select>
          </v-col>
        </v-row>
        <v-divider class="my-3"></v-divider>
        <v-row dense align="center">
          <v-col cols="12" md="6">
            <!-- Height -->
            <BaseInput
              type="number"
              name="height"
              :value="formValues.height"
              class="base-input"
              suffix="kg"
              @update="newVal => handleFieldUpdate('height', newVal)"
            >
              <span class="input-label"> Height: </span>
            </BaseInput>
          </v-col>
          <v-col cols="12" md="6">
            <!-- Weight -->
            <BaseInput
              type="number"
              name="weight"
              :value="formValues.weight"
              class="base-input"
              suffix="cm"
              @update="newVal => handleFieldUpdate('weight', newVal)"
            >
              <span class="input-label"> Weight: </span>
            </BaseInput>
          </v-col>
        </v-row>
        <v-divider class="my-3"></v-divider>
        <div>
          <div class="form-label pl-2 pb-2">Additional notes:</div>
          <v-textarea
            v-model="formValues.additionalNotes"
            flat
            label="Write here..."
            variant="solo-filled"
            @update:model-value="
              (val: string) => handleFieldUpdate('additionalNotes', val)
            "
          ></v-textarea>
        </div>
      </v-container>
    </v-card>

    <p class="font-weight-medium mt-16">Patient goal</p>
    <v-card :width="mdAndUp ? '75%' : '100%'" class="mt-5">
      <v-container>
        <div>
          <v-textarea
            v-model="formValues.patientGoal"
            flat
            label="My goal is..."
            variant="solo-filled"
            @update:model-value="
              (val: string) => handleFieldUpdate('patientGoal', val)
            "
          ></v-textarea>
        </div>
      </v-container>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import BaseInput from '@/components/form/BaseInput.vue'
import { useDebounceFn } from '@vueuse/core'

import { useDisplay } from 'vuetify'

// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import { INPUT_DEBOUNCE_TIME } from '@/constants'
import { ref } from 'vue'

export interface PersonalDetailsFormValues {
  age: number
  gender: string
  height: number
  weight: number
  additionalNotes: string
  patientGoal: string
}

const props = defineProps<{
  defaultState: PersonalDetailsFormValues
}>()

const emit = defineEmits<{
  update: [value: PersonalDetailsFormValues]
}>()

const isNumericField = (
  field: keyof PersonalDetailsFormValues,
): field is 'age' | 'height' | 'weight' => {
  return ['age', 'height', 'weight'].includes(field)
}

const { mdAndUp } = useDisplay()

// const { t } = useI18n<i18nOptions>()

// eslint-disable-next-line vue/no-setup-props-destructure
const formValues = ref<PersonalDetailsFormValues>(props.defaultState)

const handleFieldUpdate = useDebounceFn(
  (fieldName: keyof PersonalDetailsFormValues, newVal: string) => {
    const numericValue = Number(newVal)

    if (isNumericField(fieldName)) {
      formValues.value[fieldName] = numericValue
      emit('update', { ...formValues.value })
    } else {
      formValues.value[fieldName] = newVal
      emit('update', { ...formValues.value })
    }
  },
  INPUT_DEBOUNCE_TIME,
)
</script>
<style scoped lang="scss">
.avatar {
  width: 100%;
  height: 100%;
  aspect-ratio: 1/1;
}

.input-label {
  color: #555555;

  &.suffix {
    color: #ee672d;
  }
}
</style>
