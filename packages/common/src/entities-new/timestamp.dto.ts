import { z } from 'zod'

export const TimestampSchema = z.object({
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
})
