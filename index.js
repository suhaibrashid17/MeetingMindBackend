const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const organizationRoutes = require("./routes/organizationRoutes")
const userRoutes = require("./routes/userRoutes")
const deptRoutes = require("./routes/departmentRoutes")

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api", organizationRoutes);
app.use("/api", userRoutes)
app.use("/api", deptRoutes)
 mongoose.connect(process.env.MONGO_URI).then(()=>{
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} and connected to db successfully`);
  });
 }).catch((error)=>{
      console.log(error);
 });

