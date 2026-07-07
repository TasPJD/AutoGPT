#!/usr/bin/env node
/**
 * GeoLedger Sync Server ("GL Relay") — launcher.
 *
 * Configuration (environment):
 *   GL_DATA_DIR     storage directory            (default ./gl-data)
 *   GL_PORT         listen port                  (default 8787)
 *   GL_HOST         bind address                 (default 0.0.0.0)
 *   GL_ADMIN_TOKEN  admin bearer token           (default: generated + printed once)
 *   GL_MAX_BODY     max request body, bytes      (default 26214400 = 25 MiB)
 *   GL_TLS_CERT     path to PEM certificate      (optional; enables HTTPS)
 *   GL_TLS_KEY      path to PEM private key      (optional; enables HTTPS)
 *
 * For production, prefer terminating TLS at Caddy/nginx — see README.md.
 */

import fs from 'node:fs';

import { createSyncServer } from '../src/server.js';

const dataDir = process.env.GL_DATA_DIR || './gl-data';
const port = Number(process.env.GL_PORT || 8787);
const host = process.env.GL_HOST || '0.0.0.0';
const maxBodyBytes = Number(process.env.GL_MAX_BODY || 25 * 1024 * 1024);

/** @type {{ cert: Buffer, key: Buffer } | null} */
let tls = null;
if (process.env.GL_TLS_CERT || process.env.GL_TLS_KEY) {
  if (!process.env.GL_TLS_CERT || !process.env.GL_TLS_KEY) {
    console.error('[gl-sync-server] GL_TLS_CERT and GL_TLS_KEY must be set together');
    process.exit(1);
  }
  tls = {
    cert: fs.readFileSync(process.env.GL_TLS_CERT),
    key: fs.readFileSync(process.env.GL_TLS_KEY),
  };
}

const relay = createSyncServer({
  dataDir,
  adminToken: process.env.GL_ADMIN_TOKEN || null,
  maxBodyBytes,
  tls,
});

const { port: boundPort, address } = await relay.listen(port, host);
const scheme = tls ? 'https' : 'http';
console.log(`[gl-sync-server] GL Relay listening on ${scheme}://${address}:${boundPort} (dataDir: ${relay.storage.dataDir})`);
console.log(`[gl-sync-server] seq=${relay.storage.maxSeq} changesets=${relay.storage.changesetCount} devices=${relay.auth.activeDeviceCount()}`);

let shuttingDown = false;
/** @param {string} signal */
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[gl-sync-server] ${signal} received — shutting down`);
  await relay.close();
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
