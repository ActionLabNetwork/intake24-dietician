import { z } from 'zod'

export const SurveyCreateDtoSchema = z.object({
  surveyName: z.string(),
  intake24SurveyId: z.string(),
  intake24Secret: z.string(),
  alias: z.string(),
  recallSubmissionURL: z.string(),
  isActive: z.boolean(),
  // surveyPreference: SurveyPreferenceSchema // It's a multi-step form so we leave this empty for now
})
export type SurveyCreateDto = z.infer<typeof SurveyCreateDtoSchema>

export const SurveyDtoSchema = SurveyCreateDtoSchema.extend({
  id: z.number(),
})

export type SurveyDto = z.infer<typeof SurveyDtoSchema>
