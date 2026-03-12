import foodModel from "../models/foodModel.js";
import extraModel from "../models/extraModel.js";
import birdiebiteRestaurantModel from "../models/birdiebiteRestaurantModel.js";
import fs from "fs";

// 🟢 Add New Food Item with Selected Extras
const addFood = async (req, res) => {
    try {
        const { name, description, price, category, extras, mandatoryOptions, restaurantSlug } = req.body;
        if (!req.file || !req.file.filename) {
            return res.json({ success: false, message: "Image is required" });
        }
        const image = req.file.filename;

        let restaurantId = req.adminRestaurantId || null;
        if (restaurantSlug) {
            const restaurant = await birdiebiteRestaurantModel.findOne({ slug: restaurantSlug });
            if (restaurant) restaurantId = restaurant._id;
        }

        let extraIds = [];
        if (extras && restaurantId) {
            const parsedExtras = JSON.parse(extras);
            const found = await extraModel.find({ name: { $in: parsedExtras }, restaurantId }).select('_id');
            extraIds = found.map(extra => extra._id);
        } else if (extras) {
            const parsedExtras = JSON.parse(extras);
            extraIds = (await extraModel.find({ name: { $in: parsedExtras } }).select('_id')).map(e => e._id);
        }

        let parsedMandatoryOptions = [];
        if (mandatoryOptions) {
            parsedMandatoryOptions = JSON.parse(mandatoryOptions); // 🟢 Parse JSON string
        }

        const newFood = new foodModel({
            restaurantId,
            name,
            description,
            price,
            category,
            image,
            extras: extraIds,
            mandatoryOptions: parsedMandatoryOptions
        });

        await newFood.save();
        res.json({ success: true, message: "Food item added successfully!" });
    } catch (error) {
        console.error("Error adding food:", error);
        res.json({ success: false, message: "Error adding food item" });
    }
};



// 🟢 Get All Food Items (filter by slug for menu, or admin's restaurantId from token)
const listFood = async (req, res) => {
    try {
        let filter = {};
        const slug = req.query.slug;
        const adminRestaurantId = req.adminRestaurantId;
        if (slug) {
            const restaurant = await birdiebiteRestaurantModel.findOne({ slug: slug.trim().toLowerCase() });
            if (restaurant) filter.restaurantId = restaurant._id;
            else filter.$or = [{ restaurantId: null }, { restaurantId: { $exists: false } }];
        } else if (adminRestaurantId) {
            filter.restaurantId = adminRestaurantId;
        } else if (req.headers.token) {
            filter._id = { $in: [] }; // Admin with no restaurantId = return empty (never leak other restaurant data)
        } else {
            filter.$or = [{ restaurantId: null }, { restaurantId: { $exists: false } }];
        }
        const foods = await foodModel.find(filter).populate("extras");
        res.json({ success: true, data: foods });
    } catch (error) {
        console.error("Error fetching food:", error);
        res.json({ success: false, message: "Error fetching food items" });
    }
};


// 🟢 Remove Food Item
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        if (food.image) {
            fs.unlink(`uploads/foods/${food.image}`, () => {});
        }

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error removing food item" });
    }
};

// 🟡 Update Sold Out Status
const updateSoldOutStatus = async (req, res) => {
    try {
      const { foodId, isSoldOut } = req.body;
      await foodModel.findByIdAndUpdate(foodId, { isSoldOut });
      res.json({ success: true, message: "Sold out status updated" });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error updating sold out status" });
    }
  };
  

export { addFood, listFood, removeFood, updateSoldOutStatus };
