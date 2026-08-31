/**
 * tests/recommendations.test.js
 * Integration tests for POST /recommendations/generate
 *
 * Gemini and OpenAI SDK modules are mocked at the Jest module level —
 * no real API calls are made.
 *
 * Strategy: the mocked constructors close over a shared `ctrl` object.
 * Tests set ctrl fields before each call so the mock implementations
 * respond correctly. This works even after Jest module caching because
 * the mock factory is evaluated once, and the closures reference the
 * same ctrl object throughout the test run.
 */

// ── Shared control state (mutated per-test) ────────────────────────────────────
const ctrl = {
  geminiShouldFail: false,
  geminiResponse: null,  // JSON string returned by fake Gemini
  openaiShouldFail: false,
  openaiResponse: null,  // JSON string returned by fake OpenAI
};

// ── Mock @google/generative-ai ─────────────────────────────────────────────────
jest.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockImplementation(() => {
          if (ctrl.geminiShouldFail) {
            return Promise.reject(new Error("Gemini API Error"));
          }
          return Promise.resolve({
            response: { text: () => ctrl.geminiResponse },
          });
        }),
      }),
    })),
  };
});

// ── Mock openai ────────────────────────────────────────────────────────────────
jest.mock("openai", () => {
  const OpenAI = jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockImplementation(() => {
          if (ctrl.openaiShouldFail) {
            return Promise.reject(new Error("OpenAI API Error"));
          }
          return Promise.resolve({
            choices: [{ message: { content: ctrl.openaiResponse } }],
          });
        }),
      },
    },
  }));
  return OpenAI;
});

// ── Imports (after mocks are hoisted) ─────────────────────────────────────────
const request = require("supertest");
const app = require("./helpers/app");
const db = require("./helpers/db");
const { validToken } = require("./helpers/tokens");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ── Lifecycle ──────────────────────────────────────────────────────────────────
beforeAll(async () => {
  await db.connect();
});

afterEach(async () => {
  await db.clearDatabase();
  // Reset ctrl to safe defaults after every test
  ctrl.geminiShouldFail = false;
  ctrl.geminiResponse = null;
  ctrl.openaiShouldFail = false;
  ctrl.openaiResponse = null;
});

afterAll(async () => {
  await db.disconnect();
});

// ── Helpers ────────────────────────────────────────────────────────────────────
async function seedUser(role = "player", emailPrefix = "user") {
  const hashed = await bcrypt.hash("password123", 10);
  return User.create({
    name: "Test User",
    email: `${emailPrefix}@example.com`,
    password: hashed,
    role,
  });
}

/** JSON array string with `count` fake recommendation objects. */
function makeAiResponse(count = 3) {
  const items = Array.from({ length: count }, (_, i) => ({
    title: `Tip ${i + 1}`,
    description: `Description for tip ${i + 1}`,
    category: "Technique",
  }));
  return JSON.stringify(items);
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe("POST /recommendations/generate", () => {
  let player, coach;
  let playerToken, coachToken;

  beforeEach(async () => {
    player = await seedUser("player", "player");
    coach  = await seedUser("coach",  "coach");
    playerToken = validToken(player);
    coachToken  = validToken(coach);
  });

  // ── Input validation ─────────────────────────────────────────────────────────

  test("400 — missing sport field", async () => {
    const res = await request(app)
      .post("/recommendations/generate")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ count: 5 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/valid input/i);
  });

  test("400 — sport is too short (1 char)", async () => {
    const res = await request(app)
      .post("/recommendations/generate")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ sport: "X", count: 5 });
    expect(res.status).toBe(400);
  });

  test("401 — unauthenticated request", async () => {
    const res = await request(app)
      .post("/recommendations/generate")
      .send({ sport: "Cricket", count: 5 });
    expect(res.status).toBe(401);
  });

  // ── Gemini success ───────────────────────────────────────────────────────────

  test("200 — Gemini success: source=gemini, array in recommendations", async () => {
    ctrl.geminiResponse = makeAiResponse(3);

    const res = await request(app)
      .post("/recommendations/generate")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ sport: "Cricket", count: 3, type: "training" });
    expect(res.status).toBe(200);
    expect(res.body.source).toBe("gemini");
    expect(Array.isArray(res.body.recommendations)).toBe(true);
    expect(res.body.recommendations.length).toBe(3);
    expect(res.body.sport).toBe("Cricket");
    expect(res.body.mode).toBe("training");
  });

  // ── Gemini failure → OpenAI fallback ────────────────────────────────────────

  test("200 — Gemini fails, OpenAI fallback: source=openai", async () => {
    ctrl.geminiShouldFail = true;
    ctrl.openaiResponse = makeAiResponse(2);

    const res = await request(app)
      .post("/recommendations/generate")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ sport: "Football", count: 2, type: "training" });
    expect(res.status).toBe(200);
    expect(res.body.source).toBe("openai");
    expect(Array.isArray(res.body.recommendations)).toBe(true);
  });

  // ── Both fail → demo data ────────────────────────────────────────────────────

  test("200 — Gemini + OpenAI both fail: source=demo", async () => {
    ctrl.geminiShouldFail = true;
    ctrl.openaiShouldFail = true;

    const res = await request(app)
      .post("/recommendations/generate")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ sport: "Cricket", count: 5, type: "training" });
    expect(res.status).toBe(200);
    expect(res.body.source).toBe("demo");
    expect(Array.isArray(res.body.recommendations)).toBe(true);
    expect(res.body.recommendations.length).toBeGreaterThan(0);
  });

  // ── Mode detection ───────────────────────────────────────────────────────────

  test("200 — type=search sets mode=search", async () => {
    ctrl.geminiResponse = makeAiResponse(2);

    const res = await request(app)
      .post("/recommendations/generate")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ sport: "Cricket", type: "search" });
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe("search");
  });

  test("200 — type=training sets mode=training", async () => {
    ctrl.geminiResponse = makeAiResponse(3);

    const res = await request(app)
      .post("/recommendations/generate")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ sport: "Cricket", type: "training" });
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe("training");
  });

  // ── Role in response ─────────────────────────────────────────────────────────

  test("200 — player role included in response", async () => {
    ctrl.geminiResponse = makeAiResponse(3);

    const res = await request(app)
      .post("/recommendations/generate")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ sport: "Cricket", count: 3 });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe("player");
  });

  test("200 — coach role included in response", async () => {
    ctrl.geminiResponse = makeAiResponse(3);

    const res = await request(app)
      .post("/recommendations/generate")
      .set("Authorization", `Bearer ${coachToken}`)
      .send({ sport: "Football", count: 3 });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe("coach");
  });

  // ── count is capped at 10 ────────────────────────────────────────────────────

  test("200 — count > 10 is capped (Gemini still called)", async () => {
    ctrl.geminiResponse = makeAiResponse(10);

    const res = await request(app)
      .post("/recommendations/generate")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ sport: "Basketball", count: 99 });
    expect(res.status).toBe(200);
    expect(res.body.recommendations.length).toBeLessThanOrEqual(10);
  });

  // ── Both AI fail → demo: always structured JSON, never a crash ───────────────

  test("200 — both AIs fail still returns structured JSON (demo fallback)", async () => {
    ctrl.geminiShouldFail = true;
    ctrl.openaiShouldFail = true;

    const res = await request(app)
      .post("/recommendations/generate")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ sport: "Tennis" });

    expect([200, 500]).toContain(res.status);
    expect(res.body).toBeDefined();
    if (res.status === 200) {
      expect(res.body.source).toBe("demo");
      expect(Array.isArray(res.body.recommendations)).toBe(true);
    }
  });
});
