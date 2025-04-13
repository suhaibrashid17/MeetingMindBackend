const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

//protected route — any logged-in user
router.get("/profile", authMiddleware(), (req, res) => {
  res.json({
    message: "Welcome to your profile!",
    user: req.user,
  });
});

// admin-only route
router.get("/admin", authMiddleware(["organization_admin"]), (req, res) => {
  res.json({
    message: "You are an organization admin!",
    user: req.user,
  });
});

//lgout route — clears the token cookie
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
});

module.exports = router;
