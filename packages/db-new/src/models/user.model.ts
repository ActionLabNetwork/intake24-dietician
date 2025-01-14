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
import { recalls } from './recall.model'
import {
  WeightHistorySchema,
  genders,
} from '@intake24-dietician/common/entities-new/user.dto'
import { feedbackDrafts, feedbackShares } from './feedback.model'
// import { surveys } from './survey.model'
// import { patientPreferences } from './preferences.model'

export const genderEnum = pgEnum('gender', genders)

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
  isSuperuser: boolean('is_superuser').default(false).notNull(),
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
  middleName: text('middle_name'),
  lastName: text('last_name'),
  mobileNumber: text('mobile_number'),
  businessNumber: text('business_number'),
  businessAddress: text('business_address'),
  shortBio: text('short_bio'),
  avatar: text('avatar'),
  onboardingFinished: boolean('onboarding_finished').notNull(),
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
  dateOfBirth: text('date_of_birth').notNull(),
  gender: genderEnum('gender').notNull(),
  height: integer('height').notNull(),
  weightHistory:
    typedJsonbFromSchema(WeightHistorySchema)('weight_history').notNull(),
  additionalDetails:
    jsonb('additional_details').$type<Record<string, unknown>>(),
  additionalNotes: text('additional_notes').notNull(),
  patientGoal: text('patient_goal').notNull(),
  avatar: text('avatar'),
  patientPreference: typedJsonbFromSchema(PatientPreferenceSchema)(
    'preference',
  ).notNull(),
  lastReminderSent: timestamp('lastReminderSent'),
  isArchived: boolean('is_archived').default(false).notNull(),
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
  recalls: many(recalls),
  feedbackDrafts: many(feedbackDrafts),
  feedbackShares: many(feedbackShares),
}))
