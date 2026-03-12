import express from "express"
import cors from "cors"
import { connect } from "mongoose"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/CartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import categoryRouter from "./routes/categoryRoute.js"
import extraRouter from "./routes/extraRoute.js"

// ✅ NEW: Socket.io Setup
import { Server } from "socket.io"
import http from "http"
import storeHourRouter from "./routes/storeHourRoute.js"
import birdiebiteRestaurantRouter from "./routes/birdiebiteRestaurantRoute.js"
import adminRouter from "./routes/adminRoute.js"


// app config
const app = express()
const port = process.env.PORT || 4000

// ✅ Create HTTP server for Socket.IO
const server = http.createServer(app)

// ✅ Setup Socket.IO server
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
const io = new Server(server, {
    cors: {
        origin: frontendUrl,
        methods: ["GET", "POST"]
    }
})

// ✅ Handle connection events
io.on("connection", (socket) => {
    console.log("✅ Admin connected:", socket.id)
})

// ✅ Make io available in your controllers
app.set("io", io)


// middleware
app.use(express.json())
app.use(cors())

//db connection
connectDB();

// api endpoint 
app.use("/api/food", foodRouter)
app.use("/foodimages", express.static('uploads/foods'))
app.use("/api/user", userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)
app.use("/api/category", categoryRouter)
app.use("/categoryimages", express.static('uploads/categories'))
app.use("/api/extras", extraRouter); // 🟢 Register Extra Ingredients API
app.use("/api/store-hours", storeHourRouter)
app.use("/api/birdiebite/restaurants", birdiebiteRestaurantRouter)
app.use("/api/admin", adminRouter)

app.get("/", (req, res) => {
    res.send("API Working")
})

// ✅ Use the HTTP server to listen instead of app.listen
server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`)
})