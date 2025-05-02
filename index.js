import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import deptRoutes from "./routes/departmentRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Replace with your frontend URL
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", organizationRoutes);
app.use("/api", userRoutes);
app.use("/api", deptRoutes);
app.use("/api", meetingRoutes);

// Connect to MongoDB (lazy connection for serverless)
let mongooseConnected = false;
const connectToMongo = async () => {
  if (!mongooseConnected) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      mongooseConnected = true;
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }
};

// Serverless handler
export default async (req, res) => {
  try {
    await connectToMongo();
    app(req, res); // Pass request to Express app
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};