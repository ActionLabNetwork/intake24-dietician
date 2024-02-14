import { z } from 'zod'

export const FeedbackModuleDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type FeedbackModule = z.infer<typeof FeedbackModuleDtoSchema>
