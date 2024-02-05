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
    {{ recommendedLevels }}
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
          <tr v-for="(range, index) in recommendedLevels.ranges" :key="index">
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
        {{ recommendedLevels.ranges?.at(-1) }}
        <v-row class="mt-2">
          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="start"
              name="start"
              type="number"
              :error-messages="startErrMsg || errors.newRange"
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
import { ref } from 'vue'
import { useField, useForm } from 'vee-validate'
import { VTextField } from 'vuetify/lib/components/index.mjs'
import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const feedback = defineModel<FeedbackAboveAndBelowRecommendedLevels>()
const recommendationLevel = ref('')

const errorMessage = ref('')

const ageRangeSchema = yup
  .object()
  .shape({
    start: yup.number().required().min(0),
    end: yup.number().required().positive(),
    male: yup.number().required().positive(),
    female: yup.number().required().positive(),
    other: yup.number().required().positive(),
  })
  .test(
    'start-end',
    'Start age must be less than end age.',
    function (value: { start: number; end: number }) {
      return value.start < value.end
    },
  )

const validationSchema = yup.object().shape({
  ranges: yup.array().of(ageRangeSchema),
  newRange: yup
    .object()
    .shape({
      start: yup.number().required().positive(),
      end: yup.number().required().positive(),
      male: yup.number().required().positive(),
      female: yup.number().required().positive(),
      other: yup.number().required().positive(),
    })
    .test(
      'newRange-start-validation',
      `Start age must be at least one more than the last age value in the age range`,
      function (value) {
        const ranges = this.parent.ranges
        if (ranges && ranges.length > 0) {
          const lastRange = ranges[ranges.length - 1]
          return value.start > lastRange.end
        }
        return true
      },
    ),
})

const {
  handleSubmit,
  errors,
  values: recommendedLevels,
  setFieldValue,
  resetForm,
} = useForm({
  validationSchema: toTypedSchema(validationSchema),
  initialValues: {
    ranges: [
      { start: 0, end: 12, male: 100, female: 100, other: 100 },
      { start: 13, end: 20, male: 150, female: 100, other: 100 },
      { start: 21, end: 30, male: 180, female: 100, other: 100 },
    ],
    newRange: {
      start: undefined,
      end: undefined,
      male: undefined,
      female: undefined,
      other: undefined,
    },
  },
})

const { value: start, errorMessage: startErrMsg } = useField('newRange.start')
const { value: end, errorMessage: endErrMsg } = useField('newRange.end')
const { value: male, errorMessage: maleErrMsg } = useField('newRange.male')
const { value: female, errorMessage: femaleErrMsg } =
  useField('newRange.female')
const { value: other, errorMessage: otherErrMsg } = useField('newRange.other')

const addRange = handleSubmit(() => {
  errorMessage.value = ''
  if (
    !recommendedLevels.newRange?.start ||
    !recommendedLevels.newRange?.end ||
    !recommendedLevels.ranges
  )
    return

  setFieldValue('ranges', [
    ...recommendedLevels.ranges,
    {
      start: recommendedLevels.newRange.start,
      end: recommendedLevels.newRange.end,
      male: recommendedLevels.newRange.male ?? 0,
      female: recommendedLevels.newRange.female ?? 0,
      other: recommendedLevels.newRange.other ?? 0,
    },
  ])

  recommendedLevels.ranges?.push({
    start: recommendedLevels.newRange.start,
    end: recommendedLevels.newRange.end,
    male: recommendedLevels.newRange.male ?? 0,
    female: recommendedLevels.newRange.female ?? 0,
    other: recommendedLevels.newRange.other ?? 0,
  })

  recommendedLevels.ranges?.sort((a, b) => a.start - b.start)
})

const deleteLatestRange = () => {
  if (!recommendedLevels.ranges) return

  if (recommendedLevels.ranges.length > 0) {
    setFieldValue('ranges', recommendedLevels.ranges.slice(0, -1))
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
