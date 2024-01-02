import { z } from 'zod'
import { moduleRoutes } from '../types/modules'

export const DraftCreateDtoSchema = z.object({
  recallDate: z.coerce.date(),
  modules: z.array(
    z.object({
      key: z.enum(moduleRoutes),
      feedback: z.string(),
      selected: z.boolean(),
    }),
  ),
})
export type DraftCreateDto = z.infer<typeof DraftCreateDtoSchema>

export const DraftDtoSchema = z.object({
  id: z.number(),
  draft: DraftCreateDtoSchema,
  patientId: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type DraftDto = z.infer<typeof DraftDtoSchema>
