import { z } from 'zod'

export const ActionTokenActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('reset-password'),
  }),
  z.object({
    type: z.literal('passwordless-auth'),
  }),
  z.object({
    type: z.literal('verify-email'),
    email: z.string().email().nullable(),
  }),
])

export type ActionTokenAction = z.infer<typeof ActionTokenActionSchema>

export type ActionTokenActionType = ActionTokenAction['type']
