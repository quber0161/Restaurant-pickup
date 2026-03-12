import express from "express";
import { getHour, setHour, deleteHour, isStoreOpenNow } from "../controllers/storeHourController.js";
import { optionalAdminAuth } from "../middleware/adminAuth.js";

const storeHourRouter = express.Router();

storeHourRouter.get("/", optionalAdminAuth, getHour);
storeHourRouter.post("/", optionalAdminAuth, setHour);
storeHourRouter.delete("/override/:date", optionalAdminAuth, deleteHour);
storeHourRouter.get("/store-status", optionalAdminAuth, isStoreOpenNow);

export default storeHourRouter;