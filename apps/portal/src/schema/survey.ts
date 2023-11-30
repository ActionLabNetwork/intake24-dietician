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

export const SurveyConfigurstionSchemaDetails = createFormSchema(
  ['name', 'status', 'alias'] as const,
  {
    name: z.string().min(1, 'Name is required'),
    status: z.string(),
    alias: z.string(),
  },
)
