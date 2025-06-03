import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: false },
    items: [
        {
            name: String,
            price: Number,
            quantity: Number,
            extras: [
                {
                    _id: { type: mongoose.Schema.Types.ObjectId, ref: "extra" },
                    name: String,
                    quantity: Number,
                    price: Number
                }
            ],
            comment: { type: String, default: "" },
            mandatoryOptions: {
                type: mongoose.Schema.Types.Mixed, // Accept any object shape (like { Size: {...}, Spice: {...} })
                default: {}
            }

        }
    ],    
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "Order Processing" },
    date: { type: Date, default: Date.now },
    payment: { type: Boolean, default: false },
    email: { type: String, default: null },
    trackingToken: { type: String, default: null }

});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
