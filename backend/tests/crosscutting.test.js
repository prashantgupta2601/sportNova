/**
 * tests/crosscutting.test.js
 * Cross-cutting integration tests:
 *   - Rate limiter (429 after threshold, window reset)
 *   - Error handler (structured JSON, stack trace visibility)
 *   - JWT middleware (shared behaviour across endpoints)
 */

const request = require("supertest");
const express = require("express");
const app = require("./helpers/app");
const db = require("./helpers/db");
const { validToken, expiredToken, malformedToken } = require("./helpers/tokens");
const { rateLimiter } = require("../middleware/rateLimiter");
const { errorHandler, AppError } = require("../utils/errorHandler");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

beforeAll(async () => {
  await db.connect();
});

afterEach(async () => {
  await db.clearDatabase();
});

afterAll(async () => {
  await db.disconnect();
});

// ─────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────
async function seedUser(role = "player", emailPrefix = "user") {
  const hashed = await bcrypt.hash("password123", 10);
  return User.create({
    name: "Test User",
    email: `${emailPrefix}@example.com`,
    password: hashed,
    role,
  });
}

// ─────────────────────────────────────────────────────────
// Rate Limiter
// ─────────────────────────────────────────────────────────
describe("Rate Limiter", () => {
  /**
   * Build a fresh throwaway Express app with a very tight limit (max 2 requests)
   * so we don't pollute the shared rateLimit store used by the main app routes.
   */
  let ipCounter = 1;
  function buildLimitedApp(maxReqs, windowMs) {
    const testApp = express();
    const clientIp = `192.168.1.${ipCounter++}`;
    testApp.use((req, res, next) => {
      Object.defineProperty(req, "ip", { value: clientIp, configurable: true });
      next();
    });
    testApp.use(rateLimiter(maxReqs, windowMs));
    testApp.get("/ping", (req, res) => res.json({ ok: true }));
    return testApp;
  }

  test("allows requests up to the limit", async () => {
    const limitedApp = buildLimitedApp(3, 99999);
    const r1 = await request(limitedApp).get("/ping");
    const r2 = await request(limitedApp).get("/ping");
    const r3 = await request(limitedApp).get("/ping");
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r3.status).toBe(200);
  });

  test("returns 429 on the (maxRequests+1)th request", async () => {
    const limitedApp = buildLimitedApp(2, 99999);
    await request(limitedApp).get("/ping"); // 1
    await request(limitedApp).get("/ping"); // 2
    const res = await request(limitedApp).get("/ping"); // 3 — over limit
    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/too many requests/i);
    expect(res.body.retryAfter).toBeDefined();
  });

  test("allows requests again after window resets", async () => {
    // Window of 50 ms
    const limitedApp = buildLimitedApp(1, 50);
    const r1 = await request(limitedApp).get("/ping"); // 1 — reaches limit
    expect(r1.status).toBe(200);

    // Wait for the window to expire
    await new Promise((resolve) => setTimeout(resolve, 80));

    const res = await request(limitedApp).get("/ping"); // window reset → allowed
    expect(res.status).toBe(200);
  });

  test("429 response body does not contain a stack trace", async () => {
    const limitedApp = buildLimitedApp(1, 99999);
    await request(limitedApp).get("/ping");
    const res = await request(limitedApp).get("/ping");
    expect(res.status).toBe(429);
    expect(res.body.stack).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────
// Error Handler
// ─────────────────────────────────────────────────────────
describe("Error Handler", () => {
  /**
   * Build a minimal app that intentionally throws an error
   * so we can verify the global error handler formats it correctly.
   */
  function buildErrorApp(nodeEnv, err) {
    const testApp = express();
    testApp.use(express.json());
    testApp.get("/boom", () => {
      throw err;
    });
    // Apply error handler with desired NODE_ENV context
    testApp.use((e, req, res, next) => {
      process.env.NODE_ENV = nodeEnv;
      errorHandler(e, req, res, next);
    });
    return testApp;
  }

  test("production: returns structured JSON (success=false + message, NO stack)", async () => {
    const testApp = buildErrorApp("production", new AppError("Something broke", 500));
    const res = await request(testApp).get("/boom");
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Something broke");
    expect(res.body.stack).toBeUndefined();
  });

  test("development: response includes stack trace", async () => {
    const testApp = buildErrorApp("development", new AppError("Dev error", 422));
    const res = await request(testApp).get("/boom");
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.stack).toBeDefined();
  });

  test("Mongoose duplicate key (code 11000) → 400 with human message", async () => {
    // Simulate a MongoDB duplicate-key error object
    const dupErr = new Error("E11000 duplicate key error");
    dupErr.code = 11000;
    dupErr.keyValue = { email: "x@x.com" };

    const testApp = buildErrorApp("production", dupErr);
    const res = await request(testApp).get("/boom");
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
    expect(res.body.success).toBe(false);
  });

  test("malformed request body (invalid JSON) returns 400 not a raw error", async () => {
    const res = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send("{ invalid json }");
    // Express body-parser returns 400 for unparseable JSON
    expect(res.status).toBe(400);
    // Must not expose raw Node.js stack
    expect(res.body.stack).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────
// JWT Middleware (shared behaviour, tested via /auth/me)
// ─────────────────────────────────────────────────────────
describe("JWT Middleware", () => {
  let user;

  beforeEach(async () => {
    user = await seedUser("player", "jwt");
  });

  test("valid token → request passes through (200)", async () => {
    const token = validToken(user);
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test("missing Authorization header → 401 'No token provided'", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/no token/i);
  });

  test("malformed token → 401 'Invalid or expired token'", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${malformedToken()}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid or expired/i);
  });

  test("expired token → 401 'Invalid or expired token'", async () => {
    const token = expiredToken(user);
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid or expired/i);
  });

  test("token with wrong secret → 401", async () => {
    const jwt = require("jsonwebtoken");
    const badToken = jwt.sign(
      { id: user._id.toString(), role: user.role },
      "completely_wrong_secret",
      { expiresIn: "7d" }
    );
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${badToken}`);
    expect(res.status).toBe(401);
  });

  test("Bearer prefix missing → 401 (token is malformed or undefined)", async () => {
    const token = validToken(user);
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", token); // no 'Bearer ' prefix — split(" ")[1] = undefined
    expect(res.status).toBe(401);
  });
});
