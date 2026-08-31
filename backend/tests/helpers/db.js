/**
 * tests/helpers/db.js
 * Manages an in-memory MongoDB instance for the test suite.
 * Tests NEVER connect to the real Atlas database.
 */

// Extend timeout globally — mongodb-memory-server downloads a binary (~780 MB)
// the very first time it runs. Subsequent runs use the cached binary.
if (typeof jest !== "undefined") {
  jest.setTimeout(120000);
}

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongod;

/**
 * Start the in-memory server and connect Mongoose to it.
 */
async function connect() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}

/**
 * Drop every collection so each test starts with a clean slate.
 * Call this in beforeEach() inside test files.
 */
async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

/**
 * Disconnect Mongoose and shut down the in-memory server.
 * Call this in afterAll() inside test files.
 */
async function disconnect() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
}

module.exports = { connect, clearDatabase, disconnect };
