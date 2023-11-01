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
  foods: [
    {
      id: { type: String, required: true, unique: true },
      parentId: { type: String, required: false, default: null },
      mealId: { type: String, required: true },
      index: { type: Number, required: true },
      code: { type: String, required: true },
      englishName: { type: String, required: true },
      localeName: { type: String, required: false, default: null },
      readyMeal: { type: Boolean, required: false, default: false },
      searchTearm: { type: String, required: false, default: null },
      portionSizeMethodId: { type: String, required: true },
      reasonableAmount: { type: Boolean, required: false, default: false },
      foodGroup: { type: String, required: true },
      foodGroupEnglishName: { type: String, required: true },
      foodGroupLocalName: { type: String, required: false, default: null },
      brand: { type: String, required: false, default: null },
      nutrientTableId: { type: String, required: true },
      nutrientTableCode: { type: String, required: true },
      barcode: { type: String, required: false, default: null },
      customFields: { type: Array, required: false, default: null },
      fields: { type: Array, required: false, default: null },
      nutrients: {
        id: { type: String, required: true, unique: true },
        foodId: { type: String, required: true },
        amount: { type: Number, required: true },
        nutrientTypeId: { type: String, required: true },
        nutrientType: {
          id: { type: String, required: true },
          description: { type: String, required: true },
          unitId: { type: String, required: true },
        },
      },
      portionSize: {
        id: { type: String, required: true, unique: true },
        foodId: { type: String, required: true },
        name: { type: String, required: true },
        value: { type: String, required: false, default: null },
      },
    },
  ],
  // foods: [{ type: Schema.Types.ObjectId, ref: 'int24-food' }],
})

export const meal = mongoose.model('int24-meal', int24MealSchema)
