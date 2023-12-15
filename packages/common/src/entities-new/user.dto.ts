import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { users, dieticians } from '@intake24-dietician/db-new/models/user.model'
import type { z } from 'zod'

// Zod Schemas
export const userInsert = createInsertSchema(users)
export const userSelect = createSelectSchema(users)

export const dieticianInsert = createInsertSchema(dieticians)
export const dieticianSelect = createSelectSchema(dieticians)

// TS Types
export type UserSelect = z.infer<typeof userSelect>
export type UserInsert = z.infer<typeof userInsert>

export type DieticianSelect = z.infer<typeof dieticianSelect>
export type DieticianInsert = z.infer<typeof dieticianInsert>
export type DieticianUpdate = Omit<
  Partial<z.infer<typeof dieticianSelect>>,
  'id'
>
