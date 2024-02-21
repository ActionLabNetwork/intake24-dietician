import { customType } from 'drizzle-orm/pg-core'
import type { z } from 'zod'

export function typedJsonbFromSchema<T>(schema: z.Schema<T>) {
  return customType<{ data: T; driverData: string }>({
    dataType: () => 'jsonb',
    toDriver: (value: T) => JSON.stringify(value),
    fromDriver: (value: string) => schema.parse(JSON.parse(value)),
  })
}

export const byteaAsBase64 = customType<{ data: string; driverData: Buffer }>({
  dataType: () => 'bytea',
  toDriver: val => {
    return Buffer.from(val, 'base64')
  },
  fromDriver: (value: Buffer) => value.toString('base64'),
})
