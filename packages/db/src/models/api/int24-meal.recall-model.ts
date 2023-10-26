import mongoose from 'mongoose'
const { Schema } = mongoose

const int24MealSchema = new Schema({
  id: { type: String, required: true, unique: true },
  surveySubmissionId: { type: String, required: true },
  hours: { type: Number, required: true },
  minutes: { type: Number, required: true },
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  customFields: { type: Array, required: false, default: null },
  missingFoods: { type: Array, required: false, default: null },
  foods: [{ type: Schema.Types.ObjectId, ref: 'int24-food' }],
})

export const meal = mongoose.model('int24-meal', int24MealSchema)
