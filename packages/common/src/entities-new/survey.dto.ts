import { z } from 'zod'

export const SurveyCreateDto = z.object({
  dieticianId: z.number().nullable(),
  surveyName: z.string().nullable(),
  intake24SurveyId: z.string().nullable(),
  intake24Secret: z.string().nullable(),
  alias: z.string().nullable(),
  recallSubmissionURL: z.string().nullable(),
})
export type SurveyCreateDto = z.infer<typeof SurveyCreateDto>

export const SurveyDtoSchema = SurveyCreateDto.extend({
  id: z.number(),
})
