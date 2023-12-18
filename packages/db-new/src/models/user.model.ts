import {
  integer,
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
import { relations } from 'drizzle-orm'
import { tokens } from './token.model'
import { surveys } from './survey.model'
import { typedJsonbFromSchema } from './modelUtils'
import { PatientPreferenceSchema } from '@intake24-dietician/common/entities-new/preferences.dto'
// import { surveys } from './survey.model'
// import { patientPreferences } from './preferences.model'

export const genderEnum = pgEnum('gender', [
  'Male',
  'Female',
  'Non-binary',
  'Prefer not to say',
])

export const roleEnum = pgEnum('role', ['Dietician', 'Patient'])

const names = {
  firstName: text('first_name').default('').notNull(),
  middleName: text('middle_name').default('').notNull(),
  lastName: text('last_name').default('').notNull(),
}

export const users = pgTable('user', {
  id: serial('id').primaryKey(),
  ...timestampFields,
  email: text('email').unique().notNull(),
  password: text('password'),
  isVerified: boolean('is_verified').default(false).notNull(),
  // switch to https://stackoverflow.com/questions/76399047/how-to-represent-bytea-datatype-from-pg-inside-new-drizzle-orm?
  avatar: text('avatar'),
  role: roleEnum('role').notNull(),
  deletionDate: timestamp('deletion_date', {
    precision: 6,
    withTimezone: true,
  }),
})

export const userRelations = relations(users, ({ one, many }) => ({
  dietician: one(dieticians),
  patient: one(patients),
  token: many(tokens),
}))

export const dieticians = pgTable('dietician', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull()
    .unique(),
  ...names,
  mobileNumber: text('mobile_number'),
  businessNumber: text('business_number'),
  businessAddress: text('business_address'),
  shortBio: text('short_bio'),
  ...timestampFields,
})

export const dieticianRelations = relations(dieticians, ({ one, many }) => ({
  user: one(users, {
    fields: [dieticians.userId],
    references: [users.id],
  }),
  surveys: many(surveys),
}))

export const patients = pgTable('patient', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull()
    .unique(),
  surveyId: integer('survey_id')
    .references(() => surveys.id)
    .notNull(),
  ...names,
  mobileNumber: text('mobile_number'),
  address: text('address'),
  age: integer('age'),
  gender: genderEnum('gender'),
  height: integer('height'),
  weight: integer('weight'),
  additionalDetails: jsonb('additional_details'),
  additionalNotes: text('additional_notes'),
  patientGoal: text('patient_goal'),
  patientPreferences: typedJsonbFromSchema(PatientPreferenceSchema)('preference').notNull(),
  ...timestampFields,
})

export const patientRelations = relations(patients, ({ one }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),
  survey: one(surveys, {
    fields: [patients.surveyId],
    references: [surveys.id],
  })
}))
