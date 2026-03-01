/**
 * Fetch Inara.cz rare commodities page and update src/data/rares.ts with Inara links.
 * Inserts inaraLink for each rare whose name matches Inara's list (or replaces inaraLink: 'need data').
 *
 * Usage: node scripts/update-rare-inara-links.js
 *
 * Reads: src/data/rares.ts
 * Fetches: https://inara.cz/elite/commodities-rare/
 * Writes: src/data/rares.ts (in place)
 */

import { readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RARES_PATH = join(ROOT, "src/data/rares.ts");
const INARA_RARE_URL = "https://inara.cz/elite/commodities-rare/";

async function fetchInaraRareMapping() {
  const res = await fetch(INARA_RARE_URL, {
    headers: {
      "User-Agent": "ED-Rare-Router/1.0 (rare route helper; inara link sync)",
    },
  });
  const html = await res.text();

  const map = new Map();
  const htmlRe = /<a[^>]+href="(https:\/\/inara\.cz\/elite\/commodity\/\d+\/)"[^>]*>([^<]+)<\/a>/gi;
  let m;
  while ((m = htmlRe.exec(html)) !== null) {
    const url = m[1];
    const name = m[2].trim();
    if (!name) continue;
    map.set(name, url);
  }

  if (map.size === 0) {
    const mdRe = /\[([^\]]+)\]\((https:\/\/inara\.cz\/elite\/commodity\/\d+\/)\)/g;
    while ((m = mdRe.exec(html)) !== null) {
      const name = m[1].trim();
      const url = m[2];
      if (name.includes(" | ") && !name.startsWith("[")) continue;
      map.set(name, url);
    }
  }

  return map;
}

function getRareNameFromLine(line) {
  const single = /rare:\s*'([^']*)'/.exec(line);
  if (single) return single[1];
  const double = /rare:\s*"([^"]*)"/.exec(line);
  if (double) return double[1];
  return null;
}

/**
 * Update rares.ts: (1) Replace inaraLink: 'need data' with URL when we have a match.
 * (2) Insert inaraLink before "    pp: {" when we have a match and the block doesn't have inaraLink.
 */
function applyInaraLinks(content, inaraMap) {
  const lines = content.split("\n");
  const normalizedMap = new Map();
  for (const [name, url] of inaraMap) {
    normalizedMap.set(name.trim(), url);
  }
  let replaced = 0;
  let inserted = 0;
  const out = [];
  let lastRareName = null;
  let seenInaraSinceRare = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^\s+rare:\s*['"]/)) {
      lastRareName = getRareNameFromLine(line);
      seenInaraSinceRare = false;
    }
    if (line.includes("inaraLink:")) seenInaraSinceRare = true;

    // Replace existing placeholder
    if (line.includes("inaraLink: 'need data'") || line.includes('inaraLink: "need data"')) {
      const rareName = getRareNameFromLine(line);
      if (rareName) {
        const url =
          normalizedMap.get(rareName) ?? normalizedMap.get(rareName.replace(/’/g, "'"));
        if (url) {
          out.push(
            line.replace(/inaraLink:\s*['"]need data['"]/, `inaraLink: '${url}'`)
          );
          replaced++;
          continue;
        }
      }
    }

    // Insert inaraLink before "    pp: {" when we have rare name and no inaraLink in block
    if (line.match(/^\s+pp:\s+\{/) && lastRareName && !seenInaraSinceRare) {
      const url =
        normalizedMap.get(lastRareName) ??
        normalizedMap.get(lastRareName.replace(/’/g, "'"));
      if (url) {
        const indent = line.match(/^(\s+)/)[1];
        out.push(indent + "inaraLink: '" + url + "',");
        inserted++;
      }
      lastRareName = null;
    }

    out.push(line);
  }

  return { updated: out.join("\n"), replaced, inserted };
}

async function main() {
  console.log("[update-rare-inara-links] Fetching", INARA_RARE_URL);
  const inaraMap = await fetchInaraRareMapping();
  console.log("[update-rare-inara-links] Found", inaraMap.size, "commodity links on Inara");

  const content = await readFile(RARES_PATH, "utf-8");
  const { updated, replaced, inserted } = applyInaraLinks(content, inaraMap);

  await writeFile(RARES_PATH, updated, "utf-8");
  console.log(
    "[update-rare-inara-links] Replaced:",
    replaced,
    "Inserted:",
    inserted,
    "→",
    RARES_PATH
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
