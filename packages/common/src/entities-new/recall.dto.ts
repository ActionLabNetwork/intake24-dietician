import { z } from 'zod'
import { RecallSchema } from './recall.schema'

export const RecallDtoSchema = z.object({
  id: z.number(),
  recall: RecallSchema,
})
export type RecallDto = z.infer<typeof RecallDtoSchema>

export const RecallDatesDtoSchema = z.object({
  id: z.number(),
  recall: z.object({
    id: z.number(),
    i24Id: z.string(),
    startTime: z.date(),
    endTime: z.date(),
  }),
})
export type RecallDatesDto = z.infer<typeof RecallDatesDtoSchema>
