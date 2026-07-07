/** Per-IP token-bucket rate limiting → 429. Uses a dedicated tiny-bucket server. */

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { startServer } from './helpers.js';

describe('rate limiting', () => {
  /** @type {Awaited<ReturnType<typeof startServer>>} */
  let srv;

  before(async () => {
    // Tiny bucket with effectively no refill so the test is deterministic.
    srv = await startServer({ rateLimit: { capacity: 5, refillPerSecond: 0.001 } });
  });
  after(() => srv.stop());

  it('returns 429 once the bucket is drained, with Retry-After', async () => {
    /** @type {number[]} */
    const statuses = [];
    for (let i = 0; i < 12; i += 1) {
      const res = await fetch(`${srv.baseUrl}/api/v1/health`);
      statuses.push(res.status);
      if (res.status === 429) {
        assert.equal(res.headers.get('retry-after'), '1');
        const body = await res.json();
        assert.equal(body.error.code, 'RATE_LIMITED');
      } else {
        await res.arrayBuffer(); // drain keep-alive
      }
    }
    assert.equal(statuses.filter((s) => s === 200).length, 5, 'first 5 pass');
    assert.ok(statuses.slice(5).every((s) => s === 429), 'remainder limited');
  });
});
