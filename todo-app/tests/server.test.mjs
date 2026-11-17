import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import { createServer } from '../server.mjs';

const testServer = createServer();
const socketPath = `/tmp/focustask-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.sock`;

test.before(async () => {
  try { fs.unlinkSync(socketPath); } catch {}
  await new Promise((resolve, reject) => {
    testServer.listen(socketPath, resolve).on('error', reject);
  });
});

function request(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ socketPath, path, method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

test('server serves index.html at root', async () => {
  const res = await request('/');
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['content-type'], /text\/html/);
  assert.match(res.data, /FocusTask/);
});

test('server serves styles.css', async () => {
  const res = await request('/styles.css');
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['content-type'], /text\/css/);
});

test('server serves app.js and model.js with correct MIME types', async () => {
  const resApp = await request('/app.js');
  assert.equal(resApp.statusCode, 200);
  assert.match(resApp.headers['content-type'], /application\/javascript/);

  const resModel = await request('/model.js');
  assert.equal(resModel.statusCode, 200);
  assert.match(resModel.headers['content-type'], /application\/javascript/);
});

test('server returns 404 for nonexistent files', async () => {
  const res = await request('/nonexistent-file.xyz');
  assert.equal(res.statusCode, 404);
});

test.after(async () => {
  await new Promise((resolve) => testServer.close(resolve));
  try { fs.unlinkSync(socketPath); } catch {}
});
