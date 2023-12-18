import { z } from 'zod'

export const SurveyCreateDto = z.object({
  dieticianId: z.number(),
  surveyName: z.string(),
  intake24SurveyId: z.string(),
  intake24Secret: z.string(),
  alias: z.string(),
  recallSubmissionURL: z.string(),
})
export type SurveyCreateDto = z.infer<typeof SurveyCreateDto>

export const SurveyDtoSchema = SurveyCreateDto.extend({
  id: z.number(),
})

export type SurveyDto = z.infer<typeof SurveyDtoSchema>
