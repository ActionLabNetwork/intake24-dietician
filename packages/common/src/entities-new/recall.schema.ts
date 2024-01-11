import { z } from 'zod'

export const recordOfAnySchema = z.record(z.string(), z.any())

const UserAliasesSchema = z.object({
  id: z.string(),
  userId: z.string(),
  surveyId: z.string(),
  username: z.string(),
  uriAuthToken: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const RecallMealSchema = z.object({
  id: z.string(),
  surveySubmissionId: z.string(),
  name: z.string(),
  hours: z.number(),
  minutes: z.number(),
  duration: z.number().nullable(),
  customFields: z.array(recordOfAnySchema).nullable(),
  missingFoods: z.array(recordOfAnySchema).nullable(),
  foods: z.array(recordOfAnySchema),
})
export type RecallMeal = z.infer<typeof RecallMealSchema>

export const RecallPotionSizeSchema = z.object({
  id: z.string(),
  foodId: z.string(),
  name: z.string(),
  value: z.string(),
})

export const RecallNutrientSchema = z.object({
  id: z.string(),
  foodId: z.string(),
  amount: z.number(),
  nutrientTypeId: z.string(),
  nutrientType: z.object({
    id: z.string(),
    description: z.string(),
    unitId: z.string(),
  }),
})

export const RecallUserSchema = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  simpleName: z.string().optional().nullable(),
  multiFactorAuthentication: z.boolean().optional().nullable(),
  emailNotifications: z.boolean().optional().nullable(),
  smsNotifications: z.boolean().optional().nullable(),
  verifiedAt: z.coerce.date().optional().nullable(),
  disabledAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional().nullable(),
  updatedAt: z.coerce.date().optional().nullable(),
  aliases: UserAliasesSchema.array(),
  customFields: z.array(recordOfAnySchema).nullable(),
})

export const RecallMealFoodSchema = z.object({
  id: z.string(),
  parentId: z.string(),
  mealId: z.string(),
  index: z.number(),
  code: z.string(),
  englishName: z.string(),
  localeName: z.string().nullable(),
  readyMeal: z.boolean(),
  searchTerm: z.string().nullable(),
  portionSizeMethodId: z.string(),
  reasonableAmount: z.boolean(),
  foodGroupId: z.string(),
  foodGroupEnglishName: z.string(),
  foodGroupLocalName: z.string().nullable(),
  brand: z.string().nullable(),
  nutrientTableId: z.string(),
  nutrientTableCode: z.string(),
  barcode: z.string().nullable(),
  customFields: z.array(recordOfAnySchema).nullable(),
  fields: z.array(recordOfAnySchema).nullable(),
  portionSizes: z.array(RecallPotionSizeSchema),
  nutrients: z.array(RecallNutrientSchema),
})

export const RecallSchema = z.object({
  id: z.string(),
  surveyId: z.string(),
  userId: z.string(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  submissionTime: z.coerce.date(),
  log: recordOfAnySchema.nullable(),
  uxSessionId: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  user: RecallUserSchema,
  meals: z.array(RecallMealSchema),
  survey: z.object({
    id: z.string(),
    slug: z.string(),
  }),
  customFields: z.array(z.record(z.any())).nullable(),
})
export type Recall = z.infer<typeof RecallSchema>

export type RecallKeys = keyof z.infer<typeof RecallSchema>
export const RecallKeysSchema = z
  .string()
  .transform(str => {
    // Split the string by commas, trim each part, and return as an array
    return str.split(',').map(s => s.trim())
  })
  .refine(
    keys => {
      // Validate that each key is a valid key of RecallSchema
      return keys.every(key => Object.keys(RecallSchema.shape).includes(key))
    },
    {
      message: 'Invalid key found in the list',
    },
  )
