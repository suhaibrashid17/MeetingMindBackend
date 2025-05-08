import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"; // Adjust path if needed
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
    origin:"http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", organizationRoutes);
app.use("/api", userRoutes);
app.use("/api", deptRoutes);
app.use("/api", meetingRoutes);

// MongoDB connection with retry and timeout
// const connectToMongo = async () => {
//   if (mongoose.connection.readyState === 0) { // 0 = disconnected
//     try {
//       console.log("Attempting to connect to MongoDB...");
//       await mongoose.connect(process.env.MONGO_URI, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         serverSelectionTimeoutMS: 5000, // Fail fast if server unreachable
//         socketTimeoutMS: 10000, // Close socket after 10s of inactivity
//       });
//       console.log("Connected to MongoDB");
//     } catch (error) {
//       console.error("MongoDB connection error:", error);
//       throw error;
//     }
//   } else {
//     console.log("MongoDB already connected");
//   }
// };

// Test route to debug findOne
// app.get("/api/test", async (req, res) => {
//   try {
//     console.log("Starting test findOne query");
//     const start = Date.now();
//     const user = await mongoose.model("User").findOne({}); // Adjust model name
//     const duration = Date.now() - start;
//     console.log(`findOne query took ${duration}ms`);
//     res.json({ message: "Query successful", user });
//   } catch (error) {
//     console.error("Test query error:", error);
//     res.status(500).json({ message: "Test query failed", error: error.message });
//   }
// });

// Serverless handler
// export default async (req, res) => {
//   try {
//     await connectToMongo();
//     return new Promise((resolve) => {
//       app(req, res);
//       res.on("finish", resolve);
//     });
//   } catch (error) {
//     console.error("Server error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

mongoose.connect(process.env.MONGO_URI).then(()=>{
  app.listen(process.env.PORT, ()=>{
    console.log("Connected to db and server")
  })
}).catch((error)=>{
  console.log(error);
})