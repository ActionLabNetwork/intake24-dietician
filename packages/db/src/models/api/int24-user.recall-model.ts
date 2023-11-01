import mongoose from 'mongoose'
const { Schema } = mongoose

const int24UserSchema = new Schema({
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
});

export const user = mongoose.model('int24-user', int24UserSchema);