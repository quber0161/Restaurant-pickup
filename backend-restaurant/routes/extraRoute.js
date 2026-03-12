import express from "express";
import { addExtra, listExtras, removeExtra } from "../controllers/extraController.js";
import { optionalAdminAuth } from "../middleware/adminAuth.js";

const extraRouter = express.Router();

extraRouter.post("/add", optionalAdminAuth, addExtra);
extraRouter.get("/list", optionalAdminAuth, listExtras);
extraRouter.post("/remove", optionalAdminAuth, removeExtra);

export default extraRouter;
