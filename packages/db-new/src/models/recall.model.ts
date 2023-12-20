import { RecallSchema } from '@intake24-dietician/common/entities-new/recall.schema'
import { relations } from 'drizzle-orm'
import { integer, pgTable, serial } from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
import { typedJsonbFromSchema } from './modelUtils'
import { patients } from './user.model'

export const recalls = pgTable('recall', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id')
    .references(() => patients.id)
    .notNull(),
  recall: typedJsonbFromSchema(RecallSchema)('recall').notNull(),
  ...timestampFields,
})

export const recallsRelations = relations(recalls, ({ one }) => ({
  patient: one(patients, {
    fields: [recalls.patientId],
    references: [patients.id],
  }),
}))
