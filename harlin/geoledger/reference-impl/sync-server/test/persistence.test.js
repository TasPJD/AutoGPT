/** Restart persistence: same dataDir, new instance — seq continues, data intact. */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { api, registerDevice, startServer } from './helpers.js';

/** @param {Buffer | string} data */
const sha = (data) => crypto.createHash('sha256').update(data).digest('hex');

describe('restart persistence', () => {
  it('a fresh instance over the same dataDir resumes seq, registry, changesets and photos', async () => {
    const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gl-relay-persist-'));

    // ---- first server lifetime -----------------------------------------
    const first = await startServer({ dataDir });
    const token = await registerDevice(first.baseUrl, first.adminToken, 'RIG-P');
    for (let i = 1; i <= 3; i += 1) {
      const { status, body } = await api(first.baseUrl, '/api/v1/changesets', {
        method: 'POST',
        token,
        body: { changesetId: `cs-p-${i}`, deviceId: 'RIG-P', schemaVersion: 6, payload: { i } },
      });
      assert.equal(status, 201);
      assert.equal(body.seq, i);
    }
    const photo = Buffer.from('persisted-photo-bytes');
    const up = await fetch(`${first.baseUrl}/api/v1/photos/DDH-P/tray1.jpg`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-sha256': sha(photo) },
      body: photo,
    });
    assert.equal(up.status, 201);
    await first.stop();

    // ---- second server lifetime, same dataDir --------------------------
    const second = await startServer({ dataDir });
    try {
      // Old device token still valid (fleet.json persisted, hashes only).
      const health = await api(second.baseUrl, '/api/v1/health');
      assert.equal(health.body.seq, 3, 'sequence counter recovered');
      assert.equal(health.body.devices, 1, 'device registry recovered');

      // Seq strictly continues — no reuse after restart.
      const next = await api(second.baseUrl, '/api/v1/changesets', {
        method: 'POST',
        token,
        body: { changesetId: 'cs-p-4', deviceId: 'RIG-P', schemaVersion: 6, payload: { i: 4 } },
      });
      assert.equal(next.status, 201);
      assert.equal(next.body.seq, 4);

      // Idempotency map survives restart: replay of a pre-restart upload.
      const replay = await api(second.baseUrl, '/api/v1/changesets', {
        method: 'POST',
        token,
        body: { changesetId: 'cs-p-2', deviceId: 'RIG-P', schemaVersion: 6, payload: { i: 2 } },
      });
      assert.equal(replay.status, 200);
      assert.equal(replay.body.duplicate, true);
      assert.equal(replay.body.seq, 2);

      // Full stream intact and ordered, payloads readable.
      const all = await api(second.baseUrl, '/api/v1/changesets?since=0&limit=100', { token });
      assert.deepEqual(
        all.body.items.map((i) => [i.seq, i.changesetId]),
        [
          [1, 'cs-p-1'],
          [2, 'cs-p-2'],
          [3, 'cs-p-3'],
          [4, 'cs-p-4'],
        ],
      );
      assert.deepEqual(all.body.items[2].payload, { i: 3 });

      // Photo intact.
      const got = await fetch(`${second.baseUrl}/api/v1/photos/DDH-P/tray1.jpg`, {
        headers: { authorization: `Bearer ${token}` },
      });
      assert.equal(got.status, 200);
      assert.deepEqual(Buffer.from(await got.arrayBuffer()), photo);

      // Audit trail covers pre- and post-restart entries.
      const audit = await api(second.baseUrl, '/api/v1/audit?since=0', { token: second.adminToken });
      assert.equal(audit.status, 200);
      assert.equal(audit.body.items.length, 4);
      assert.ok(audit.body.items.every((e) => typeof e.sha256 === 'string' && typeof e.receivedAt === 'string'));
    } finally {
      await second.stop();
    }
  });

  it('recovers the counter even if seq file lags the index (crash simulation)', async () => {
    const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gl-relay-crash-'));
    const first = await startServer({ dataDir });
    const token = await registerDevice(first.baseUrl, first.adminToken, 'RIG-C');
    await api(first.baseUrl, '/api/v1/changesets', {
      method: 'POST',
      token,
      body: { changesetId: 'cs-c-1', deviceId: 'RIG-C', schemaVersion: 6, payload: { a: 1 } },
    });
    await api(first.baseUrl, '/api/v1/changesets', {
      method: 'POST',
      token,
      body: { changesetId: 'cs-c-2', deviceId: 'RIG-C', schemaVersion: 6, payload: { a: 2 } },
    });
    await first.stop();

    // Simulate a crash where the counter write never landed.
    fs.writeFileSync(path.join(dataDir, 'seq'), '0\n');

    const second = await startServer({ dataDir });
    try {
      const { body } = await api(second.baseUrl, '/api/v1/changesets', {
        method: 'POST',
        token,
        body: { changesetId: 'cs-c-3', deviceId: 'RIG-C', schemaVersion: 6, payload: { a: 3 } },
      });
      assert.equal(body.seq, 3, 'seq must never be re-issued even when the counter file lags');
    } finally {
      await second.stop();
    }
  });
});
