import type { IRecall } from 'src/types/recall'
import { z } from 'zod'

// this type is called by Intake24
// TODO: consider checking this using a zod schema
export const RecallCreateDtoSchema = z.any().transform(val => val as IRecall)

export type RecallCreateDto = z.infer<typeof RecallCreateDtoSchema>

export const RecallDtoSchema = z.object({
  id: z.number(),
  recall: z.any().transform(val => val as IRecall),
})

export type RecallDto = z.infer<typeof RecallDtoSchema>
