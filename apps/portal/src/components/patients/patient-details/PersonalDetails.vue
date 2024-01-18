<template>
  <div>
    <p class="font-weight-medium">Personal details</p>
    <v-card :width="mdAndUp ? '100%' : '100%'" class="mt-5">
      <v-container>
        <v-row dense align="center">
          <v-col cols="12" md="6">
            <!-- DateOfBirth -->
            <span class="form-label"> Date of Birth: </span>
            <VueDatePicker
              :model-value="
                formValues.dateOfBirth === ''
                  ? undefined
                  : moment(formValues.dateOfBirth, 'DD/MM/YYYY').toDate()
              "
              :enable-time-picker="false"
              :max-date="moment(new Date()).subtract(1, 'day').toDate()"
              @update:model-value="
                val =>
                  handleFieldUpdate(
                    'dateOfBirth',
                    (val && moment(val).format('DD/MM/YYYY')) || '',
                  )
              "
            />
          </v-col>
          <v-col cols="12" md="6">
            <!-- Gender -->
            <div class="form-label pl-2 pb-2">Gender:</div>
            <v-select
              :items="genders"
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
              @update="newVal => handleFieldUpdate('height', parseInt(newVal))"
            >
              <span class="input-label"> Height: </span>
            </BaseInput>
          </v-col>
          <v-col cols="12" md="6">
            <!-- Weight -->
            <WeightHistory
              :model-value="formValues.weightHistory"
              @update="val => handleFieldUpdate('weightHistory', val)"
            />
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
    <v-card :width="mdAndUp ? '100%' : '100%'" class="mt-5">
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
import VueDatePicker from '@vuepic/vue-datepicker'
import moment from 'moment'
import WeightHistory from './WeightHistory.vue'
import { useDisplay } from 'vuetify'
import { ref } from 'vue'
import {
  Gender,
  genders,
} from '@intake24-dietician/common/entities-new/user.dto'

export interface PersonalDetailsFormValues {
  dateOfBirth: string
  gender: Gender
  height: number
  weightHistory: { timestamp: Date; weight: number }[]
  additionalNotes: string
  patientGoal: string
}

const props = defineProps<{
  defaultState: PersonalDetailsFormValues
}>()

const emit = defineEmits<{
  update: [value: PersonalDetailsFormValues]
}>()

const { mdAndUp } = useDisplay()

// const { t } = useI18n<i18nOptions>()

// eslint-disable-next-line vue/no-setup-props-destructure
const formValues = ref<PersonalDetailsFormValues>(props.defaultState)

const handleFieldUpdate = <K extends keyof PersonalDetailsFormValues>(
  fieldName: K,
  newVal: PersonalDetailsFormValues[K],
) => {
  formValues.value[fieldName] = newVal
  emit('update', { ...formValues.value })
  // if (isNumericField(fieldName)) {
  //   formValues.value[fieldName] = numericValue
  //   emit('update', { ...formValues.value })
  // } else if (fieldName === 'gender') {
  //   formValues.value[fieldName] = newVal as (typeof genders)[number]
  //   emit('update', { ...formValues.value })
  // } else if (fieldName === 'weightHistory') {

  // }
}
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

.dp__theme_light {
  --dp-background-color: rgb(246, 246, 246);
  --dp-border-color: #ffffff00;
  --dp-input-padding: 14px 30px;
}
</style>
