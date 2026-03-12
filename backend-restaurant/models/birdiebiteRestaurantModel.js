import mongoose from "mongoose";

const birdiebiteRestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  rating: { type: Number, default: 4.5 },
  deliveryTime: { type: String, default: "To your hole in 25 min" },
  image: { type: String, required: true },
  order: { type: Number, default: 0 },
});

const birdiebiteRestaurantModel =
  mongoose.models.birdiebiteRestaurant ||
  mongoose.model("birdiebiteRestaurant", birdiebiteRestaurantSchema);
export default birdiebiteRestaurantModel;
