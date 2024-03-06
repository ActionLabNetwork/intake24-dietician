import { z } from 'zod'
import { createFormSchema } from '../types/validation.types'

// export const genders = ['Male', 'Female', 'Other'] as const
// export const reminderUnits = ['days', 'weeks', 'months'] as const

// export type Gender = (typeof genders)[number]

export const SurveyConfigurstionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  status: z.string(),
  alias: z.string(),
})

export const SurveyConfigurationSchemaDetails = createFormSchema(
  [
    'name',
    'intake24SurveyId',
    'intake24Secret',
    'alias',
    'recallSubmissionUrl',
  ] as const,
  {
    name: z.string().min(1, 'Name is required'),
    intake24SurveyId: z.string().min(1, 'Intake24 Survey Id is required'),
    intake24Secret: z.string().min(1, 'Intake24 Secret is required'),
    alias: z.string().min(1, 'Alias is required'),
    recallSubmissionUrl: z.string().min(1, 'Recall Submission Url is required'),
  },
)
