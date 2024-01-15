import { integer, pgTable, serial } from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
import { relations } from 'drizzle-orm'
import { DraftCreateDtoSchema } from '@intake24-dietician/common/entities-new/feedback.dto'
import { typedJsonbFromSchema } from './modelUtils'
import { patients } from './user.model'
import { pgEnum } from 'drizzle-orm/pg-core'

export const feedbackDrafts = pgTable('feedback_draft', {
  id: serial('id').primaryKey(),
  draft: typedJsonbFromSchema(DraftCreateDtoSchema)('draft').notNull(),
  patientId: integer('patient_id')
    .references(() => patients.id)
    .notNull(),
  ...timestampFields,
})
export const feedbackDraftRelations = relations(feedbackDrafts, ({ one }) => ({
  patient: one(patients, {
    fields: [feedbackDrafts.patientId],
    references: [patients.id],
  }),
}))

export const shareTypeEnum = pgEnum('share_type', ['Auto', 'Tailored'])
export const feedbackShares = pgTable('feedback_shared', {
  id: serial('id').primaryKey(),
  shared: typedJsonbFromSchema(DraftCreateDtoSchema)('shared').notNull(),
  patientId: integer('patient_id')
    .references(() => patients.id)
    .notNull(),
  shareType: shareTypeEnum('share_type').notNull(),
  ...timestampFields,
})
export const feedbackSharedRelations = relations(feedbackShares, ({ one }) => ({
  patient: one(patients, {
    fields: [feedbackShares.patientId],
    references: [patients.id],
  }),
}))
