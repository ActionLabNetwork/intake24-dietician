import mongoose from 'mongoose'
const { Schema } = mongoose

const int24recallSchema = new Schema({
  dietionSurveyId: { type: String, required: true, default: null },
  id: { type: String, required: true, unique: true },
  surveyId: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true, default: 'None' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  submissionTime: { type: Date, required: true },
  log: { type: Object, required: false, default: null },
  uxSessionId: { type: String, required: false, default: null },
  userAgent: { type: String, required: false, default: null },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  user: {
    id: { type: String, required: true },
    name: { type: String, required: false, default: null },
    email: { type: String, required: false, default: null },
    phone: { type: String, required: false, default: null },
    simpleName: { type: String, required: false, default: null },
    multiFactorAuthentification: {
      type: Boolean,
      required: false,
      default: null,
    },
    emailNotifications: { type: Boolean, required: false, default: null },
    smsNotifications: { type: Boolean, required: false, default: null },
    verifiedAt: { type: Date, required: false, default: null },
    disabledAt: { type: Date, required: false, default: null },
    createdAt: { type: Date, required: false, default: null },
    updatedAt: { type: Date, required: false, default: null },
    aliases: [
      {
        id: { type: String, required: true },
        userId: { type: String, required: true },
        surveyId: { type: String, required: true },
        username: { type: String, required: true },
        uriAuthToken: { type: String, required: false },
        createdAt: { type: Date, required: true },
        updatedAt: { type: Date, required: true },
      },
    ],
    customFields: { type: Array, required: false, default: null },
  },
  meals: [
    {
      id: { type: String, required: true, unique: true },
      surveySubmissionId: { type: String, required: true },
      hours: { type: Number, required: true },
      minutes: { type: Number, required: true },
      name: { type: String, required: true },
      duration: { type: Number, required: false, default: null },
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
          foodGroupId: { type: String, required: true },
          foodGroupEnglishName: { type: String, required: true },
          foodGroupLocalName: { type: String, required: false, default: null },
          brand: { type: String, required: false, default: null },
          nutrientTableId: { type: String, required: true },
          nutrientTableCode: { type: String, required: true },
          barcode: { type: String, required: false, default: null },
          customFields: { type: Array, required: false, default: null },
          fields: { type: Array, required: false, default: null },
          nutrients: [
            {
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
          ],
          portionSizes: [
            {
              id: { type: String, required: true, unique: true },
              foodId: { type: String, required: true },
              name: { type: String, required: true },
              value: { type: String, required: false, default: null },
            },
          ],
        },
      ],
    },
  ],
  // user: {type: Schema.Types.ObjectId, ref: 'int24-user'},
  // meals: [
  //   {type: Schema.Types.ObjectId, ref: 'int24-meal'}
  // ],
  survey: {
    id: { type: String, required: true },
    slug: { type: String, required: true },
  },
  customFields: { type: Array, required: false, default: null },
})

export const Recall = mongoose.model('Recall', int24recallSchema)
