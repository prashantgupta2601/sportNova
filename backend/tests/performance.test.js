/**
 * tests/performance.test.js
 * Integration tests for:
 *   POST /performance/add
 *   GET  /performance/my
 *   GET  /performance/all
 */

const request = require("supertest");
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
async function seedUser(role = "player", emailPrefix = "user") {
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
// POST /performance/add
// ─────────────────────────────────────────────────────────
describe("POST /performance/add", () => {
  let player;
  let playerToken;

  beforeEach(async () => {
    player = await seedUser("player", "player");
    playerToken = validToken(player);
  });

  test("201 — valid entry with videoUrl", async () => {
    const res = await request(app)
      .post("/performance/add")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        sport: "Cricket",
        speed: 85,
        stamina: 70,
        strength: 65,
        videoUrl: "https://youtube.com/watch?v=abc123",
      });
    expect(res.status).toBe(201);
    expect(res.body.performance.sport).toBe("Cricket");
    expect(res.body.performance.videoUrl).toBe("https://youtube.com/watch?v=abc123");
  });

  test("201 — valid entry without video", async () => {
    const res = await request(app)
      .post("/performance/add")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ sport: "Basketball", speed: 60, stamina: 55, strength: 50 });
    expect(res.status).toBe(201);
    expect(res.body.performance.videoUrl).toBe("");
  });

  test("400 — missing sport field", async () => {
    const res = await request(app)
      .post("/performance/add")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ speed: 70, stamina: 60, strength: 50 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test("400 — speed > 100 (out of range)", async () => {
    const res = await request(app)
      .post("/performance/add")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ sport: "Tennis", speed: 110, stamina: 60, strength: 50 });
    expect(res.status).toBe(400);
  });

  test("400 — negative stamina", async () => {
    const res = await request(app)
      .post("/performance/add")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ sport: "Tennis", speed: 70, stamina: -5, strength: 50 });
    expect(res.status).toBe(400);
  });

  test("400 — sport name too short (1 char)", async () => {
    const res = await request(app)
      .post("/performance/add")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ sport: "X", speed: 70, stamina: 60, strength: 50 });
    expect(res.status).toBe(400);
  });

  test("401 — unauthenticated request", async () => {
    const res = await request(app)
      .post("/performance/add")
      .send({ sport: "Tennis", speed: 70, stamina: 60, strength: 50 });
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
// GET /performance/my
// ─────────────────────────────────────────────────────────
describe("GET /performance/my", () => {
  let player;
  let playerToken;

  beforeEach(async () => {
    player = await seedUser("player", "player");
    playerToken = validToken(player);
    // Seed 3 performance records for this player
    for (let i = 0; i < 3; i++) {
      await seedPerformance(player._id, { sport: `Sport${i}` });
    }
  });

  test("200 — returns data + pagination with defaults", async () => {
    const res = await request(app)
      .get("/performance/my")
      .set("Authorization", `Bearer ${playerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(3);
  });

  test("200 — page=1&limit=2 returns 2 records", async () => {
    const res = await request(app)
      .get("/performance/my?page=1&limit=2")
      .set("Authorization", `Bearer ${playerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.pages).toBe(2);
  });

  test("200 — page=2&limit=2 returns 1 record (last page)", async () => {
    const res = await request(app)
      .get("/performance/my?page=2&limit=2")
      .set("Authorization", `Bearer ${playerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test("200 — NaN page param defaults to page=1", async () => {
    const res = await request(app)
      .get("/performance/my?page=abc&limit=10")
      .set("Authorization", `Bearer ${playerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  test("200 — NaN limit param defaults to limit=10", async () => {
    const res = await request(app)
      .get("/performance/my?page=1&limit=xyz")
      .set("Authorization", `Bearer ${playerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(10);
  });

  test("200 — out-of-range page returns empty data array", async () => {
    const res = await request(app)
      .get("/performance/my?page=999&limit=10")
      .set("Authorization", `Bearer ${playerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  test("200 — no records returns empty data array", async () => {
    const other = await seedUser("player", "other");
    const token = validToken(other);
    const res = await request(app)
      .get("/performance/my")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
    expect(res.body.pagination.total).toBe(0);
  });

  test("401 — unauthenticated", async () => {
    const res = await request(app).get("/performance/my");
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────
// GET /performance/all
// ─────────────────────────────────────────────────────────
describe("GET /performance/all", () => {
  let coach, admin, player, scout;
  let coachToken, adminToken, playerToken, scoutToken;

  beforeEach(async () => {
    coach  = await seedUser("coach",  "coach");
    admin  = await seedUser("admin",  "admin");
    player = await seedUser("player", "player");
    scout  = await seedUser("scout",  "scout");
    coachToken  = validToken(coach);
    adminToken  = validToken(admin);
    playerToken = validToken(player);
    scoutToken  = validToken(scout);

    await seedPerformance(player._id, { sport: "Cricket" });
    await seedPerformance(player._id, { sport: "Football" });
  });

  test("200 — coach role allowed", async () => {
    const res = await request(app)
      .get("/performance/all")
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(2);
  });

  test("200 — admin role allowed", async () => {
    const res = await request(app)
      .get("/performance/all")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test("403 — player role blocked", async () => {
    const res = await request(app)
      .get("/performance/all")
      .set("Authorization", `Bearer ${playerToken}`);
    expect(res.status).toBe(403);
  });

  test("403 — scout role blocked", async () => {
    const res = await request(app)
      .get("/performance/all")
      .set("Authorization", `Bearer ${scoutToken}`);
    expect(res.status).toBe(403);
  });

  test("200 — sport filter returns only matching records", async () => {
    const res = await request(app)
      .get("/performance/all?sport=Cricket")
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.data[0].sport).toBe("Cricket");
  });

  test("200 — NaN limit defaults to 20", async () => {
    const res = await request(app)
      .get("/performance/all?limit=abc")
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(20);
  });
});
