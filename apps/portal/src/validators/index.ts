export const validateWithZod = <T extends Zod.ZodTypeAny>(
  schema: T,
  value: string,
) => {
  const result = schema.safeParse(value)
  if (result.success) {
    return true
  } else {
    const issue = result.error.issues[0]
    return issue ? issue.message : 'Invalid value'
  }
}
