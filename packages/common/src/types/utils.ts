export type ValueOf<T> = T[keyof T]

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}
