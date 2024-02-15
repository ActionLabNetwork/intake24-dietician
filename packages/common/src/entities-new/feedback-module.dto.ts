import { z } from 'zod'
import { NutrientTypeDtoSchema } from './nutrient-types.dto'

export const FeedbackModuleDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type FeedbackModule = z.infer<typeof FeedbackModuleDtoSchema>

export const FeedbackModuleWithNutrientTypesDtoSchema =
  FeedbackModuleDtoSchema.merge(
    z.object({ nutrientTypes: z.array(NutrientTypeDtoSchema) }),
  )
export type FeedbackModuleWithNutrientTypes = z.infer<
  typeof FeedbackModuleWithNutrientTypesDtoSchema
>
