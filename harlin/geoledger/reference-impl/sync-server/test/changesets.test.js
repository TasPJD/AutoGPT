/** Changeset upload idempotency, ordered retrieval, long-poll wakeup, body limit. */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { after, before, describe, it } from 'node:test';

import { api, registerDevice, startServer } from './helpers.js';

describe('changesets', () => {
  /** @type {Awaited<ReturnType<typeof startServer>>} */
  let srv;
  /** @type {string} */
  let tokenA;
  /** @type {string} */
  let tokenB;

  before(async () => {
    srv = await startServer({ maxBodyBytes: 256 * 1024 });
    tokenA = await registerDevice(srv.baseUrl, srv.adminToken, 'RIG-A');
    tokenB = await registerDevice(srv.baseUrl, srv.adminToken, 'RIG-B');
  });
  after(() => srv.stop());

  /**
   * @param {string} token
   * @param {string} deviceId
   * @param {string} changesetId
   * @param {unknown} payload
   */
  function upload(token, deviceId, changesetId, payload) {
    return api(srv.baseUrl, '/api/v1/changesets', {
      method: 'POST',
      token,
      body: { changesetId, deviceId, schemaVersion: '0.6.0', payload },
    });
  }

  it('accepts a changeset, assigns seq, returns payload sha256', async () => {
    const payload = { table: 'core_intervals', rows: [{ id: 1, depth_from: 0, depth_to: 1.5 }] };
    const { status, body } = await upload(tokenA, 'RIG-A', 'cs-a-1', payload);
    assert.equal(status, 201);
    assert.equal(body.seq, 1);
    assert.equal(body.duplicate, false);
    assert.equal(body.sha256, crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex'));
  });

  it('is idempotent on changesetId — replay returns the same seq with duplicate:true', async () => {
    const payload = { rows: [1, 2, 3] };
    const first = await upload(tokenA, 'RIG-A', 'cs-a-2', payload);
    assert.equal(first.status, 201);
    const replay = await upload(tokenA, 'RIG-A', 'cs-a-2', payload);
    assert.equal(replay.status, 200);
    assert.equal(replay.body.duplicate, true);
    assert.equal(replay.body.seq, first.body.seq);
    assert.equal(replay.body.sha256, first.body.sha256);
  });

  it('validates the upload body', async () => {
    const bad = [
      { deviceId: 'RIG-A', schemaVersion: 1, payload: {} }, // missing changesetId
      { changesetId: '../x', deviceId: 'RIG-A', schemaVersion: 1, payload: {} },
      { changesetId: 'cs-x', deviceId: 'RIG-A', payload: {} }, // missing schemaVersion
      { changesetId: 'cs-x', deviceId: 'RIG-A', schemaVersion: 1 }, // missing payload
    ];
    for (const body of bad) {
      const { status } = await api(srv.baseUrl, '/api/v1/changesets', { method: 'POST', token: tokenA, body });
      assert.equal(status, 400, JSON.stringify(body));
    }
  });

  it('returns changesets in strict seq order with since / limit / excludeDevice', async () => {
    // Interleave uploads from both devices.
    await upload(tokenB, 'RIG-B', 'cs-b-1', { n: 1 });
    await upload(tokenA, 'RIG-A', 'cs-a-3', { n: 2 });
    await upload(tokenB, 'RIG-B', 'cs-b-2', { n: 3 });

    const all = await api(srv.baseUrl, '/api/v1/changesets?since=0&limit=100', { token: tokenA });
    assert.equal(all.status, 200);
    const seqs = all.body.items.map((i) => i.seq);
    assert.deepEqual(seqs, [...seqs].sort((a, b) => a - b), 'items must be seq-ordered');
    assert.equal(all.body.more, false);
    assert.equal(all.body.nextSince, seqs.at(-1));
    assert.ok(all.body.items.every((i) => typeof i.payload === 'object'));

    // Pagination: limit=2 then continue from nextSince.
    const page1 = await api(srv.baseUrl, '/api/v1/changesets?since=0&limit=2', { token: tokenA });
    assert.equal(page1.body.items.length, 2);
    assert.equal(page1.body.more, true);
    const page2 = await api(srv.baseUrl, `/api/v1/changesets?since=${page1.body.nextSince}&limit=100`, {
      token: tokenA,
    });
    assert.deepEqual(
      [...page1.body.items, ...page2.body.items].map((i) => i.seq),
      seqs,
      'pages concatenate to the full ordered stream',
    );

    // excludeDevice filters own uploads but the cursor still advances.
    const excl = await api(srv.baseUrl, '/api/v1/changesets?since=0&limit=100&excludeDevice=RIG-A', {
      token: tokenA,
    });
    assert.ok(excl.body.items.length > 0);
    assert.ok(excl.body.items.every((i) => i.deviceId !== 'RIG-A'));
    assert.equal(excl.body.nextSince, seqs.at(-1));
  });

  it('long-poll: a waiting GET wakes as soon as another device uploads', async () => {
    const head = await api(srv.baseUrl, '/api/v1/changesets?since=0&limit=1000', { token: tokenA });
    const since = head.body.nextSince;

    const started = Date.now();
    const waiting = api(srv.baseUrl, `/api/v1/changesets?since=${since}&waitMs=8000`, { token: tokenA });
    await new Promise((r) => setTimeout(r, 150)); // let the long-poll park
    await upload(tokenB, 'RIG-B', 'cs-b-wake', { wake: true });

    const { status, body } = await waiting;
    const elapsed = Date.now() - started;
    assert.equal(status, 200);
    assert.equal(body.items.length, 1);
    assert.equal(body.items[0].changesetId, 'cs-b-wake');
    assert.ok(elapsed < 5000, `woke in ${elapsed}ms — should be event-driven, not a full 8s wait`);
  });

  it('long-poll: times out with an empty page when nothing arrives', async () => {
    const head = await api(srv.baseUrl, '/api/v1/changesets?since=0&limit=1000', { token: tokenA });
    const since = head.body.nextSince;
    const started = Date.now();
    const { status, body } = await api(srv.baseUrl, `/api/v1/changesets?since=${since}&waitMs=300`, {
      token: tokenA,
    });
    assert.equal(status, 200);
    assert.deepEqual(body.items, []);
    assert.equal(body.nextSince, since);
    assert.ok(Date.now() - started >= 250);
  });

  it('rejects oversize bodies with 413', async () => {
    const big = 'x'.repeat(300 * 1024); // over this instance's 256 KiB cap
    const { status, body } = await upload(tokenA, 'RIG-A', 'cs-too-big', { blob: big });
    assert.equal(status, 413);
    assert.equal(body.error.code, 'BODY_TOO_LARGE');
  });
});
