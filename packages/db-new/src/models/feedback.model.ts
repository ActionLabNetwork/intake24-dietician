import { integer, pgTable, serial } from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
import { relations } from 'drizzle-orm'
import { DraftCreateDtoSchema } from '@intake24-dietician/common/entities-new/feedback.dto'
import { typedJsonbFromSchema } from './modelUtils'
import { patients } from './user.model'

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
