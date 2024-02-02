import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
import { relations } from 'drizzle-orm'
import { feedbackModuleToNutrientTypes } from './feedback-module.model'

export const nutrientUnits = pgTable('nutrient_units', {
  id: serial('id').primaryKey(),
  description: text('description').default('').notNull(),
  symbol: text('symbol'),
  ...timestampFields,
})

export const nutrientUnitsRelations = relations(nutrientUnits, ({ many }) => ({
  nutrientTypes: many(nutrientTypes),
}))

export const nutrientTypes = pgTable('nutrient_types', {
  id: serial('id').primaryKey(),
  unitId: integer('unit_id')
    .references(() => nutrientUnits.id)
    .notNull(),
  description: text('description').default('').notNull(),
  ...timestampFields,
})

export const nutrientTypesRelations = relations(
  nutrientTypes,
  ({ one, many }) => ({
    nutrientUnit: one(nutrientUnits, {
      fields: [nutrientTypes.unitId],
      references: [nutrientUnits.id],
    }),
    feedbackModules: many(feedbackModuleToNutrientTypes),
  }),
)
