const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const { validateRegistration, validateEmail } = require("../utils/validators");
const { asyncHandler, AppError } = require("../utils/errorHandler");

/* --------------------------------------
   REGISTER
-------------------------------------- */
router.post("/register", asyncHandler(async (req, res) => {
  const { name, email, password, role, age, gender } = req.body;

  // Validate input
  const validation = validateRegistration(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ 
      message: "Validation failed", 
      errors: validation.errors 
    });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);

  // Build user object with optional fields
  const userData = {
    name: name.trim(),
    email: email.toLowerCase(),
    password: hashed,
    role: role || "player",
  };

  // Add age if provided and valid
  if (age !== undefined && age !== null && age !== "") {
    const ageNum = parseInt(age);
    if (!isNaN(ageNum)) {
      userData.age = ageNum;
    }
  }

  // Add gender if provided
  if (gender && gender !== "") {
    userData.gender = gender;
  }

  const user = new User(userData);

  await user.save();

  // Create JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Return user without password
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    age: user.age,
    gender: user.gender,
    createdAt: user.createdAt
  };

  res.status(201).json({
    message: "Registration successful",
    token,
    user: userResponse,
  });
}));

/* --------------------------------------
   LOGIN
-------------------------------------- */
router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Return user without password
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    age: user.age,
    gender: user.gender,
    sport: user.sport,
    createdAt: user.createdAt
  };

  res.json({
    message: "Login successful",
    token,
    user: userResponse,
  });
}));

/* --------------------------------------
   GET AUTHENTICATED USER (Frontend needs this!)
-------------------------------------- */
router.get("/me", authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user });
}));

module.exports = router;
