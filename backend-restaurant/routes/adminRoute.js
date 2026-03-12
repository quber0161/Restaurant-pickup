import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { getMyRestaurant } from "../controllers/adminController.js";

const router = express.Router();

router.get("/restaurant", adminAuth, getMyRestaurant);

export default router;
