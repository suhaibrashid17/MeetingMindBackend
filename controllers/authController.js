import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

export const Register = async (req, res) => {
  let { username, email, password} = req.body;

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User with this email already exists" });
    existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "User with this username already exists" });
    console.log({
      "email":email,
      "password":password,
      "username":username,
    })
    const salt=await bcrypt.genSalt(10);
    password=await bcrypt.hash(password,salt);
    const user = new User({
      username,
      email,
      password,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


export const Login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Invalid email or password" });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid email or password" });
  
      const token = generateToken(user);
  
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
          maxAge: 3600000,
        })
        .json({
          message: "Login successful",
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            department: user.department,
          },
        });
    } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };


 export const Check = async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ message: "No token provided" });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
  
      if (!user) return res.status(401).json({ message: "User not found" });
  
      res.json({ user });
    } catch (err) {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  }

export const Logout = async(req, res) => {
    res.clearCookie("token").json({ message: "Logged out successfully" });
  }

