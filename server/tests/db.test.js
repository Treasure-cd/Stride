import test from 'node:test';
import assert from 'node:assert/strict';

import { connectDB } from '../db/index.js';

test('connectDB should not exit when MONGODB_URI is missing', async () => {
  const previousUri = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;

  try {
    const result = await connectDB();
    assert.equal(result, false);
  } finally {
    if (previousUri !== undefined) {
      process.env.MONGODB_URI = previousUri;
    }
  }
});
