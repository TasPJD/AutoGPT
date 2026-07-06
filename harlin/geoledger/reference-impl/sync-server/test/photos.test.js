/** Photo upload idempotency, conflict protection, traversal rejection, streaming GET. */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';

import { api, registerDevice, startServer } from './helpers.js';

/** @param {Buffer | string} data */
const sha = (data) => crypto.createHash('sha256').update(data).digest('hex');

describe('photos', () => {
  /** @type {Awaited<ReturnType<typeof startServer>>} */
  let srv;
  /** @type {string} */
  let token;

  before(async () => {
    srv = await startServer();
    token = await registerDevice(srv.baseUrl, srv.adminToken, 'RIG-CAM');
  });
  after(() => srv.stop());

  /**
   * @param {string} urlPath
   * @param {Buffer} body
   * @param {string | null} declaredSha
   */
  async function uploadPhoto(urlPath, body, declaredSha) {
    /** @type {Record<string, string>} */
    const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/octet-stream' };
    if (declaredSha) headers['content-sha256'] = declaredSha;
    const res = await fetch(`${srv.baseUrl}${urlPath}`, { method: 'POST', headers, body });
    return { status: res.status, body: await res.json().catch(() => null) };
  }

  const photoBytes = Buffer.from('\xff\xd8\xfffake-jpeg-bytes-DDH001-tray4', 'binary');

  it('stores a photo when Content-SHA256 matches, lands on disk', async () => {
    const { status, body } = await uploadPhoto('/api/v1/photos/DDH-001/tray4_0-15m.jpg', photoBytes, sha(photoBytes));
    assert.equal(status, 201);
    assert.equal(body.duplicate, false);
    assert.equal(body.sha256, sha(photoBytes));
    const onDisk = fs.readFileSync(path.join(srv.dataDir, 'photos', 'DDH-001', 'tray4_0-15m.jpg'));
    assert.deepEqual(onDisk, photoBytes);
  });

  it('replaying the identical upload is idempotent (200, duplicate:true)', async () => {
    const { status, body } = await uploadPhoto('/api/v1/photos/DDH-001/tray4_0-15m.jpg', photoBytes, sha(photoBytes));
    assert.equal(status, 200);
    assert.equal(body.duplicate, true);
    assert.equal(body.sha256, sha(photoBytes));
  });

  it('same name, different content → 409, original preserved', async () => {
    const tampered = Buffer.from('completely different bytes');
    const { status, body } = await uploadPhoto('/api/v1/photos/DDH-001/tray4_0-15m.jpg', tampered, sha(tampered));
    assert.equal(status, 409);
    assert.equal(body.error.code, 'PHOTO_CONFLICT');
    const onDisk = fs.readFileSync(path.join(srv.dataDir, 'photos', 'DDH-001', 'tray4_0-15m.jpg'));
    assert.deepEqual(onDisk, photoBytes, 'field original must never be overwritten');
  });

  it('missing or wrong Content-SHA256 → 400, nothing written', async () => {
    const noHeader = await uploadPhoto('/api/v1/photos/DDH-002/a.jpg', photoBytes, null);
    assert.equal(noHeader.status, 400);
    const wrongSha = await uploadPhoto('/api/v1/photos/DDH-002/a.jpg', photoBytes, sha('other'));
    assert.equal(wrongSha.status, 400);
    assert.equal(wrongSha.body.error.code, 'SHA256_BODY_MISMATCH');
    assert.equal(fs.existsSync(path.join(srv.dataDir, 'photos', 'DDH-002', 'a.jpg')), false);
  });

  it('rejects traversal and dotfile names with 400', async () => {
    const evil = [
      '/api/v1/photos/..%2F..%2Fetc/passwd', // encoded slash traversal in holeId
      '/api/v1/photos/DDH-001/..%2Fseq', // encoded slash traversal in filename
      '/api/v1/photos/DDH-001/.hidden', // dotfile filename
      '/api/v1/photos/.git/config', // dotfile holeId
      '/api/v1/photos/DDH-001/tray%00.jpg', // NUL byte
      '/api/v1/photos/DDH-001/a%20b.jpg', // space (outside safe charset)
    ];
    for (const urlPath of evil) {
      const { status } = await uploadPhoto(urlPath, photoBytes, sha(photoBytes));
      assert.equal(status, 400, `expected 400 for ${urlPath}`);
    }
    // Nothing escaped the photos root.
    assert.equal(fs.existsSync(path.join(srv.dataDir, 'passwd')), false);
    assert.equal(fs.existsSync(path.join(srv.dataDir, 'photos', 'seq')), false);
  });

  it('raw ../ path segments (no client normalization) never reach the filesystem', async () => {
    // fetch() normalizes dot segments client-side, so speak raw HTTP to
    // exercise the server's own handling of literal `..` in the path.
    const { default: net } = await import('node:net');
    const port = Number(new URL(srv.baseUrl).port);
    const raw = await new Promise((resolve, reject) => {
      const socket = net.connect(port, '127.0.0.1', () => {
        socket.write(
          'POST /api/v1/photos/../../etc/passwd HTTP/1.1\r\n' +
            'Host: 127.0.0.1\r\n' +
            `Authorization: Bearer ${token}\r\n` +
            `Content-SHA256: ${sha(photoBytes)}\r\n` +
            `Content-Length: ${photoBytes.length}\r\n` +
            'Connection: close\r\n\r\n',
        );
        socket.write(photoBytes);
      });
      let data = '';
      socket.on('data', (chunk) => {
        data += chunk;
      });
      socket.on('end', () => resolve(data));
      socket.on('error', reject);
    });
    const statusLine = String(raw).split('\r\n')[0];
    const status = Number(statusLine.split(' ')[1]);
    assert.ok(status >= 400 && status < 500, `expected 4xx, got: ${statusLine}`);
    assert.equal(fs.existsSync(path.join(srv.dataDir, '..', 'etc', 'passwd')), false);
  });

  it('manifest lists photos with sizes and hashes; unknown hole is empty', async () => {
    const second = Buffer.from('second-photo');
    await uploadPhoto('/api/v1/photos/DDH-001/tray5_15-30m.jpg', second, sha(second));

    const { status, body } = await api(srv.baseUrl, '/api/v1/photos/DDH-001', { token });
    assert.equal(status, 200);
    assert.equal(body.holeId, 'DDH-001');
    assert.deepEqual(
      body.photos.map((p) => p.filename),
      ['tray4_0-15m.jpg', 'tray5_15-30m.jpg'],
    );
    assert.equal(body.photos[0].sha256, sha(photoBytes));
    assert.equal(body.photos[0].size, photoBytes.length);

    const empty = await api(srv.baseUrl, '/api/v1/photos/DDH-UNKNOWN', { token });
    assert.equal(empty.status, 200);
    assert.deepEqual(empty.body.photos, []);
  });

  it('GET streams the photo back byte-identical with integrity headers', async () => {
    const res = await fetch(`${srv.baseUrl}/api/v1/photos/DDH-001/tray4_0-15m.jpg`, {
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/jpeg');
    assert.equal(res.headers.get('content-sha256'), sha(photoBytes));
    const bytes = Buffer.from(await res.arrayBuffer());
    assert.deepEqual(bytes, photoBytes);

    const missing = await api(srv.baseUrl, '/api/v1/photos/DDH-001/nope.jpg', { token });
    assert.equal(missing.status, 404);
  });

  it('photo endpoints require device auth', async () => {
    const res = await fetch(`${srv.baseUrl}/api/v1/photos/DDH-001/tray4_0-15m.jpg`);
    assert.equal(res.status, 401);
  });
});
