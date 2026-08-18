const test = require('node:test');
const assert = require('node:assert/strict');

test('database module exposes explicit startup initializer instead of auto-running table creation on import', () => {
  const dbConfig = require('../config/database');

  assert.equal(typeof dbConfig.initializeDatabase, 'function');
  assert.equal(typeof dbConfig.initTables, 'function');
  assert.equal(typeof dbConfig.testConnection, 'function');
});
