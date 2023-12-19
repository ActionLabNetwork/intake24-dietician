import type { IRecall } from '@intake24-dietician/common/types/recall'

import { relations } from 'drizzle-orm'
import { integer, jsonb, pgTable, serial } from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
import { patients } from './user.model'

export const recalls = pgTable('recall', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id')
    .references(() => patients.id)
    .notNull(),
  recall: jsonb('recall').$type<IRecall>().notNull(),
  ...timestampFields,
})

export const recallsRelations = relations(recalls, ({ one }) => ({
  patient: one(patients, {
    fields: [recalls.patientId],
    references: [patients.id],
  }),
}))
