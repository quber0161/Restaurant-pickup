import mongoose from 'mongoose';

const storeHourSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "birdiebiteRestaurant", default: null },
    day: { type: String }, // e.g., "Monday"
    date: { type: String }, // e.g., "2025-05-19" for override
    openTime: { type: String }, // "13:00"
    closeTime: { type: String }, // "23:00"
    isClosed: { type: Boolean, default: false },
    isOverride: { type: Boolean, default: false },
  });

const storeHourModel = mongoose.models.setHour || mongoose.model('StoreHour', storeHourSchema);
export default storeHourModel;