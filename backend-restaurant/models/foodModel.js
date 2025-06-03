import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  extras: [{ type: mongoose.Schema.Types.ObjectId, ref: "extra" }],
  isSoldOut: { type: Boolean, default: false },

  // New field for mandatory options
  mandatoryOptions: [
    {
      title: { type: String, required: true },
      choices: [
        {
          label: { type: String, required: true },
          additionalPrice: { type: Number, default: 0 }
        }
      ]
    }
  ]  
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);
export default foodModel;