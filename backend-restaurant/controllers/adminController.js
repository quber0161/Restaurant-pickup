import birdiebiteRestaurantModel from "../models/birdiebiteRestaurantModel.js";

// Get the current admin's restaurant (for admin panel display)
export const getMyRestaurant = async (req, res) => {
  try {
    const restaurantId = req.adminRestaurantId;
    if (!restaurantId) {
      return res.json({ success: true, restaurant: null, message: "No restaurant linked to this admin" });
    }
    const restaurant = await birdiebiteRestaurantModel.findById(restaurantId);
    if (!restaurant) {
      return res.json({ success: true, restaurant: null, message: "Restaurant not found" });
    }
    res.json({ success: true, restaurant: { _id: restaurant._id, name: restaurant.name, slug: restaurant.slug } });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Failed to fetch restaurant" });
  }
};
