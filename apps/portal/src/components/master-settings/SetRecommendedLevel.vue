<template>
  <!-- <div class="text feedback-heading">
    Customise the recommended level and the default messages according to your
    patient's profile
  </div> -->
  <!-- <div v-if="feedback" class="d-flex justify-space-between align-center px-5">
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
        <h3 class="my-3">Add new age range</h3>
        <v-row>
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

        <h3 class="my-3">Add recommendation level</h3>
        Expr: {{ expr }}
        <v-row>
          <v-col>
            <v-text-field
              v-model="formula.value"
              name="formula-value"
              placeholder="Recommendation formula"
              variant="outlined"
            />
          </v-col>
          <v-col>
            <div>
              <v-select
                v-model="formula.variable"
                variant="outlined"
                label="Variable"
                :items="formulaVariables"
                :item-props="variableProps"
              />
              <v-btn color="secondary" @click="handleInsertFormula">
                Insert variable
              </v-btn>
            </div>
          </v-col>
          <v-col>
            <div>
              <v-select
                v-model="formula.gender"
                variant="outlined"
                label="Gender"
                :items="genders"
              />
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="male"
              readonly
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
              readonly
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
              readonly
              name="other"
              type="number"
              :error-messages="otherErrMsg"
              placeholder="Not specified"
              variant="outlined"
            />
          </v-col>
        </v-row>
        Recommended levels: {{ recommendedLevels }} <br /><br />
        Formula: {{ formula }}

        <h3 class="my-3">Variable Placeholders</h3>
        <v-row>
          <v-col>
            <v-text-field
              v-model="variablePreviews['Height (cm)']"
              label="Height (cm)"
              placeholder="Height (cm)"
              variant="outlined"
              suffix="cm"
            />
          </v-col>
          <v-col>
            <v-text-field
              v-model="variablePreviews['Weight (kg)']"
              label="Weight (kg)"
              placeholder="Weight (kg)"
              variant="outlined"
              suffix="kg"
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
  </div> -->
  <div v-if="feedback">
    <div class="text feedback-heading">Feedback message if:</div>
    <div class="px-4">
      <p class="text-primary font-weight-medium">
        {{ feedback.name }} is above recommended level
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
        {{ feedback.name }} is below recommended level
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
import { computed, ref, watch } from 'vue'
import { useField, useForm } from 'vee-validate'
import { VTextField } from 'vuetify/lib/components/index.mjs'
import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import Mexp from 'math-expression-evaluator'

type VariablePreview = Record<
  (typeof formulaVariables)[number]['title'],
  number
>

const mexp = new Mexp()

function variableProps(variable: { title: string; subtitle: string }) {
  return {
    title: variable.title,
    subtitle: variable.subtitle,
  }
}

const feedback = defineModel<FeedbackAboveAndBelowRecommendedLevels>()

const genders = ['Male', 'Female', 'Other'] as const
const formulaVariables = [
  { title: 'Height (cm)', subtitle: 'H' },
  { title: 'Weight (kg)', subtitle: 'W' },
] as const
const formula = ref<{
  variable: (typeof formulaVariables)[number]['title']
  value: string
  gender: (typeof genders)[number]
}>({
  variable: formulaVariables[0].title,
  value: '',
  gender: 'Male',
})
const variablePreviews = ref<VariablePreview>({
  'Height (cm)': 170,
  'Weight (kg)': 70,
})
const recommendationLevel = ref('')

const errorMessage = ref('')

const replaceVariablesWithValues = (expression: string) => {
  return expression
    .replace(/H/g, variablePreviews.value['Height (cm)'].toString())
    .replace(/W/g, variablePreviews.value['Weight (kg)'].toString())
}

const expr = computed(() => {
  try {
    const lexed = mexp.lex(replaceVariablesWithValues(formula.value.value))
    const postfixed = mexp.toPostfix(lexed)
    const result = mexp.postfixEval(postfixed)

    return result
  } catch (e) {
    console.log({ e })
  }

  return 'Invalid expression'
})

const ageRangeSchema = yup
  .object()
  .shape({
    start: yup
      .number()
      .typeError('Start age must be a number')
      .required()
      .min(0),
    end: yup
      .number()
      .typeError('End age must be a number')
      .required()
      .positive(),
    male: yup
      .number()
      .typeError('Male value must be a number')
      .required()
      .positive(),
    female: yup
      .number()
      .typeError('Female value must be a number')
      .required()
      .positive(),
    other: yup
      .number()
      .typeError('Other value must be a number')
      .required()
      .positive(),
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
  newRange: ageRangeSchema.test(
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

const handleInsertFormula = () => {
  formula.value = {
    ...formula.value,
    value:
      formula.value.value +
      formulaVariables.find(v => v.title === formula.value.variable)?.subtitle,
  }
}

watch(
  () => formula.value.value,
  newValue => {
    if (expr.value === 'Invalid expression') return

    switch (formula.value.gender) {
      case 'Male':
        setFieldValue('newRange.male', expr.value)
        break
      case 'Female':
        setFieldValue('newRange.female', expr.value)
        break
      case 'Other':
        setFieldValue('newRange.other', expr.value)
        break
      default:
        break
    }
  },
)

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
