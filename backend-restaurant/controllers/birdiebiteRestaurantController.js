import birdiebiteRestaurantModel from "../models/birdiebiteRestaurantModel.js";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";

const defaultRestaurants = [
  { name: "Restoran", slug: "restoran", rating: 4.8, deliveryTime: "To your hole in 25 min", image: "/img/about-1.jpg", order: 0 },
  { name: "Joe's Grill", slug: "joes-grill", rating: 4.7, deliveryTime: "To your hole in 20 min", image: "/img/about-2.jpg", order: 1 },
  { name: "Bella Italiana", slug: "bella-italiana", rating: 4.9, deliveryTime: "To your hole in 18 min", image: "/img/about-3.jpg", order: 2 },
  { name: "Sunrise Cafe", slug: "sunrise-cafe", rating: 4.6, deliveryTime: "To your hole in 22 min", image: "/img/about-4.jpg", order: 3 },
];

export const getRestaurants = async (req, res) => {
  try {
    let restaurants = await birdiebiteRestaurantModel.find().sort({ order: 1 });
    for (const r of restaurants) {
      if (!r.slug) {
        r.slug = (r.name || "restaurant").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        await r.save();
      }
    }
    restaurants = await birdiebiteRestaurantModel.find().sort({ order: 1 });
    if (restaurants.length === 0) {
      await birdiebiteRestaurantModel.insertMany(defaultRestaurants);
      restaurants = await birdiebiteRestaurantModel.find().sort({ order: 1 });
      const restoranId = restaurants[0]?._id;
      if (restoranId) {
        const { default: foodModel } = await import("../models/foodModel.js");
        const { default: categoryModel } = await import("../models/categoryModel.js");
        const { default: orderModel } = await import("../models/orderModel.js");
        await foodModel.updateMany({ restaurantId: null }, { restaurantId: restoranId });
        await categoryModel.updateMany({ restaurantId: null }, { restaurantId: restoranId });
        await orderModel.updateMany({ restaurantId: null }, { restaurantId: restoranId });
        await userModel.updateMany({ role: "admin", restaurantId: null }, { restaurantId: restoranId });
      }
    }
    res.json({ success: true, restaurants });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Failed to fetch restaurants" });
  }
};

export const addRestaurant = async (req, res) => {
  try {
    const { name, slug, rating, deliveryTime, image, adminEmail, adminPassword } = req.body;
    const cleanSlug = (slug || name || "new").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const finalSlug = cleanSlug || "restaurant-" + Date.now();

    const exists = await birdiebiteRestaurantModel.findOne({ slug: finalSlug });
    if (exists) return res.json({ success: false, message: "Slug already exists" });

    const count = await birdiebiteRestaurantModel.countDocuments();
    const newRestaurant = new birdiebiteRestaurantModel({
      name: name || "New Restaurant",
      slug: finalSlug,
      rating: rating || 4.5,
      deliveryTime: deliveryTime || "To your hole in 25 min",
      image: image || "/img/about-1.jpg",
      order: count,
    });
    await newRestaurant.save();

    if (adminEmail && adminPassword && adminPassword.length >= 8) {
      const hashed = await bcrypt.hash(adminPassword, 6);
      const adminUser = new userModel({
        name: name || "Admin",
        email: adminEmail,
        password: hashed,
        role: "admin",
        restaurantId: newRestaurant._id,
      });
      await adminUser.save();
    }

    res.json({ success: true, restaurant: newRestaurant });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Failed to add restaurant" });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, rating, deliveryTime, image } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (rating !== undefined) updates.rating = rating;
    if (deliveryTime !== undefined) updates.deliveryTime = deliveryTime;
    if (image !== undefined) updates.image = image;

    const restaurant = await birdiebiteRestaurantModel.findByIdAndUpdate(id, updates, { new: true });
    if (!restaurant) return res.json({ success: false, message: "Restaurant not found" });
    res.json({ success: true, restaurant });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Failed to update restaurant" });
  }
};

export const getRestaurantBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const restaurant = await birdiebiteRestaurantModel.findOne({ slug });
    if (!restaurant) return res.json({ success: false, message: "Restaurant not found" });
    res.json({ success: true, restaurant });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Failed to fetch restaurant" });
  }
};

export const addAdminToRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminEmail, adminPassword } = req.body;
    if (!adminEmail || !adminPassword || adminPassword.length < 8) {
      return res.json({ success: false, message: "Admin email and password (min 8 chars) required" });
    }
    const restaurant = await birdiebiteRestaurantModel.findById(id);
    if (!restaurant) return res.json({ success: false, message: "Restaurant not found" });
    const exists = await userModel.findOne({ email: adminEmail });
    if (exists) return res.json({ success: false, message: "Email already used by another account" });
    const hashed = await bcrypt.hash(adminPassword, 6);
    const adminUser = new userModel({
      name: restaurant.name + " Admin",
      email: adminEmail,
      password: hashed,
      role: "admin",
      restaurantId: restaurant._id,
    });
    await adminUser.save();
    res.json({ success: true, message: "Admin created. They can now log in to manage " + restaurant.name });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Failed to add admin" });
  }
};

export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await birdiebiteRestaurantModel.findByIdAndDelete(id);
    if (!result) return res.json({ success: false, message: "Restaurant not found" });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Failed to delete restaurant" });
  }
};
