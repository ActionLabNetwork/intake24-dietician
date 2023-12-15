import type { IRecallExtended } from '@intake24-dietician/common/types/recall'

import { jsonb, pgTable, serial, integer } from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
import { relations } from 'drizzle-orm'
import { surveys } from './survey.model'

export const recalls = pgTable('recall', {
  id: serial('id').primaryKey(),
  surveyId: integer('survey_id')
    .references(() => surveys.id)
    .notNull(),
  recall: jsonb('recall').$type<IRecallExtended>().notNull(),
  ...timestampFields,
})

export const recallsRelations = relations(recalls, ({ one }) => ({
  survey: one(surveys, {
    fields: [recalls.surveyId],
    references: [surveys.id],
  }),
}))
