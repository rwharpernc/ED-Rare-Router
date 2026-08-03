/**
 * Packaging build for ED Rare Router.
 *
 * Produces double-click-to-run distributables for non-developers:
 *   - Builds the Astro app.
 *   - Stages a production-only node_modules.
 *   - Downloads a portable Node.js runtime per target platform (cached).
 *   - Compiles scripts/package/launcher.cjs to a native executable via pkg.
 *   - Assembles and zips/tars a per-platform folder.
 *
 * Run manually by the maintainer: npm run package:win | package:linux | package:all
 * Not part of the app itself and not run by end users.
 */

import { existsSync, mkdirSync, rmSync, cpSync, writeFileSync, createWriteStream, chmodSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync, execSync } from 'child_process';
import https from 'https';
import archiver from 'archiver';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const CACHE_DIR = join(ROOT, '.cache');
const OUT_DIR = join(ROOT, 'package-out');
const STAGE_DIR = join(CACHE_DIR, 'node_modules-stage');
const RUNTIME_CACHE = join(CACHE_DIR, 'node-runtimes');

const NPM_BIN = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const NPX_BIN = process.platform === 'win32' ? 'npx.cmd' : 'npx';
// GNU tar (Git for Windows) misreads "D:\..." as a remote host:path spec.
// The Windows-bundled bsdtar at this path handles drive letters correctly.
const TAR_BIN = process.platform === 'win32' ? 'C:\\Windows\\System32\\tar.exe' : 'tar';

const TARGETS = {
  win: {
    platform: 'win32',
    os: 'win',
    arch: 'x64',
    pkgTarget: 'node22-win-x64',
    exeName: 'ED-Rare-Router.exe',
    nodeArchiveExt: 'zip',
    archiveFormat: 'zip',
  },
  linux: {
    platform: 'linux',
    os: 'linux',
    arch: 'x64',
    pkgTarget: 'node22-linux-x64',
    exeName: 'ED-Rare-Router',
    nodeArchiveExt: 'tar.gz',
    archiveFormat: 'tar',
  },
};

function run(bin, args, opts = {}) {
  console.log(`> ${bin} ${args.join(' ')}`);
  // .cmd files (npm/npx on Windows) can only be spawned through a shell.
  // All callers pass fixed, developer-controlled argv (no external input),
  // so a plain joined command string is safe here.
  if (process.platform === 'win32' && bin.endsWith('.cmd')) {
    execSync([bin, ...args].join(' '), { stdio: 'inherit', cwd: ROOT, ...opts });
    return;
  }
  execFileSync(bin, args, { stdio: 'inherit', cwd: ROOT, ...opts });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'ed-rare-router-packager' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchJson(res.headers.location).then(resolve, reject);
          return;
        }
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject);
  });
}

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'ed-rare-router-packager' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          download(res.headers.location, destPath).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed (${res.statusCode}): ${url}`));
          return;
        }
        const file = createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', reject);
      })
      .on('error', reject);
  });
}

async function getLatestLtsVersion() {
  const index = await fetchJson('https://nodejs.org/dist/index.json');
  const lts = index.find((entry) => entry.lts);
  if (!lts) throw new Error('Could not determine latest Node.js LTS version from nodejs.org/dist/index.json');
  return lts.version; // e.g. 'v22.14.0'
}

async function ensureNodeRuntime(target, version) {
  const destDir = join(RUNTIME_CACHE, `${version}-${target.os}-${target.arch}`);
  const marker = join(destDir, target.platform === 'win32' ? 'node.exe' : 'bin/node');
  if (existsSync(marker)) {
    console.log(`Using cached Node runtime for ${target.os}-${target.arch} at ${destDir}`);
    return destDir;
  }

  mkdirSync(RUNTIME_CACHE, { recursive: true });
  const archiveName = `node-${version}-${target.os}-${target.arch}.${target.nodeArchiveExt}`;
  const url = `https://nodejs.org/dist/${version}/${archiveName}`;
  const archivePath = join(RUNTIME_CACHE, archiveName);
  if (!existsSync(archivePath)) {
    console.log(`Downloading ${url} ...`);
    await download(url, archivePath);
  } else {
    console.log(`Using already-downloaded archive ${archivePath}`);
  }

  // We only need the `node` binary itself (never npm/npx at runtime), so
  // extract just that member. This also sidesteps the official Linux
  // tarball's bin/npm, bin/npx, bin/corepack symlinks, which Windows tar
  // can't recreate without elevated privileges.
  const innerName = `node-${version}-${target.os}-${target.arch}`;
  const memberRelPath = target.platform === 'win32' ? 'node.exe' : 'bin/node';
  const memberArchivePath = `${innerName}/${memberRelPath}`;

  const extractDir = join(RUNTIME_CACHE, `_extract-${target.os}-${target.arch}`);
  rmSync(extractDir, { recursive: true, force: true });
  mkdirSync(extractDir, { recursive: true });
  run(TAR_BIN, ['-xf', archivePath, '-C', extractDir, memberArchivePath]);

  rmSync(destDir, { recursive: true, force: true });
  const finalPath = join(destDir, memberRelPath);
  mkdirSync(dirname(finalPath), { recursive: true });
  cpSync(join(extractDir, memberArchivePath), finalPath);
  rmSync(extractDir, { recursive: true, force: true });
  return destDir;
}

function stageProductionNodeModules() {
  console.log('Staging production-only node_modules in an isolated npm ci...');
  mkdirSync(STAGE_DIR, { recursive: true });
  cpSync(join(ROOT, 'package.json'), join(STAGE_DIR, 'package.json'));
  cpSync(join(ROOT, 'package-lock.json'), join(STAGE_DIR, 'package-lock.json'));
  run(NPM_BIN, ['ci', '--omit=dev', '--ignore-scripts'], { cwd: STAGE_DIR });

  return join(STAGE_DIR, 'node_modules');
}

function buildLauncher(target) {
  const launcherSrc = join(__dirname, 'launcher.cjs');
  const outFile = join(OUT_DIR, `_launcher-${target.os}${target.platform === 'win32' ? '.exe' : ''}`);
  mkdirSync(OUT_DIR, { recursive: true });
  run(NPX_BIN, ['@yao-pkg/pkg', launcherSrc, '-t', target.pkgTarget, '-o', outFile]);
  return outFile;
}

function readmeText(target) {
  const exe = target.exeName;
  return `ED Rare Router - Quick Start
=============================

1. Unzip this whole folder somewhere you can write files - your Desktop or
   Documents folder is fine. Avoid "Program Files" (Windows may block it
   from saving its settings there).

2. Double-click "${exe}" to start the app. A window will open showing a
   few status lines - leave it open while you use the app. Your web
   browser should open automatically to the app; if it doesn't, open it
   yourself and go to: http://127.0.0.1:4321

3. First run only: you'll land on a short setup page. The only required
   field is "EDSM User-Agent" - just enter your email address or a
   website URL. This is required by EDSM (the third-party service that
   supplies system data) to identify requests; it is not collected by
   this app or sent anywhere else.

4. To stop the app, close the black status window from step 2.

Notes
-----
- This is a hobby project provided as-is, with no warranty. See LICENSE
  in the source repository for details.
`;
}

function assemblePackage(target, prodNodeModules, nodeRuntimeDir, launcherExe) {
  const pkgDir = join(OUT_DIR, `ED-Rare-Router-${target.os}-${target.arch}`);
  rmSync(pkgDir, { recursive: true, force: true });
  mkdirSync(pkgDir, { recursive: true });

  cpSync(launcherExe, join(pkgDir, target.exeName));
  cpSync(nodeRuntimeDir, join(pkgDir, 'node-runtime'), { recursive: true });

  if (target.platform !== 'win32') {
    chmodSync(join(pkgDir, target.exeName), 0o755);
    chmodSync(join(pkgDir, 'node-runtime', 'bin', 'node'), 0o755);
  }

  const appDir = join(pkgDir, 'app');
  cpSync(join(ROOT, 'dist'), join(appDir, 'dist'), { recursive: true });
  cpSync(prodNodeModules, join(appDir, 'node_modules'), { recursive: true });
  mkdirSync(join(appDir, 'data'), { recursive: true });

  writeFileSync(join(pkgDir, 'README-FIRST.txt'), readmeText(target));

  return pkgDir;
}

// Windows/NTFS has no real Unix executable bit, so files staged on this
// build machine won't carry it into the archive on their own. Force it
// for the specific paths (relative to sourceDir) that must be executable
// on the extracting machine, regardless of what Windows reports.
function archiveDirectory(sourceDir, outPath, format, execRelPaths = []) {
  const execSet = new Set(execRelPaths.map((p) => p.replace(/\\/g, '/')));
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outPath);
    const archive = archiver(format, format === 'tar' ? { gzip: true } : { zlib: { level: 9 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(sourceDir, 'ED-Rare-Router', (entryData) => {
      if (execSet.has(entryData.name.replace(/\\/g, '/'))) {
        entryData.mode = 0o755;
      }
      return entryData;
    });
    archive.finalize();
  });
}

async function main() {
  const args = process.argv.slice(2);
  const which = args.includes('--win') ? ['win'] : args.includes('--linux') ? ['linux'] : ['win', 'linux'];

  console.log('Building Astro app (npm run build)...');
  run(NPM_BIN, ['run', 'build']);

  const prodNodeModules = stageProductionNodeModules();

  mkdirSync(OUT_DIR, { recursive: true });

  const version = await getLatestLtsVersion();
  console.log(`Using Node.js ${version} as the bundled runtime.`);

  for (const key of which) {
    const target = TARGETS[key];
    console.log(`\n=== Packaging for ${key} ===`);
    const nodeRuntimeDir = await ensureNodeRuntime(target, version);
    const launcherExe = buildLauncher(target);
    const pkgDir = assemblePackage(target, prodNodeModules, nodeRuntimeDir, launcherExe);

    const ext = target.archiveFormat === 'zip' ? 'zip' : 'tar.gz';
    const archivePath = join(OUT_DIR, `ED-Rare-Router-${target.os}-${target.arch}.${ext}`);
    const execRelPaths =
      target.platform === 'win32' ? [] : [target.exeName, 'node-runtime/bin/node'];
    await archiveDirectory(pkgDir, archivePath, target.archiveFormat, execRelPaths);
    console.log(`Created ${archivePath}`);
  }

  console.log('\nDone. See package-out/ for the assembled folders and archives.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
