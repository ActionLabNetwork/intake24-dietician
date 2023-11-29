import { ZodSchema, z } from 'zod'

type Schema<T extends readonly (keyof any)[]> = {
  [K in T[number]]: ZodSchema<any>
}

interface FormSchema<T extends readonly (keyof any)[]> {
  fields: T
  schema: Schema<T>
  zodSchema: ZodSchema<any>
}

export const createFormSchema = <T extends readonly (keyof any)[]>(
  fields: T,
  schema: Schema<T>,
): FormSchema<T> => {
  return { fields, schema, zodSchema: z.object(schema) }
}
