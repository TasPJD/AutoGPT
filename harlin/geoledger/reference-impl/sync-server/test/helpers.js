/**
 * Shared test helpers: spin up a real GL Relay on an ephemeral port with a
 * throwaway dataDir, plus small fetch conveniences. All tests exercise the
 * server over genuine HTTP via global fetch.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { createSyncServer } from '../src/server.js';

const ADMIN_TOKEN = 'test-admin-token';

/**
 * @param {object} [overrides] extra createSyncServer options
 * @returns {Promise<{
 *   handle: import('../src/server.js').SyncServerHandle,
 *   baseUrl: string,
 *   dataDir: string,
 *   adminToken: string,
 *   stop: () => Promise<void>,
 * }>}
 */
export async function startServer(overrides = {}) {
  const dataDir = overrides.dataDir ?? fs.mkdtempSync(path.join(os.tmpdir(), 'gl-relay-test-'));
  const handle = createSyncServer({
    dataDir,
    adminToken: ADMIN_TOKEN,
    quiet: true,
    ...overrides,
    ...(overrides.dataDir ? {} : { dataDir }),
  });
  const { port } = await handle.listen(0, '127.0.0.1');
  return {
    handle,
    baseUrl: `http://127.0.0.1:${port}`,
    dataDir,
    adminToken: handle.adminToken,
    stop: () => handle.close(),
  };
}

/**
 * JSON request helper.
 * @param {string} baseUrl
 * @param {string} pathName
 * @param {{ method?: string, token?: string | null, body?: unknown, headers?: Record<string, string> }} [opts]
 * @returns {Promise<{ status: number, body: any }>}
 */
export async function api(baseUrl, pathName, { method = 'GET', token = null, body, headers = {} } = {}) {
  /** @type {Record<string, string>} */
  const allHeaders = { ...headers };
  if (token) allHeaders.authorization = `Bearer ${token}`;
  /** @type {RequestInit} */
  const init = { method, headers: allHeaders };
  if (body !== undefined) {
    allHeaders['content-type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  const res = await fetch(`${baseUrl}${pathName}`, init);
  const text = await res.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return { status: res.status, body: parsed };
}

/**
 * Register a device via the admin API and return its bearer token.
 * @param {string} baseUrl
 * @param {string} adminToken
 * @param {string} deviceId
 * @returns {Promise<string>}
 */
export async function registerDevice(baseUrl, adminToken, deviceId) {
  const { status, body } = await api(baseUrl, '/api/v1/devices/register', {
    method: 'POST',
    token: adminToken,
    body: { deviceId, deviceName: `${deviceId} laptop`, operator: 'Test Operator' },
  });
  if (status !== 201) throw new Error(`register failed: ${status} ${JSON.stringify(body)}`);
  return body.token;
}
