/**
 * tests/coach.test.js
 * Integration tests for:
 *   GET /coach/players
 *   GET /coach/player/:id/performance
 *   GET /coach/compare
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
    sport: "Football",
    speed: 80,
    stamina: 75,
    strength: 70,
    ...overrides,
  });
}

// ─────────────────────────────────────────────────────────
// GET /coach/players
// ─────────────────────────────────────────────────────────
describe("GET /coach/players", () => {
  let coach, admin, player, scout, playerRole;
  let coachToken, adminToken, playerToken, scoutToken;

  beforeEach(async () => {
    coach      = await seedUser("coach",  "coach");
    admin      = await seedUser("admin",  "admin");
    playerRole = await seedUser("player", "player");
    scout      = await seedUser("scout",  "scout");
    coachToken  = validToken(coach);
    adminToken  = validToken(admin);
    playerToken = validToken(playerRole);
    scoutToken  = validToken(scout);

    // Create players with different sports
    await seedUser("player", "pl1"); // will have no sport set
    const hashed = await bcrypt.hash("password123", 10);
    await User.create({ name: "Soccer Pl", email: "soccer@example.com", password: hashed, role: "player", sport: "Soccer" });
    await User.create({ name: "Tennis Pl", email: "tennis@example.com", password: hashed, role: "player", sport: "Tennis" });
  });

  test("200 — coach gets list of players", async () => {
    const res = await request(app)
      .get("/coach/players")
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    // All returned users should have role=player
    res.body.data.forEach((u) => expect(u.role).toBe("player"));
    expect(res.body.pagination).toBeDefined();
  });

  test("200 — admin can access player list", async () => {
    const res = await request(app)
      .get("/coach/players")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test("200 — scout can access player list", async () => {
    const res = await request(app)
      .get("/coach/players")
      .set("Authorization", `Bearer ${scoutToken}`);
    expect(res.status).toBe(200);
  });

  test("403 — player role is blocked", async () => {
    const res = await request(app)
      .get("/coach/players")
      .set("Authorization", `Bearer ${playerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/access denied/i);
  });

  test("401 — unauthenticated", async () => {
    const res = await request(app).get("/coach/players");
    expect(res.status).toBe(401);
  });

  test("200 — sport filter returns only matching players", async () => {
    const res = await request(app)
      .get("/coach/players?sport=Soccer")
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.data[0].sport).toBe("Soccer");
  });

  test("200 — pagination (page=1&limit=1) returns 1 player", async () => {
    const res = await request(app)
      .get("/coach/players?page=1&limit=1")
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────
// GET /coach/player/:id/performance
// ─────────────────────────────────────────────────────────
describe("GET /coach/player/:id/performance", () => {
  let coach, player;
  let coachToken, playerToken;

  beforeEach(async () => {
    coach  = await seedUser("coach",  "coach");
    player = await seedUser("player", "player");
    coachToken  = validToken(coach);
    playerToken = validToken(player);

    await seedPerformance(player._id, { speed: 90 });
    await seedPerformance(player._id, { speed: 85 });
  });

  test("200 — coach gets player performance array", async () => {
    const res = await request(app)
      .get(`/coach/player/${player._id}/performance`)
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  test("200 — non-existent player ID returns empty array (no records)", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/coach/player/${fakeId}/performance`)
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });

  test("400 — invalid ID format", async () => {
    const res = await request(app)
      .get("/coach/player/not-a-valid-id/performance")
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid player id/i);
  });

  test("403 — player role is blocked", async () => {
    const res = await request(app)
      .get(`/coach/player/${player._id}/performance`)
      .set("Authorization", `Bearer ${playerToken}`);
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────
// GET /coach/compare
// ─────────────────────────────────────────────────────────
describe("GET /coach/compare", () => {
  let coach, player1, player2;
  let coachToken;

  beforeEach(async () => {
    coach   = await seedUser("coach",   "coach");
    player1 = await seedUser("player",  "player1");
    player2 = await seedUser("player",  "player2");
    coachToken = validToken(coach);

    await seedPerformance(player1._id, { speed: 90, stamina: 80, strength: 70 });
    await seedPerformance(player2._id, { speed: 60, stamina: 55, strength: 50 });
  });

  test("200 — both players exist with performance data", async () => {
    const res = await request(app)
      .get(`/coach/compare?p1=${player1._id}&p2=${player2._id}`)
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(200);
    expect(res.body.p1.speed).toBe(90);
    expect(res.body.p2.speed).toBe(60);
  });

  test("200 — player with no performance returns zeros (no divide-by-zero crash)", async () => {
    const playerNoPerf = await seedUser("player", "noperf");
    const res = await request(app)
      .get(`/coach/compare?p1=${player1._id}&p2=${playerNoPerf._id}`)
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(200);
    expect(res.body.p2.speed).toBe(0);
    expect(res.body.p2.stamina).toBe(0);
    expect(res.body.p2.strength).toBe(0);
  });

  test("200 — same player ID for p1 and p2 (divide-by-zero edge case)", async () => {
    // Both p1 and p2 have same stats — total > 0 so no division issues
    const res = await request(app)
      .get(`/coach/compare?p1=${player1._id}&p2=${player1._id}`)
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(200);
    expect(res.body.p1.speed).toBe(res.body.p2.speed);
  });

  test("200 — both players have no performance (all zeros — p1+p2=0)", async () => {
    const p3 = await seedUser("player", "p3");
    const p4 = await seedUser("player", "p4");
    const res = await request(app)
      .get(`/coach/compare?p1=${p3._id}&p2=${p4._id}`)
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(200);
    // No crash — all zeros
    expect(res.body.p1.speed).toBe(0);
    expect(res.body.p2.speed).toBe(0);
  });

  test("400 — invalid IDs", async () => {
    const res = await request(app)
      .get("/coach/compare?p1=bad&p2=ids")
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid player ids/i);
  });

  test("400 — missing p2 parameter", async () => {
    const res = await request(app)
      .get(`/coach/compare?p1=${player1._id}`)
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(400);
  });
});
