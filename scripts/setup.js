/**
 * First-run setup: prompt for paths and API keys, then write .config.json.
 * Run: npm run setup
 * If .config.json already exists, we still allow overwriting (user can re-run to update).
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';

const CONFIG_PATH = join(process.cwd(), '.config.json');

function ask(rl, question, defaultValue = '') {
  const def = defaultValue ? ` (${defaultValue})` : '';
  return new Promise((resolve) => {
    rl.question(`${question}${def}: `, (answer) => {
      resolve(typeof answer === 'string' && answer.trim() !== '' ? answer.trim() : defaultValue);
    });
  });
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log('\n=== ED Rare Router – Setup ===\n');
  console.log('Enter values for .config.json. Leave blank to use default or skip.\n');

  let existing = {};
  if (existsSync(CONFIG_PATH)) {
    try {
      existing = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
      console.log('Existing .config.json found. You can update values below.\n');
    } catch (e) {
      console.log('Existing .config.json is invalid; we will overwrite it.\n');
    }
  }

  const edsmUserAgent = await ask(
    rl,
    'EDSM User-Agent (contact for API requests)',
    existing.edsmUserAgent || 'ED-Rare-Router/1.0 (contact: your-email@example.com)'
  );

  const dataDirRaw = await ask(
    rl,
    'Data directory (full path, or leave blank for default ./data)',
    existing.dataDir || ''
  );
  const dataDir = dataDirRaw === '' ? null : dataDirRaw;

  console.log('\nAPI keys (leave blank to skip):');
  const edsmKey = await ask(rl, '  EDSM API key', (existing.apiKeys && existing.apiKeys.edsm) || '');
  const eddnKey = await ask(rl, '  EDDN API key', (existing.apiKeys && existing.apiKeys.eddn) || '');

  rl.close();

  const apiKeys = {};
  if (edsmKey) apiKeys.edsm = edsmKey;
  if (eddnKey) apiKeys.eddn = eddnKey;
  if (Object.keys(existing.apiKeys || {}).length > 0 && Object.keys(apiKeys).length === 0) {
    Object.assign(apiKeys, existing.apiKeys);
  }

  const config = {
    edsmUserAgent: edsmUserAgent || undefined,
    dataDir: dataDir === null ? null : dataDir,
    apiKeys: Object.keys(apiKeys).length > 0 ? apiKeys : undefined,
  };

  // Remove undefined so we don't write "key": undefined
  if (config.edsmUserAgent === undefined) delete config.edsmUserAgent;
  if (config.apiKeys === undefined) delete config.apiKeys;

  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  console.log('\nWrote .config.json successfully.\n');
  console.log('You can run the app with: npm run dev\n');
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
