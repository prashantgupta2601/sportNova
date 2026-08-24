// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Performance = require("../models/Performance");
const auth = require("../middleware/authMiddleware");
const { asyncHandler } = require("../utils/errorHandler");
const { validateObjectId } = require("../utils/validators");

function requireAdmin(req, res) {
  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Admin access only" });
    return false;
  }
  return true;
}

// 👤 Get all users
router.get("/users", auth, asyncHandler(async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const { page = 1, limit = 20, role } = req.query;
  const skip = (page - 1) * limit;

  // Build query
  const query = {};
  if (role) query.role = role;

  const users = await User.find(query)
    .select("-password")
    .limit(Number(limit))
    .skip(skip);

  const total = await User.countDocuments(query);

  res.json({
    data: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// ✏️ Change role
router.patch("/users/:id/role", auth, asyncHandler(async (req, res) => {
  if (!requireAdmin(req, res)) return;

  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const { role } = req.body;
  const allowed = ["player", "coach", "admin", "scout"];
  
  if (!allowed.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, select: "-password" }
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
}));

// ❌ Delete user
router.delete("/users/:id", auth, asyncHandler(async (req, res) => {
  if (!requireAdmin(req, res)) return;

  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Delete all performances of this user
  await Performance.deleteMany({ userId: req.params.id });

  res.json({ message: "User & performances deleted" });
}));

// ❌ Delete performance
router.delete("/performance/:id", auth, asyncHandler(async (req, res) => {
  if (!requireAdmin(req, res)) return;

  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid performance ID" });
  }

  const performance = await Performance.findByIdAndDelete(req.params.id);
  if (!performance) {
    return res.status(404).json({ message: "Performance not found" });
  }

  res.json({ message: "Performance deleted" });
}));

module.exports = router;
