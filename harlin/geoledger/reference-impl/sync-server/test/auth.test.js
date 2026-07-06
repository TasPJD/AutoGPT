/** Registration, token auth, cross-device enforcement, revocation. */

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { api, registerDevice, startServer } from './helpers.js';

describe('auth & device registry', () => {
  /** @type {Awaited<ReturnType<typeof startServer>>} */
  let srv;

  before(async () => {
    srv = await startServer();
  });
  after(() => srv.stop());

  it('health endpoint requires no auth', async () => {
    const { status, body } = await api(srv.baseUrl, '/api/v1/health');
    assert.equal(status, 200);
    assert.equal(body.ok, true);
    assert.equal(typeof body.seq, 'number');
    assert.equal(typeof body.devices, 'number');
    assert.equal(typeof body.uptime, 'number');
  });

  it('rejects registration without a valid admin token', async () => {
    for (const token of [null, 'wrong-admin-token']) {
      const { status } = await api(srv.baseUrl, '/api/v1/devices/register', {
        method: 'POST',
        token,
        body: { deviceId: 'RIG-01' },
      });
      assert.equal(status, 401);
    }
  });

  it('registers a device and returns a one-time token', async () => {
    const { status, body } = await api(srv.baseUrl, '/api/v1/devices/register', {
      method: 'POST',
      token: srv.adminToken,
      body: { deviceId: 'RIG-01', deviceName: 'Rig 1 Toughbook', operator: 'A. Geo' },
    });
    assert.equal(status, 201);
    assert.equal(body.deviceId, 'RIG-01');
    assert.match(body.token, /^gld_[A-Za-z0-9_-]{40,}$/);
  });

  it('rejects unsafe deviceIds at registration', async () => {
    for (const deviceId of ['../evil', '.hidden', 'a b', '', 42]) {
      const { status } = await api(srv.baseUrl, '/api/v1/devices/register', {
        method: 'POST',
        token: srv.adminToken,
        body: { deviceId },
      });
      assert.equal(status, 400, `deviceId ${JSON.stringify(deviceId)} should be rejected`);
    }
  });

  it('rejects a bad bearer token with 401', async () => {
    const { status } = await api(srv.baseUrl, '/api/v1/changesets', { token: 'gld_not-a-real-token' });
    assert.equal(status, 401);
  });

  it('rejects a missing bearer token with 401', async () => {
    const { status } = await api(srv.baseUrl, '/api/v1/changesets');
    assert.equal(status, 401);
  });

  it('admin token is not a device token', async () => {
    const { status } = await api(srv.baseUrl, '/api/v1/changesets', { token: srv.adminToken });
    assert.equal(status, 401);
  });

  it('device token cannot call admin endpoints', async () => {
    const token = await registerDevice(srv.baseUrl, srv.adminToken, 'RIG-ADMINCHECK');
    const { status } = await api(srv.baseUrl, '/api/v1/audit', { token });
    assert.equal(status, 401);
  });

  it('rejects cross-device changeset uploads with 403', async () => {
    const tokenA = await registerDevice(srv.baseUrl, srv.adminToken, 'RIG-A');
    await registerDevice(srv.baseUrl, srv.adminToken, 'RIG-B');
    const { status, body } = await api(srv.baseUrl, '/api/v1/changesets', {
      method: 'POST',
      token: tokenA,
      body: { changesetId: 'cs-cross-1', deviceId: 'RIG-B', schemaVersion: 6, payload: { rows: [] } },
    });
    assert.equal(status, 403);
    assert.equal(body.error.code, 'DEVICE_MISMATCH');
  });

  it('revocation invalidates a token; unknown device revocation is 404', async () => {
    const token = await registerDevice(srv.baseUrl, srv.adminToken, 'RIG-REVOKE');
    const ok = await api(srv.baseUrl, '/api/v1/changesets?since=0', { token });
    assert.equal(ok.status, 200);

    const revoke = await api(srv.baseUrl, '/api/v1/devices/revoke', {
      method: 'POST',
      token: srv.adminToken,
      body: { deviceId: 'RIG-REVOKE' },
    });
    assert.equal(revoke.status, 200);
    assert.equal(revoke.body.revoked, true);

    const denied = await api(srv.baseUrl, '/api/v1/changesets?since=0', { token });
    assert.equal(denied.status, 401);

    const missing = await api(srv.baseUrl, '/api/v1/devices/revoke', {
      method: 'POST',
      token: srv.adminToken,
      body: { deviceId: 'RIG-NEVER-EXISTED' },
    });
    assert.equal(missing.status, 404);
  });

  it('re-registration rotates the token and restores access', async () => {
    const oldToken = await registerDevice(srv.baseUrl, srv.adminToken, 'RIG-ROTATE');
    const newToken = await registerDevice(srv.baseUrl, srv.adminToken, 'RIG-ROTATE');
    assert.notEqual(oldToken, newToken);
    assert.equal((await api(srv.baseUrl, '/api/v1/changesets?since=0', { token: oldToken })).status, 401);
    assert.equal((await api(srv.baseUrl, '/api/v1/changesets?since=0', { token: newToken })).status, 200);
  });
});
