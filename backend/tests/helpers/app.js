/**
 * tests/helpers/app.js
 * Builds the Express application without calling connectDB().
 * The test DB helper manages the Mongoose connection instead.
 *
 * This mirrors server.js exactly — same middleware, routes, error handler —
 * but does NOT call connectDB() so no real Atlas connection is attempted.
 */

// Ensure JWT_SECRET is set for all tests
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key_for_jest_suite";
// Prevent rate-limiter from rejecting tests (point to no real keys)
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-gemini-key";
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "test-openai-key";

const express = require("express");
const path = require("path");
const cors = require("cors");

const { errorHandler } = require("../../utils/errorHandler");
const { requestLogger } = require("../../utils/logger");
const { authRateLimiter, apiRateLimiter } = require("../../middleware/rateLimiter");

const authRoutes = require("../../routes/authRoutes");
const performanceRoutes = require("../../routes/performanceRoutes");
const coachRoutes = require("../../routes/coachRoutes");
const adminRoutes = require("../../routes/adminRoutes");
const recommendationsRoutes = require("../../routes/recommendationsRoutes");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: "GET,POST,PUT,PATCH,DELETE",
    credentials: true,
  })
);

// Suppress request logging noise during tests
if (process.env.NODE_ENV !== "test") {
  app.use(requestLogger);
}

// Serve uploads statically (needed for file-upload tests)
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Routes
app.use("/auth", authRateLimiter, authRoutes);
app.use("/performance", apiRateLimiter, performanceRoutes);
app.use("/coach", apiRateLimiter, coachRoutes);
app.use("/admin", apiRateLimiter, adminRoutes);
app.use("/recommendations", apiRateLimiter, recommendationsRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
