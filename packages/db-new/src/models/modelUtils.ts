import { customType } from "drizzle-orm/pg-core"
import type { z } from "zod"

export function typedJsonbFromSchema<T>(schema: z.Schema<T>) {
  return customType<{data: T, driverData: string}>({
    dataType: () => 'jsonb',
    toDriver: (value: T) => JSON.stringify(value),
    fromDriver: (value: string) => schema.parse(JSON.parse(value))
  })
}