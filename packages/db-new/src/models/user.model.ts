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
import { byteaAsBase64, typedJsonbFromSchema } from './modelUtils'
import { PatientPreferenceSchema } from '@intake24-dietician/common/entities-new/preferences.dto'
import { recalls } from './recall.model'
// import { surveys } from './survey.model'
// import { patientPreferences } from './preferences.model'

export const genderEnum = pgEnum('gender', [
  'Male',
  'Female',
  'Non-binary',
  'Prefer not to say',
])

export const roleEnum = pgEnum('role', ['Dietician', 'Patient'])

export const users = pgTable('user', {
  id: serial('id').primaryKey(),
  ...timestampFields,
  email: text('email').unique().notNull(),
  password: text('password'),
  isVerified: boolean('is_verified').default(false).notNull(),
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
  firstName: text('first_name').notNull(),
  middleName: text('middle_name').notNull(),
  lastName: text('last_name').notNull(),
  mobileNumber: text('mobile_number').notNull(),
  businessNumber: text('business_number').notNull(),
  businessAddress: text('business_address').notNull(),
  shortBio: text('short_bio').notNull(),
  avatar: byteaAsBase64("avatar"),
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
  firstName: text('first_name').notNull(),
  middleName: text('middle_name').notNull(),
  lastName: text('last_name').notNull(),
  mobileNumber: text('mobile_number').notNull(),
  address: text('address').notNull(),
  age: integer('age').notNull(),
  gender: genderEnum('gender').notNull(),
  height: integer('height').notNull(),
  weight: integer('weight').notNull(),
  additionalDetails:
    jsonb('additional_details').$type<Record<string, unknown>>(),
  additionalNotes: text('additional_notes').notNull(),
  patientGoal: text('patient_goal').notNull(),
  avatar: byteaAsBase64("avatar"),
  patientPreference: typedJsonbFromSchema(PatientPreferenceSchema)(
    'preference',
  ).notNull(),
  ...timestampFields,
})

export const patientRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),
  survey: one(surveys, {
    fields: [patients.surveyId],
    references: [surveys.id],
  }),
  recalls: many(recalls)
}))
