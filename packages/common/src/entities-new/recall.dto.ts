import { z } from 'zod'
import { RecallSchema } from './recall.schema'

export const RecallDtoSchema = z.object({
  id: z.number(),
  recall: RecallSchema,
})

export type RecallDto = z.infer<typeof RecallDtoSchema>
