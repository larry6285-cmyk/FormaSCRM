import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/model.js', ['model.js', 'text/javascript; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']]
]);

export async function handleRequest(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
  }
  let pathname;
  try { pathname = new URL(req.url, 'http://127.0.0.1:4173').pathname; }
  catch { res.writeHead(400); res.end(); return; }
  const asset = assets.get(pathname);
  if (!asset) { res.writeHead(404); res.end('Risorsa non trovata.'); return; }
  try {
    const body = await readFile(new URL(`./dist/${asset[0]}`, import.meta.url));
    res.writeHead(200, { 'Content-Type': asset[1], 'Content-Length': body.length });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(500); res.end('File del CRM non disponibile. Estrai nuovamente il pacchetto completo.'); }
}

function openBrowser(url) {
  const [command, args] = process.platform === 'win32'
    ? ['cmd', ['/c', 'start', '', url]]
    : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  const child = spawn(command, args, { stdio: 'ignore', detached: true });
  child.on('error', () => console.log('Apri manualmente il collegamento nel browser.'));
  child.unref();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = http.createServer(handleRequest);
  server.on('error', error => {
    console.error(error.code === 'EADDRINUSE'
      ? 'La porta 4173 è già occupata. Se Forma è già aperto, visita http://127.0.0.1:4173; altrimenti chiudi il programma che usa questa porta e riprova.'
      : `Impossibile avviare Forma: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(4173, '127.0.0.1', () => {
    const url = 'http://127.0.0.1:4173';
    console.log(`\nForma — CRM scuola\n\nApri: ${url}\n\nMantieni aperta questa finestra durante l’utilizzo.\nPer fermare il CRM: Ctrl+C.\nI dati sono salvati nel browser: esporta regolarmente un backup dalle Impostazioni.\n`);
    if (process.argv.includes('--open')) openBrowser(url);
  });
}
