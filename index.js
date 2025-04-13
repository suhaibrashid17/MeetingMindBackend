const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");

//toimport custom files
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");


dotenv.config();

// app setup
const app = express();
const PORT = process.env.PORT || 5000;

// connect to MongoDB
connectDB();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000", // frontend address
  credentials: true, // allow cookies from frontend
}));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("✅ Backend running");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
