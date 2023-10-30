import mongoose from 'mongoose'
const { Schema } = mongoose

const int24recallSchema = new Schema({
  id: { type: String, required: true, unique: true },
  surveyId: { type: String, required: true },
  userId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  submissionTime: { type: Date, required: true },
  log: { type: Object, required: false, default: null },
  uxSessionId: { type: String, required: false, default: null },
  userAgent: { type: String, required: false, default: null },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  user: {type: Schema.Types.ObjectId, ref: 'int24-user'},
  meals: [
    {type: Schema.Types.ObjectId, ref: 'int24-meal'}
  ],
  survey: {
    id: { type: String, required: true },
    slug: { type: String, required: true },
  },
  customFields: { type: Array, required: false, default: null },
})

export const Recall = mongoose.model('Recall', int24recallSchema);
