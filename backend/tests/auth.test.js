/**
 * tests/auth.test.js
 * Integration tests for POST /auth/register, POST /auth/login, GET /auth/me
 */

const request = require("supertest");
const app = require("./helpers/app");
const db = require("./helpers/db");
const { validToken, expiredToken, malformedToken } = require("./helpers/tokens");
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
// Helper — seed a user directly in DB
// ─────────────────────────────────────────────────────────
async function seedUser(overrides = {}) {
  const hashed = await bcrypt.hash("password123", 10);
  const user = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: hashed,
    role: "player",
    ...overrides,
  });
  return user;
}

// ─────────────────────────────────────────────────────────
// POST /auth/register
// ─────────────────────────────────────────────────────────
describe("POST /auth/register", () => {
  const validBody = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "secret123",
    role: "player",
  };

  test("201 — valid registration returns token + user", async () => {
    const res = await request(app).post("/auth/register").send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("jane@example.com");
    expect(res.body.user.password).toBeUndefined(); // no password leak
  });

  test("400 — duplicate email rejected", async () => {
    await request(app).post("/auth/register").send(validBody);
    const res = await request(app).post("/auth/register").send(validBody);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email already exists/i);
  });

  test("400 — missing name", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...validBody, name: "" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test("400 — name too short (1 char)", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...validBody, name: "J" });
    expect(res.status).toBe(400);
  });

  test("400 — password shorter than 6 chars", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...validBody, password: "abc" });
    expect(res.status).toBe(400);
  });

  test("400 — invalid email format", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...validBody, email: "not-an-email" });
    expect(res.status).toBe(400);
  });

  test("201 — role=coach is accepted", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...validBody, email: "coach@example.com", role: "coach" });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("coach");
  });

  test("201 — role=scout is accepted", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...validBody, email: "scout@example.com", role: "scout" });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("scout");
  });

  test("201 — role=admin is accepted", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...validBody, email: "admin@example.com", role: "admin" });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("admin");
  });

  test("400 — invalid role value", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...validBody, email: "x@example.com", role: "superuser" });
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────────────────────
describe("POST /auth/login", () => {
  beforeEach(async () => {
    await seedUser({ email: "player@example.com" });
  });

  test("200 — correct credentials returns token + user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "player@example.com", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("player@example.com");
    expect(res.body.user.password).toBeUndefined();
  });

  test("400 — wrong password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "player@example.com", password: "wrongpass" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  test("400 — non-existent user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@example.com", password: "password123" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  test("400 — missing email", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ password: "password123" });
    expect(res.status).toBe(400);
  });

  test("400 — missing password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "player@example.com" });
    expect(res.status).toBe(400);
  });

  test("400 — invalid email format", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "not-an-email", password: "password123" });
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────
// GET /auth/me
// ─────────────────────────────────────────────────────────
describe("GET /auth/me", () => {
  let user;

  beforeEach(async () => {
    user = await seedUser({ email: "me@example.com" });
  });

  test("200 — valid token returns user (no password)", async () => {
    const token = validToken(user);
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@example.com");
    expect(res.body.user.password).toBeUndefined();
  });

  test("401 — no token provided", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/no token/i);
  });

  test("401 — expired token", async () => {
    const token = expiredToken(user);
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid or expired/i);
  });

  test("401 — malformed token", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${malformedToken()}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid or expired/i);
  });
});
