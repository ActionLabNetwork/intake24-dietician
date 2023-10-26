import mongoose from 'mongoose'
const { Schema } = mongoose

const int24PortionSizeSchema = new Schema({
    id : { type: String, required: true, unique: true },
    foodId : { type: String, required: true },
    name: { type: String, required: true },
    value: { type: String, required: false, default: null },

});

export const portionSize = mongoose.model('int24-potionsize', int24PortionSizeSchema)