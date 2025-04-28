const express = require("express");
const router = express.Router();
const { Login, Register, Check, Logout } = require("../controllers/authController");

router.post("/register", Register);
router.post("/login", Login);
router.get("/check", Check);
router.post("/logout", Logout);

module.exports = router;