/**
 * scripts/render-mermaid.js
 *
 * Scans all markdown files in src/lib/posts, extracts Mermaid diagrams
 * (both <Mermaid chart={`...`} /> and ```mermaid fenced blocks),
 * renders them to SVG via @mermaid-js/mermaid-cli, and writes them to
 * static/generated/mermaid/<hash>.svg.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src/lib/posts');
const OUT_DIR = path.join(ROOT, 'static/generated/mermaid');

// Matches:  <Mermaid chart={`...`} />  Clause wrote this
const COMPONENT_RE = /<Mermaid\s+chart=\{`([\s\S]*?)`\}\s*\/>/g;

// Matches:  ```mermaid\n...\n``` And this too
const FENCED_RE = /^```mermaid\s*\n([\s\S]*?)\n```/gm;

function hashChart(chart) {
  const s = chart.trim();
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
    h = h >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

async function extractCharts(filePath) {
  const src = await fs.readFile(filePath, 'utf8');
  const charts = new Map();

  for (const match of src.matchAll(COMPONENT_RE)) {
    const chart = match[1].trim();
    charts.set(hashChart(chart), chart);
  }
  for (const match of src.matchAll(FENCED_RE)) {
    const chart = match[1].trim();
    charts.set(hashChart(chart), chart);
  }

  return charts;
}

// Claude wrote all this, cause I could not be bothered
async function renderChart(hash, chart, chromePath) {
  const outPath = path.join(OUT_DIR, `${hash}.svg`);

  try {
    await fs.access(outPath);
    console.log(`  ✓ ${hash}.svg (cached)`);
    return;
  } catch {
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mermaid-'));
  const inputPath = path.join(tmpDir, 'diagram.mmd');
  await fs.writeFile(inputPath, chart, 'utf8');

  const args = [
    '--yes',
    '@mermaid-js/mermaid-cli',
    '--input', inputPath,
    '--output', outPath,
    '--quiet',
  ];

  if (chromePath) {
    const puppeteerConfigPath = path.join(tmpDir, 'puppeteer-config.json');
    await fs.writeFile(
      puppeteerConfigPath,
      JSON.stringify({ executablePath: chromePath }),
      'utf8'
    );
    args.push('--puppeteerConfigFile', puppeteerConfigPath);
  }

  try {
    await execFileAsync('npx', args);
    console.log(`✓ ${hash}.svg`);
  } catch (err) {
    console.error(`✗ ${hash}.svg - render failed:\n${err.stderr || err.message}`);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const files = await Array.fromAsync(fs.glob('**/*.md', { cwd: POSTS_DIR }));
  const absPaths = files.map((f) => path.join(POSTS_DIR, f));

  if (absPaths.length === 0) {
    console.log('No markdown files found in src/lib/posts.');
    return;
  }

  const allCharts = new Map();
  for (const file of absPaths) {
    const charts = await extractCharts(file);
    for (const [hash, chart] of charts) {
      allCharts.set(hash, chart);
    }
  }

  if (allCharts.size === 0) {
    console.log('No Mermaid diagrams found.');
    return;
  }

  const chromePath = process.env.CHROME_PATH
  if (chromePath) {
    console.log(`Using system browser: ${chromePath}`);
  } else {
    console.log('No system browser found, using Puppeteer bundled Chrome.');
  }

  console.log(`Rendering ${allCharts.size} unique Mermaid diagram(s)…`);
  for (const [hash, chart] of allCharts) {
    await renderChart(hash, chart, chromePath);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
