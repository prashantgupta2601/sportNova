/**
 * tests/admin.test.js
 * Integration tests for:
 *   GET    /admin/users
 *   PATCH  /admin/users/:id/role
 *   DELETE /admin/users/:id
 *   DELETE /admin/performance/:id
 */

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("./helpers/app");
const db = require("./helpers/db");
const { validToken } = require("./helpers/tokens");
const User = require("../models/User");
const Performance = require("../models/Performance");
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
// Helpers
// ─────────────────────────────────────────────────────────
async function seedUser(role, emailPrefix) {
  const hashed = await bcrypt.hash("password123", 10);
  return User.create({
    name: "Test User",
    email: `${emailPrefix}@example.com`,
    password: hashed,
    role,
  });
}

async function seedPerformance(userId, overrides = {}) {
  return Performance.create({
    userId,
    sport: "Cricket",
    speed: 80,
    stamina: 75,
    strength: 70,
    ...overrides,
  });
}

// ─────────────────────────────────────────────────────────
// GET /admin/users
// ─────────────────────────────────────────────────────────
describe("GET /admin/users", () => {
  let admin, player, coach;
  let adminToken, playerToken;

  beforeEach(async () => {
    admin  = await seedUser("admin",  "admin");
    player = await seedUser("player", "player");
    coach  = await seedUser("coach",  "coach");
    adminToken  = validToken(admin);
    playerToken = validToken(player);
  });

  test("200 — admin gets all users with pagination", async () => {
    const res = await request(app)
      .get("/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination.total).toBe(3);
    // No passwords exposed
    res.body.data.forEach((u) => expect(u.password).toBeUndefined());
  });

  test("200 — role filter ?role=player returns only players", async () => {
    const res = await request(app)
      .get("/admin/users?role=player")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.data[0].role).toBe("player");
  });

  test("200 — role filter ?role=coach returns only coaches", async () => {
    const res = await request(app)
      .get("/admin/users?role=coach")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data[0].role).toBe("coach");
  });

  test("200 — NaN page param defaults to page=1", async () => {
    const res = await request(app)
      .get("/admin/users?page=abc")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  test("200 — NaN limit param defaults to limit=20", async () => {
    const res = await request(app)
      .get("/admin/users?limit=xyz")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(20);
  });

  test("403 — non-admin (player) is blocked", async () => {
    const res = await request(app)
      .get("/admin/users")
      .set("Authorization", `Bearer ${playerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/admin access only/i);
  });

  test("401 — unauthenticated", async () => {
    const res = await request(app).get("/admin/users");
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
// PATCH /admin/users/:id/role
// ─────────────────────────────────────────────────────────
describe("PATCH /admin/users/:id/role", () => {
  let admin, player;
  let adminToken, playerToken;

  beforeEach(async () => {
    admin  = await seedUser("admin",  "admin");
    player = await seedUser("player", "player");
    adminToken  = validToken(admin);
    playerToken = validToken(player);
  });

  test("200 — valid role change returns updated user", async () => {
    const res = await request(app)
      .patch(`/admin/users/${player._id}/role`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "coach" });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe("coach");
    expect(res.body.password).toBeUndefined();
  });

  test("400 — invalid role value", async () => {
    const res = await request(app)
      .patch(`/admin/users/${player._id}/role`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "superadmin" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid role/i);
  });

  test("404 — non-existent user ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/admin/users/${fakeId}/role`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "scout" });
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/user not found/i);
  });

  test("400 — invalid ID format", async () => {
    const res = await request(app)
      .patch("/admin/users/not-an-id/role")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "coach" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid user id/i);
  });

  test("403 — non-admin blocked", async () => {
    const res = await request(app)
      .patch(`/admin/users/${player._id}/role`)
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ role: "coach" });
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────
// DELETE /admin/users/:id
// ─────────────────────────────────────────────────────────
describe("DELETE /admin/users/:id", () => {
  let admin, player;
  let adminToken;

  beforeEach(async () => {
    admin  = await seedUser("admin",  "admin");
    player = await seedUser("player", "player");
    adminToken = validToken(admin);

    // Seed 3 performance records for the player
    for (let i = 0; i < 3; i++) {
      await seedPerformance(player._id);
    }
  });

  test("200 — successfully deletes user", async () => {
    const res = await request(app)
      .delete(`/admin/users/${player._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

    // Confirm user is gone
    const found = await User.findById(player._id);
    expect(found).toBeNull();
  });

  test("200 — cascades: deletes all performance records for that user", async () => {
    await request(app)
      .delete(`/admin/users/${player._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    const perfCount = await Performance.countDocuments({ userId: player._id });
    expect(perfCount).toBe(0);
  });

  test("404 — non-existent user", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/admin/users/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/user not found/i);
  });

  test("400 — invalid ID format", async () => {
    const res = await request(app)
      .delete("/admin/users/not-valid")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────
// DELETE /admin/performance/:id
// ─────────────────────────────────────────────────────────
describe("DELETE /admin/performance/:id", () => {
  let admin, player;
  let adminToken;
  let perfRecord;

  beforeEach(async () => {
    admin  = await seedUser("admin",  "admin");
    player = await seedUser("player", "player");
    adminToken = validToken(admin);
    perfRecord = await seedPerformance(player._id);
  });

  test("200 — valid delete removes performance record", async () => {
    const res = await request(app)
      .delete(`/admin/performance/${perfRecord._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/performance deleted/i);

    const found = await Performance.findById(perfRecord._id);
    expect(found).toBeNull();
  });

  test("404 — non-existent performance record", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/admin/performance/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/performance not found/i);
  });

  test("400 — invalid performance ID format", async () => {
    const res = await request(app)
      .delete("/admin/performance/bad-id")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });

  test("403 — non-admin blocked", async () => {
    const nonAdmin = await seedUser("player", "notadmin");
    const token = validToken(nonAdmin);
    const res = await request(app)
      .delete(`/admin/performance/${perfRecord._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
