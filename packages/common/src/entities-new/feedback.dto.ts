import { z } from 'zod'
import { moduleNames } from '../types/modules'
import { TimestampSchema } from './timestamp.dto'

export type FeedbackType = 'Auto' | 'Tailored'

export const DraftCreateDtoSchema = z.object({
  recallDaterange: z.tuple([
    z.coerce.date().optional(),
    z.coerce.date().optional(),
  ]),
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

const ThresholdSchema = z.object({
  valuesBelow: z.number(),
  valuesAbove: z.number(),
})
export type Threshold = z.infer<typeof ThresholdSchema>

const FeedbackLevelSchema = z.object({
  below: z.string(),
  within: z.string(),
  above: z.string(),
  thresholds: ThresholdSchema,
})
export type FeedbackLevel = z.infer<typeof FeedbackLevelSchema>

const AgeRangeSchema = z.object({
  min: z.number().nonnegative(),
  max: z.number().nonnegative(),
})
export type AgeRange = z.infer<typeof AgeRangeSchema>

const AgeCategorySchema = z.record(
  z.string(),
  z.object({
    ageRange: AgeRangeSchema,
    feedbackLevel: FeedbackLevelSchema,
  }),
)
export type AgeCategory = z.infer<typeof AgeCategorySchema>

const GenderFeedbackSchema = z.object({
  male: AgeCategorySchema,
  female: AgeCategorySchema,
  notSpecified: AgeCategorySchema,
})
export type GenderFeedback = z.infer<typeof GenderFeedbackSchema>

export const FeedbackLevelRootSchema = z.object({
  rule: z.literal('range'), // Add additional rules here
  criteria: GenderFeedbackSchema,
})
export type FeedbackLevelRoot = z.infer<typeof FeedbackLevelRootSchema>
