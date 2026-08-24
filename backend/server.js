// backend/server.js
require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");

// Import utilities
const { errorHandler } = require("./utils/errorHandler");
const { requestLogger, logEvent } = require("./utils/logger");
const { authRateLimiter, apiRateLimiter } = require("./middleware/rateLimiter");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const performanceRoutes = require("./routes/performanceRoutes");
const coachRoutes = require("./routes/coachRoutes");
const adminRoutes = require("./routes/adminRoutes");
const recommendationsRoutes = require("./routes/recommendationsRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// ========== Middleware ==========
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS Configuration
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: "GET,POST,PUT,PATCH,DELETE",
  credentials: true
}));

// Request logging
app.use(requestLogger);

// Serve uploaded video files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========== API Routes ==========
// Auth routes with strict rate limiting
app.use("/auth", authRateLimiter, authRoutes);

// Other routes with standard rate limiting
app.use("/performance", apiRateLimiter, performanceRoutes);
app.use("/coach", apiRateLimiter, coachRoutes);
app.use("/admin", apiRateLimiter, adminRoutes);
app.use("/recommendations", apiRateLimiter, recommendationsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Route not found" 
  });
});

// ========== Error Handler ==========
app.use(errorHandler);

// ========== Server Start ==========
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health\n`);
  logEvent("SERVER_START", { port: PORT });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
