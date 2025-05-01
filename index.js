const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const userRoutes = require("./routes/userRoutes");
const deptRoutes = require("./routes/departmentRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const serverless = require("serverless-http"); // Add serverless-http for Vercel

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // Replace with your frontend URL
    credentials: true, // If using cookies
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", organizationRoutes);
app.use("/api", userRoutes);
app.use("/api", deptRoutes);
app.use("/api", meetingRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Export the app as a serverless function
module.exports.handler = serverless(app);