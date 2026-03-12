import express from "express";
import {
  getRestaurants,
  getRestaurantBySlug,
  addRestaurant,
  updateRestaurant,
  deleteRestaurant,
  addAdminToRestaurant,
} from "../controllers/birdiebiteRestaurantController.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const superadminAuth = (req, res, next) => {
  const token = req.headers.token;
  if (!token) return res.json({ success: false, message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "superadmin") return res.json({ success: false, message: "Forbidden" });
    next();
  } catch {
    res.json({ success: false, message: "Invalid token" });
  }
};

router.get("/list", getRestaurants);
router.get("/slug/:slug", getRestaurantBySlug);
router.post("/add", superadminAuth, addRestaurant);
router.put("/update/:id", superadminAuth, updateRestaurant);
router.post("/add-admin/:id", superadminAuth, addAdminToRestaurant);
router.delete("/delete/:id", superadminAuth, deleteRestaurant);

export default router;
