import { z } from 'zod'
import { SurveyPreferenceSchema } from './preferences.dto'
import { moduleNames } from '../types/modules'

export const SurveyFeedbackModuleCreateDtoSchema = z.object({
  feedbackModuleId: z.number(),
  isActive: z.boolean(),
  feedbackBelowRecommendedLevel: z.string(),
  feedbackAboveRecommendedLevel: z.string(),
})

export type SurveyFeedbackModuleCreateDto = z.infer<
  typeof SurveyFeedbackModuleCreateDtoSchema
>

export const SurveyFeedbackModuleDtoSchema =
  SurveyFeedbackModuleCreateDtoSchema.extend({
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

export const SurveyCreateDtoSchema = z.object({
  surveyName: z.string().min(1, 'Clinic name is required'),
  intake24Host: z.string().url(),
  intake24SurveyId: z.string().min(1, 'Intake24 survey ID is required'),
  intake24Secret: z.string().min(1, 'Intake24 secret is required'),
  alias: z.string().min(1, 'Alias is required'),
  isActive: z.boolean(),
  // The survey creation process is multi-step so this can take optional values
  surveyPreference: SurveyPreferenceSchema.optional(),
  feedbackModules: SurveyFeedbackModuleCreateDtoSchema.array().optional(),
})
export type SurveyCreateDto = z.infer<typeof SurveyCreateDtoSchema>

export const SurveyDtoSchema = SurveyCreateDtoSchema.extend({
  id: z.number(),
  surveyPreference: SurveyPreferenceSchema,
  feedbackModules: SurveyFeedbackModuleDtoSchema.array(),
})

export type SurveyDto = z.infer<typeof SurveyDtoSchema>

export const SurveyPlainDtoSchema = SurveyDtoSchema.omit({
  surveyPreference: true,
  feedbackModules: true,
})

export type SurveyPlainDto = z.infer<typeof SurveyPlainDtoSchema>
