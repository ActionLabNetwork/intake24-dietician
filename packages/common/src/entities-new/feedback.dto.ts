import { z } from 'zod'
import { moduleNames } from '../types/modules'
import { TimestampSchema } from './timestamp.dto'

export type FeedbackType = 'Auto' | 'Tailored'

export const DraftCreateDtoSchema = z.object({
  recallDate: z.coerce.date(),
  modules: z.array(
    z.object({
      key: z.enum(moduleNames),
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

export const SharedDtoSchema = z
  .object({
    id: z.number(),
    shared: DraftCreateDtoSchema,
    shareType: z.enum(['Auto', 'Tailored']),
    patientId: z.number(),
  })
  .extend(TimestampSchema.shape)
export type SharedDto = z.infer<typeof SharedDtoSchema>

export const FeedbackModuleDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
})
export type FeedbackModuleDto = z.infer<typeof FeedbackModuleDtoSchema>
