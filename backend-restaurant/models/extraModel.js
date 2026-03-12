import mongoose from "mongoose";

const extraSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "birdiebiteRestaurant", default: null },
    name: { type: String, required: true },
    price: { type: Number, required: true },
});

const extraModel = mongoose.models.extra || mongoose.model("extra", extraSchema);
export default extraModel;
