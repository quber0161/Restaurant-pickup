import express from "express";
import { getHour, setHour, deleteHour, isStoreOpenNow } from "../controllers/storeHourController.js"

const storeHourRouter = express.Router();

storeHourRouter.get("/", getHour)
storeHourRouter.post("/", setHour)
storeHourRouter.delete("/override/:date", deleteHour)
storeHourRouter.get ("/store-status", isStoreOpenNow)

export default storeHourRouter;