const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware(), (req, res) => {
  res.json({
    message: "Welcome to your profile!",
    user: req.user,
  });
});

router.get("/admin", authMiddleware(["organization_admin"]), (req, res) => {
  res.json({
    message: "You are an organization admin!",
    user: req.user,
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
});

module.exports = router;
