// export const units = ['days', 'weeks', 'months'] as const
// export const reminderEndsTypes = ['never', 'on', 'after'] as const

// export type Unit = 'days' | 'weeks' | 'months'
// type ReminderEndsType = (typeof reminderEndsTypes)[number]

// interface ReminderEvery {
//   quantity: number
//   unit: Unit
// }

// interface ReminderEndsNever {
//   type: Extract<ReminderEndsType, 'never'>
// }

// interface ReminderEndsOn {
//   type: Extract<ReminderEndsType, 'on'>
//   date: string // Date in ISO 8601 format e.g., YYYY-MM-DD
// }

// interface ReminderEndsAfter {
//   type: Extract<ReminderEndsType, 'after'>
//   occurrences: number
// }

// type ReminderEnds = ReminderEndsNever | ReminderEndsOn | ReminderEndsAfter

// export interface ReminderConditions {
//   reminderEvery: ReminderEvery
//   reminderEnds: ReminderEnds
// }
