import { z } from 'zod'
import { SurveyPreferenceSchema } from './preferences.dto'

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
    name: z.string(),
    description: z.string(),
  })

export type SurveyFeedbackModuleDto = z.infer<
  typeof SurveyFeedbackModuleDtoSchema
>

export const SurveyCreateDtoSchema = z.object({
  surveyName: z.string().min(1, 'Clinic name is required'),
  intake24SurveyId: z.string().min(1, 'Intake24 survey ID is required'),
  intake24Secret: z.string().min(1, 'Intake24 secret is required'),
  alias: z.string().min(1, 'Alias is required'),
  recallSubmissionURL: z.string(),
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
