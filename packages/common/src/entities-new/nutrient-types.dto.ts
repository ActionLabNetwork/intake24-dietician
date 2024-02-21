import { z } from 'zod'

export const NutrientTypeDtoSchema = z.object({
  id: z.number(),
  feedbackModuleId: z.number(),
  nutrientTypeId: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type NutrientTypeDto = z.infer<typeof NutrientTypeDtoSchema>
