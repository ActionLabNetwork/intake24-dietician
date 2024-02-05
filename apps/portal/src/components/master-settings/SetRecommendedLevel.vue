<template>
  <div class="text feedback-heading">
    Customise the recommended level and the default messages according to your
    patient's profile
  </div>
  <div v-if="feedback" class="d-flex justify-space-between align-center px-5">
    <div class="font-weight-medium d-flex align-center w-50">
      <p>Set recommendation level</p>
      <div class="mx-5">=</div>
      <v-text-field
        v-model="recommendationLevel"
        type="number"
        class="mt-5"
        variant="outlined"
        :suffix="feedback.nutrientTypes?.[0]?.unit.symbol ?? ''"
      ></v-text-field>
    </div>
    <div>
      <BaseButton>Reset values</BaseButton>
    </div>
  </div>
  <div class="py-5 pb-10">
    {{ newRange }}
    <div>
      <v-table class="pa-5">
        <thead>
          <tr>
            <th scope="col" class="text-left">Age Range</th>
            <th scope="col" class="text-left">Male</th>
            <th scope="col" class="text-left">Female</th>
            <th scope="col" class="text-left">Not specified</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(range, index) in ageRanges" :key="index">
            <td>{{ range.start }} - {{ range.end }}</td>
            <td>{{ range.male }}</td>
            <td>{{ range.female }}</td>
            <td>{{ range.other }}</td>
          </tr>
        </tbody>
      </v-table>

      <form class="px-5" @submit.prevent="onSubmit">
        <h3>Add new age range</h3>
        {{ errors }}
        {{ ageRanges.at(-1) }}
        <v-row class="mt-2">
          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="start"
              name="start"
              type="number"
              :error-messages="startErrMsg"
              placeholder="Start age"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="end"
              name="end"
              type="number"
              placeholder="End age"
              :error-messages="endErrMsg"
              variant="outlined"
            />
          </v-col>
        </v-row>
        <h3>Add recommendation level</h3>
        <v-row>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="male"
              name="male"
              type="number"
              :error-messages="maleErrMsg"
              placeholder="Male"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="female"
              name="female"
              type="number"
              :error-messages="femaleErrMsg"
              placeholder="Female"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="other"
              name="other"
              type="number"
              :error-messages="otherErrMsg"
              placeholder="Not specified"
              variant="outlined"
            />
          </v-col>
        </v-row>
        <v-btn class="bg-primary" @click.prevent="addRange">Add Range</v-btn>
        <v-btn class="ml-2 bg-secondary" @click="deleteLatestRange">
          Delete Latest Range
        </v-btn>
        <p v-if="errorMessage">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
  <div v-if="feedback && recommendationLevel">
    <div class="text feedback-heading">Feedback message if:</div>
    <div class="px-4">
      <p class="text-primary font-weight-medium">
        {{ feedback.name }} is above {{ recommendationLevel }}
        {{ feedback.nutrientTypes?.[0]?.unit.symbol }}
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
        {{ feedback.name }} is below {{ recommendationLevel }}
        {{ feedback.nutrientTypes?.[0]?.unit.symbol }}
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
import { computed, ref } from 'vue'
import z from 'zod'
import { useField, useForm } from 'vee-validate'
import { VTextField } from 'vuetify/lib/components/index.mjs'
import { toTypedSchema } from '@vee-validate/zod'

const feedback = defineModel<FeedbackAboveAndBelowRecommendedLevels>()
const recommendationLevel = ref('')

const ageRanges = ref([
  { start: 0, end: 12, male: 100, female: 100, other: 100 },
  { start: 13, end: 20, male: 150, female: 100, other: 100 },
  { start: 21, end: 30, male: 180, female: 100, other: 100 },
])

// const newRange = ref({
//   start: null,
//   end: null,
//   male: null,
//   female: null,
//   other: null,
// })

const errorMessage = ref('')

const getAgeRangeSchema = () => {
  return z.object({
    start: z
      .number()
      .nonnegative()
      .min(
        (ageRanges.value.at(-1)?.end ?? 0) + 1,
        `Start must be at least ${(ageRanges.value.at(-1)?.end ?? 0) + 1}`,
      ),
    end: z.number().nonnegative(),
    male: z.number().nonnegative(),
    female: z.number().nonnegative(),
    other: z.number().nonnegative(),
  })
}

const ageRangeSchema = ref(
  z.object({
    start: z
      .number()
      .nonnegative()
      .min(
        (ageRanges.value.at(-1)?.end ?? 0) + 1,
        `Start must be at least ${(ageRanges.value.at(-1)?.end ?? 0) + 1}`,
      ),
    end: z.number().nonnegative(),
    male: z.number().nonnegative(),
    female: z.number().nonnegative(),
    other: z.number().nonnegative(),
  }),
)

const {
  handleSubmit,
  errors,
  values: newRange,
  resetForm,
} = useForm({
  validationSchema: toTypedSchema(ageRangeSchema.value),
})

const { value: start, errorMessage: startErrMsg } = useField('start')
const { value: end, errorMessage: endErrMsg } = useField('end')
const { value: male, errorMessage: maleErrMsg } = useField('male')
const { value: female, errorMessage: femaleErrMsg } = useField('female')
const { value: other, errorMessage: otherErrMsg } = useField('other')

const addRange = () => {
  errorMessage.value = ''
  if (!newRange.start || !newRange.end) return

  // if (newRange.value.start >= newRange.value.end) {
  //   errorMessage.value = 'Start age must be less than end age.'
  //   return
  // }

  // for (let range of ageRanges.value) {
  //   if (
  //     newRange.value.start <= range.end &&
  //     newRange.value.end >= range.start
  //   ) {
  //     errorMessage.value = 'Age ranges cannot overlap.'
  //     return
  //   }
  // }

  ageRanges.value.push({
    start: newRange.start,
    end: newRange.end,
    male: newRange.male ?? 0,
    female: newRange.female ?? 0,
    other: newRange.other ?? 0,
  })

  resetForm()
  ageRanges.value.sort((a, b) => a.start - b.start)

  // Update the validation schema
  ageRangeSchema.value = getAgeRangeSchema()
  const form = useForm({
    validationSchema: toTypedSchema(ageRangeSchema.value),
  })
}

const deleteLatestRange = () => {
  // Check if there's at least one range to delete
  if (ageRanges.value.length > 0) {
    ageRanges.value.pop() // Remove the last age range
  } else {
    errorMessage.value = 'No age ranges to delete.'
  }
}

const onSubmit = handleSubmit(values => {
  console.log(values)
})
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
