export type WithoutTimestamps<T> = Omit<T, 'updatedAt' | 'createdAt'>
export type WithoutIDAndTimestamps<
  T,
  ID extends keyof T = 'id' extends keyof T ? 'id' : never,
> = Omit<WithoutTimestamps<T>, ID>

export type WithoutIDAndTimestampsSimple<T> = Omit<WithoutTimestamps<T>, 'id'>
