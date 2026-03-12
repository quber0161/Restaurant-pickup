import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "birdiebiteRestaurant", default: null },
    name: { type: String, required: true },
    image: { type: String, required: true }
});

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema);

export default categoryModel;