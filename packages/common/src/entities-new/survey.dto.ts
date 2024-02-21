import { z } from 'zod'
import { SurveyPreferenceSchema } from './preferences.dto'
import { moduleNames } from '../types/modules'

// TODO: Remove name, description, nutrientTypes from here as it should be derived from the created feedback modules
export const SurveyFeedbackModuleCreateDtoSchema = z.object({
  name: z.string(),
  description: z.string(),
  feedbackModuleId: z.number(),
  isActive: z.boolean(),
  feedbackBelowRecommendedLevel: z.string(),
  feedbackAboveRecommendedLevel: z.string(),
  nutrientTypes: z.array(
    z.object({
      id: z.number(),
      description: z.string(),
      unit: z.object({
        description: z.string(),
        symbol: z.string().nullable(),
      }),
    }),
  ),
})

export type SurveyFeedbackModuleCreateDto = z.infer<
  typeof SurveyFeedbackModuleCreateDtoSchema
>

// TODO: No longer needed since it is the same as Create
export const SurveyFeedbackModuleDtoSchema =
  SurveyFeedbackModuleCreateDtoSchema.extend({
    id: z.number(),
    name: z.enum(moduleNames),
    description: z.string(),
    nutrientTypes: z.array(
      z.object({
        id: z.number(),
        description: z.string(),
        unit: z.object({
          description: z.string(),
          symbol: z.string().nullable(),
        }),
      }),
    ),
  })

export type SurveyFeedbackModuleDto = z.infer<
  typeof SurveyFeedbackModuleDtoSchema
>

export const countryCodes = [
  {
    code: 'au',
    flag: '🇦🇺',
  },
  {
    code: 'my',
    flag: '🇲🇾',
  },
  {
    code: 'uk',
    flag: '🇬🇧',
  },
] as const

export const SurveyCreateDtoSchema = z.object({
  surveyName: z.string().min(1, 'Clinic name is required'),
  intake24Host: z.string().url(),
  intake24SurveyId: z.string().min(1, 'Intake24 survey ID is required'),
  intake24Secret: z.string().min(1, 'Intake24 secret is required'),
  countryCode: z
    .string()
    .refine(val => countryCodes.some(c => c.code === val), {
      message: `Invalid country code, please choose from ${countryCodes.map(c => c.code).join(', ')}`,
    }),
  alias: z.string().min(1, 'Alias is required'),
  isActive: z.boolean(),
  surveyPreference: SurveyPreferenceSchema,
  feedbackModules: SurveyFeedbackModuleCreateDtoSchema.array(),
})
export type SurveyCreateDto = z.infer<typeof SurveyCreateDtoSchema>

export const SurveyDtoSchema = SurveyCreateDtoSchema.extend({
  id: z.number(),
  surveyPreference: SurveyPreferenceSchema,
  feedbackModules: SurveyFeedbackModuleDtoSchema.array(),
})

export type SurveyDto = z.infer<typeof SurveyDtoSchema>

export const SurveyPlainDtoSchema = SurveyDtoSchema.omit({
  feedbackModules: true,
})

export type SurveyPlainDto = z.infer<typeof SurveyPlainDtoSchema>
