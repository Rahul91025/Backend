import express from "express";
import cors from "cors";
import "dotenv/config"; // Make sure dotenv is loading .env variables
import connectDB from "./config/mongodb.js"; // Ensure this function connects to MongoDB
import connectCloudinary from "./config/cloudinary.js"; // Ensure Cloudinary is set up
import userRouter from "./routes/userRoute.js"; // Ensure correct file path
import productRouter from "./routes/productRoute.js"; // Ensure correct file path
import orderRouter from "./routes/orderRoute.js"; // Ensure correct file path
import cartRouter from "./routes/cartRoute.js"; // Ensure correct file path
import sellerRoutes from "./routes/sellerRoutes.js"; // Ensure correct file path

// App Config
const app = express();
const port = process.env.PORT || 3000;

// Database & Cloudinary Setup
connectDB();
connectCloudinary();

// Middleware
app.use(express.json());
app.use(cors());

// API Endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/seller", sellerRoutes);

// Test Endpoint
app.get("/", (req, res) => {
  res.send("API is working");
});

// Start the Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
