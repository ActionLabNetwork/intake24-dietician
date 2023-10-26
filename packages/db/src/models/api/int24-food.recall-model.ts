import mongoose from 'mongoose'
const { Schema } = mongoose

const int24MealSchema = new Schema({
    id : { type: String, required: true, unique: true },
    parentId : { type: String, required: false, default: null },
    mealId : { type: String, required: true },
    index: { type: Number, required: true },
    code: { type: String, required: true },
    englishName : { type: String, required: true },
    localeName : { type: String, required: false, default: null },
    readyMeal : { type: Boolean, required: false, default: false },
    searchTearm : { type: String, required: false, default: null },
    portionSizeMethodId : { type: String, required: true },
    reasonableAmount : { type: Boolean, required: false, default: false  },
    foodGroup : { type: String, required: true},
    foodGroupEnglishName : { type: String, required: true},
    foodGroupLocalName : { type: String, required: false, default: null },
    brand: { type: String, required: false, default: null },
    nutrientTableId : { type: String, required: true },
    nutrientTableCode : { type: String, required: true },
    barcode : { type: String, required: false, default: null },
    customFields: { type: Array, required: false, default: null },
    fields: { type: Array, required: false, default: null },
    portionSize: { type: Schema.Types.ObjectId, ref: 'int24-portionsize' },
    nutrients: { type: Schema.Types.ObjectId, ref: 'int24-nutrient' },
});

export const food = mongoose.model('int24-food', int24MealSchema)