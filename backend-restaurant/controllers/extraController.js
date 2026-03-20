import extraModel from "../models/extraModel.js";
import birdiebiteRestaurantModel from "../models/birdiebiteRestaurantModel.js";

// Resolve restaurantId from slug or admin token
// Prefer slug when explicitly provided (URL context) so admin always gets correct restaurant's data
const resolveRestaurantId = async (req) => {
    const slug = req.query.slug || req.body.slug || req.body.restaurantSlug;
    if (slug) {
        const restaurant = await birdiebiteRestaurantModel.findOne({ slug: slug.trim().toLowerCase() });
        if (restaurant) return restaurant._id;
    }
    return req.adminRestaurantId || null;
};

// Add Extra Ingredient (per restaurant)
const addExtra = async (req, res) => {
    try {
        const { name, price, restaurantSlug } = req.body;
        const restaurantId = await resolveRestaurantId(req);
        if (!restaurantId) {
            return res.json({ success: false, message: "Restaurant context required (slug or admin token)" });
        }

        const newExtra = new extraModel({ name, price, restaurantId });
        await newExtra.save();

        res.json({ success: true, message: "Extra ingredient added successfully!", id: newExtra._id });
    } catch (error) {
        console.error("Error adding extra:", error);
        res.json({ success: false, message: "Error adding extra ingredient" });
    }
};

// List Extras (filter by restaurant)
const listExtras = async (req, res) => {
    try {
        const restaurantId = await resolveRestaurantId(req);
        const filter = restaurantId ? { restaurantId } : { $or: [{ restaurantId: null }, { restaurantId: { $exists: false } }] };
        const extras = await extraModel.find(filter);
        res.json({ success: true, extras });
    } catch (error) {
        console.error("Error fetching extras:", error);
        res.json({ success: false, message: "Error fetching extra ingredients" });
    }
};

// Remove Extra Ingredient
const removeExtra = async (req, res) => {
    try {
        const { id } = req.body;
        await extraModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Extra ingredient removed successfully!" });
    } catch (error) {
        console.error("Error removing extra:", error);
        res.json({ success: false, message: "Error removing extra ingredient" });
    }
};

export { addExtra, listExtras, removeExtra };
