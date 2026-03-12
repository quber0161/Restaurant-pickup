import express from "express"
import { addFood, listFood, removeFood, updateSoldOutStatus } from "../controllers/foodController.js"
import { adminAuth, optionalAdminAuth } from "../middleware/adminAuth.js"
import multer from "multer"

const foodRouter = express.Router();

// Image Storage Engine

const storage = multer.diskStorage({
    destination: "uploads/foods",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({ storage: storage })

foodRouter.post("/add", adminAuth, upload.single("image"), addFood)
foodRouter.get("/list", optionalAdminAuth, listFood)
foodRouter.post("/remove", removeFood);
foodRouter.post("/update-soldout", updateSoldOutStatus)


export default foodRouter;