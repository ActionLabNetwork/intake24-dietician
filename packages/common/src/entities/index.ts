export function createDTO<T>(details: T): T {
  return {
    ...details,
  }
}
