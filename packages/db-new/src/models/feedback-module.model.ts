import { relations } from 'drizzle-orm'
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  unique,
} from 'drizzle-orm/pg-core'
import { timestampFields } from './model.common'
import { surveys } from './survey.model'
import { typedJsonbFromSchema } from './modelUtils'
import { FeedbackLevelRootSchema } from '@intake24-dietician/common/entities-new/feedback.dto'
import { nutrientTypes } from './nutrient.model'

export const feedbackModules = pgTable('feedback-module', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  description: text('description').default('').notNull(),
  ...timestampFields,
})

export const feedbackModulesRelations = relations(
  feedbackModules,
  ({ many }) => ({
    surveyToFeedbackModules: many(surveyToFeedbackModules),
    nutrientTypes: many(feedbackModuleToNutrientTypes),
  }),
)

export const surveyToFeedbackModules = pgTable(
  'survey_feedback_modules',
  {
    id: serial('id').primaryKey(),
    surveyId: integer('survey_preferences_id')
      .notNull()
      .references(() => surveys.id),
    feedbackModuleId: integer('feedback_module_id')
      .notNull()
      .references(() => feedbackModules.id),
    isActive: boolean('is_active').default(true).notNull(),
    feedbackBelowRecommendedLevel: text('feedback_below_recommended_level')
      .default('')
      .notNull(),
    feedbackAboveRecommendedLevel: text('feedback_above_recommended_level')
      .default('')
      .notNull(),
    levels: typedJsonbFromSchema(FeedbackLevelRootSchema)('levelsObject'),
    ...timestampFields,
  },
  t => ({
    surveyModuleUnique: unique().on(t.surveyId, t.feedbackModuleId),
  }),
)

export const surveyPreferencesFeedbackModulesRelations = relations(
  surveyToFeedbackModules,
  ({ one }) => ({
    survey: one(surveys, {
      fields: [surveyToFeedbackModules.surveyId],
      references: [surveys.id],
    }),
    feedbackModule: one(feedbackModules, {
      fields: [surveyToFeedbackModules.feedbackModuleId],
      references: [feedbackModules.id],
    }),
  }),
)

export const feedbackModuleToNutrientTypes = pgTable(
  'feedback_module_nutrient_types',
  {
    id: serial('id').primaryKey(),
    feedbackModuleId: integer('feedback_module_id')
      .notNull()
      .references(() => feedbackModules.id),
    nutrientTypeId: integer('nutrient_type_id')
      .notNull()
      .references(() => nutrientTypes.id),
    ...timestampFields,
  },
)

export const feedbackModuleToNutrientTypesRelations = relations(
  feedbackModuleToNutrientTypes,
  ({ one }) => ({
    feedbackModule: one(feedbackModules, {
      fields: [feedbackModuleToNutrientTypes.feedbackModuleId],
      references: [feedbackModules.id],
    }),
    nutrientType: one(nutrientTypes, {
      fields: [feedbackModuleToNutrientTypes.nutrientTypeId],
      references: [nutrientTypes.id],
    }),
  }),
)
