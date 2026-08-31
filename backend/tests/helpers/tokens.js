/**
 * tests/helpers/tokens.js
 * Centralised JWT helpers so every test file creates tokens the same way.
 */
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "test_secret_key_for_jest_suite";

/**
 * Sign an arbitrary payload.
 * @param {object} payload
 * @param {object} [options]  – passed to jwt.sign (e.g. { expiresIn: "7d" })
 */
function makeToken(payload, options = {}) {
  return jwt.sign(payload, SECRET, options);
}

/**
 * A valid 7-day token for a given user object ({ _id, role }).
 */
function validToken(user) {
  return makeToken(
    { id: user._id.toString(), role: user.role },
    { expiresIn: "7d" }
  );
}

/**
 * An already-expired token (signed with -1 second TTL).
 */
function expiredToken(user) {
  return makeToken(
    { id: user._id.toString(), role: user.role },
    { expiresIn: "-1s" }
  );
}

/**
 * A string that is syntactically wrong for JWT parsing.
 */
function malformedToken() {
  return "not.a.valid.jwt.token";
}

module.exports = { makeToken, validToken, expiredToken, malformedToken, SECRET };
