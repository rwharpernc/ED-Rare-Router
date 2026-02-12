/**
 * Export rares data to JSON for EDDN worker
 * 
 * Run this script to generate data/rares.json which the EDDN worker can read
 * 
 * Usage: node scripts/export-rares-json.js
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { getDataDir } from './load-config.js';

async function exportRares() {
  try {
    // Import rares data
    const { rares } = await import('../src/data/rares.ts');
    
    // Create simplified structure for worker
    const raresExport = rares.map(rare => ({
      rare: rare.rare,
      system: rare.system,
      station: rare.station,
    }));
    
    // Ensure data directory exists
    const dataDir = getDataDir();
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    
    // Write to JSON file
    const outputPath = join(dataDir, 'rares.json');
    await writeFile(
      outputPath,
      JSON.stringify(raresExport, null, 2),
      'utf-8'
    );
    
    console.log(`✓ Exported ${raresExport.length} rare goods to ${outputPath}`);
  } catch (error) {
    console.error('Error exporting rares:', error);
    process.exit(1);
  }
}

exportRares();
