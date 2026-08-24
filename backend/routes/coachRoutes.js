const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Performance = require("../models/Performance");
const { asyncHandler } = require("../utils/errorHandler");
const { validateObjectId } = require("../utils/validators");

// 1️⃣ GET all players
router.get("/players", auth, asyncHandler(async (req, res) => {
  if (req.user.role !== "coach" && req.user.role !== "admin" && req.user.role !== "scout") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { page = 1, limit = 20, sport } = req.query;
  const skip = (page - 1) * limit;

  // Build query
  const query = { role: "player" };
  if (sport) query.sport = sport;

  const players = await User.find(query)
    .select("-password")
    .limit(Number(limit))
    .skip(skip);

  const total = await User.countDocuments(query);

  res.json({
    data: players,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// 2️⃣ GET player performance
router.get("/player/:id/performance", auth, asyncHandler(async (req, res) => {
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid player ID" });
  }

  const data = await Performance.find({ userId: req.params.id })
    .sort({ createdAt: -1 });

  res.json(data);
}));

// 3️⃣ Compare two players
router.get("/compare", auth, asyncHandler(async (req, res) => {
  const { p1, p2 } = req.query;

  if (!validateObjectId(p1) || !validateObjectId(p2)) {
    return res.status(400).json({ message: "Invalid player IDs" });
  }

  const p1Data = await Performance.findOne({ userId: p1 }).sort({ createdAt: -1 });
  const p2Data = await Performance.findOne({ userId: p2 }).sort({ createdAt: -1 });

  res.json({
    p1: {
      speed: p1Data?.speed || 0,
      stamina: p1Data?.stamina || 0,
      strength: p1Data?.strength || 0
    },
    p2: {
      speed: p2Data?.speed || 0,
      stamina: p2Data?.stamina || 0,
      strength: p2Data?.strength || 0
    }
  });
}));

module.exports = router;
