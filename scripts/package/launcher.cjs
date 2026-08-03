/**
 * ED Rare Router - packaged launcher.
 *
 * Compiled to a native executable via pkg. Spawns the bundled portable
 * Node runtime to run the pre-built Astro server, waits for it to come
 * up, then opens the user's default browser. No Node.js install, no
 * terminal commands required by the end user.
 *
 * Expected layout next to this executable:
 *   node-runtime/       portable node binary
 *   app/dist/server/entry.mjs   built standalone server
 *   app/data/            data dir (cache files written here)
 */

'use strict';

const path = require('path');
const http = require('http');
const { spawn, exec } = require('child_process');

const HOST = process.env.EDRR_HOST || '127.0.0.1';
const PORT = process.env.EDRR_PORT || '4321';
const READY_TIMEOUT_MS = 20000;
const READY_POLL_INTERVAL_MS = 500;

// EDRR_BASE_DIR lets a developer test this script with plain `node` before
// it's pkg-compiled. In the shipped executable, process.execPath is the
// exe's own path (pkg guarantees this), so its directory is the real base.
const baseDir = process.env.EDRR_BASE_DIR || path.dirname(process.execPath);
const appDir = path.join(baseDir, 'app');
const nodeBin =
  process.env.EDRR_NODE_BIN ||
  (process.platform === 'win32'
    ? path.join(baseDir, 'node-runtime', 'node.exe')
    : path.join(baseDir, 'node-runtime', 'bin', 'node'));
const serverEntry = path.join(appDir, 'dist', 'server', 'entry.mjs');
const appUrl = `http://${HOST}:${PORT}`;

function log(msg) {
  process.stdout.write(`[ED Rare Router] ${msg}\n`);
}

function openBrowser(url) {
  const cmd =
    process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) {
      log(`Could not open your browser automatically. Open this URL manually: ${url}`);
    }
  });
}

function waitUntilReady(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    function attempt() {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() > deadline) {
          reject(new Error('Timed out waiting for the server to start.'));
        } else {
          setTimeout(attempt, READY_POLL_INTERVAL_MS);
        }
      });
    }

    attempt();
  });
}

function main() {
  log('Starting...');

  const child = spawn(nodeBin, [serverEntry], {
    cwd: appDir,
    env: { ...process.env, HOST, PORT },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let sawAddrInUse = false;

  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    if (text.includes('EADDRINUSE')) sawAddrInUse = true;
    process.stderr.write(chunk);
  });

  child.on('error', (err) => {
    if (err.code === 'ENOENT') {
      log(`Could not find the bundled Node runtime at: ${nodeBin}`);
      log('The download may be incomplete or corrupted. Try re-downloading ED Rare Router.');
    } else {
      log(`Failed to start the server: ${err.message}`);
    }
    process.exit(1);
  });

  child.on('exit', (code) => {
    if (sawAddrInUse) {
      log(`Port ${PORT} is already in use by another program.`);
      log('Close whatever is using that port, or set EDRR_PORT to a different number and try again.');
    } else if (code !== 0 && code !== null) {
      log(`The server stopped unexpectedly (exit code ${code}). See the messages above for details.`);
    }
    process.exit(code === null ? 0 : code);
  });

  waitUntilReady(appUrl, READY_TIMEOUT_MS)
    .then(() => {
      log(`Running at ${appUrl}`);
      log('Opening your browser...');
      openBrowser(appUrl);
      log('Close this window to stop ED Rare Router.');
    })
    .catch(() => {
      log(`Still waiting on ${appUrl} - check the messages above for errors.`);
      log(`You can also try opening ${appUrl} in your browser manually.`);
    });

  const shutdown = () => {
    if (!child.killed) child.kill();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  // Windows emits SIGHUP when the console window is closed (e.g. the X
  // button) rather than SIGINT - without this the spawned server can be
  // left running in the background after the window disappears.
  process.on('SIGHUP', shutdown);
}

main();
