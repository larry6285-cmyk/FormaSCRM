import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest } from '../server.mjs';

async function request(url, method = 'GET') {
  const result = { headers: {} };
  await handleRequest({ url, method }, {
    setHeader(name, value) { result.headers[name] = value; },
    writeHead(status, headers = {}) { result.status = status; Object.assign(result.headers, headers); },
    end(body) { result.body = body; }
  });
  return result;
}
test('serves the CRM and its JavaScript modules with correct MIME types', async () => {
  const root = await request('/');
  assert.equal(root.status, 200); assert.match(root.body.toString(), /lang="it"/);
  const script = await request('/app.js');
  assert.equal(script.status, 200); assert.match(script.headers['Content-Type'], /javascript/);
  const css = await request('/styles.css');
  assert.equal(css.status, 200); assert.ok(!css.body.toString().includes('@import'));
});
test('does not expose project source, backups, or paths outside the app', async () => {
  for (const path of ['/README.md', '/.git/config', '/.openai/hosting.json', '/../package.json', '/backup.json']) {
    assert.equal((await request(path)).status, 404);
  }
});
test('supports HEAD, disables caching, and rejects writes', async () => {
  const head = await request('/app.js', 'HEAD');
  assert.equal(head.status, 200); assert.equal(head.body, undefined);
  assert.equal(head.headers['Cache-Control'], 'no-store');
  assert.equal((await request('/', 'POST')).status, 405);
});
