import mongoose from 'mongoose'
const { Schema } = mongoose

const int24NutrientSchema = new Schema({
    id : { type: String, required: true, unique: true },
    foodId : { type: String, required: true },
    amount: { type: Number, required: true },
    nutrientTypeId: { type: String, required: true },
    nutrientType: {
        id: { type: String, required: true },
        description: { type: String, required: true },
        unitId: { type: String, required: true },
    }
});

export const nutrient = mongoose.model('int24-nutrient', int24NutrientSchema)