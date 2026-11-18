// scripts/validate-data.mjs — Smoke test for the RapidSteps static data.
//
// Usage: npm run validate
//
// Checks:
//   1. Every JSON file under public/data/ parses.
//   2. Per-system rapid-fire Q&A counts match the manifest
//      (src/lib/atlas-manifest.json), and each system JSON's own
//      stats.rapidFireQAs matches its rapidFireQAs array length.
//   3. No duplicate Q&A ids across all systems.
//   4. Every kind="mcq" item has an options array and a correctIndex in range.
//
// All expected counts are read from the manifest at runtime — nothing is
// hardcoded here, so the script stays valid as content grows (e.g. repro).
// Exit code is non-zero on any failure.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DATA_DIR = join(ROOT, 'public', 'data');
const SYSTEMS_DIR = join(DATA_DIR, 'systems');
const MANIFEST_PATH = join(ROOT, 'src', 'lib', 'atlas-manifest.json');

const errors = [];
const warnings = [];

function fail(msg) {
  errors.push(msg);
  console.error(`  ✗ ${msg}`);
}

function warn(msg) {
  warnings.push(msg);
  console.warn(`  ! ${msg}`);
}

// --- Collect every JSON under public/data/ (recursive) ---
function collectJsonFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectJsonFiles(full, out);
    else if (entry.endsWith('.json')) out.push(full);
  }
  return out;
}

const jsonFiles = collectJsonFiles(DATA_DIR);
console.log(`Validating ${jsonFiles.length} JSON files under public/data/…`);

// --- 1. Parse everything ---
const parsed = new Map();
for (const file of jsonFiles) {
  const rel = relative(ROOT, file);
  try {
    parsed.set(rel, JSON.parse(readFileSync(file, 'utf8')));
  } catch (err) {
    fail(`${rel}: invalid JSON — ${err.message}`);
  }
}

// --- Load the manifest (runtime source of truth for counts) ---
let manifest;
try {
  manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
} catch (err) {
  fail(`src/lib/atlas-manifest.json: cannot parse — ${err.message}`);
  manifest = null;
}

const manifestBySystem = new Map();
if (manifest) {
  for (const sys of manifest.systems ?? []) {
    manifestBySystem.set(sys.systemId, sys);
  }
}

// --- 2/3/4. Per-system checks ---
const seenQaIds = new Map(); // id -> first file that used it
let totalQAs = 0;
let totalMcqs = 0;

const systemFiles = jsonFiles.filter((f) => f.startsWith(SYSTEMS_DIR));
for (const file of systemFiles) {
  const rel = relative(ROOT, file);
  const payload = parsed.get(rel);
  if (!payload) continue; // parse error already reported

  const systemId = payload.systemId;
  if (typeof systemId !== 'string' || !systemId) {
    fail(`${rel}: missing string "systemId"`);
    continue;
  }

  const qas = payload.rapidFireQAs;
  if (!Array.isArray(qas)) {
    fail(`${rel}: "rapidFireQAs" is not an array`);
    continue;
  }
  totalQAs += qas.length;

  // 2a. Own stats block must match its own array length.
  const ownCount = payload.stats?.rapidFireQAs;
  if (ownCount !== undefined && ownCount !== qas.length) {
    fail(
      `${rel}: stats.rapidFireQAs is ${ownCount} but rapidFireQAs has ${qas.length} items`
    );
  }

  // 2b. Manifest count must match the array length.
  const manifestSys = manifestBySystem.get(systemId);
  if (!manifestSys) {
    warn(`${rel}: system "${systemId}" has no entry in the manifest`);
  } else if (manifestSys.stats?.rapidFireQAs !== qas.length) {
    fail(
      `${rel}: manifest expects ${manifestSys.stats?.rapidFireQAs} Q&As for "${systemId}" but the file has ${qas.length}`
    );
  }

  // 3 + 4. Id uniqueness and MCQ shape.
  for (const item of qas) {
    if (!item || typeof item.id !== 'string') {
      fail(`${rel}: Q&A item without a string "id" (num ${item?.num ?? '?'})`);
      continue;
    }
    if (seenQaIds.has(item.id)) {
      fail(
        `${rel}: duplicate Q&A id "${item.id}" (also in ${seenQaIds.get(item.id)})`
      );
    } else {
      seenQaIds.set(item.id, rel);
    }

    if (item.kind === 'mcq') {
      totalMcqs += 1;
      if (!Array.isArray(item.options) || item.options.length < 2) {
        fail(`${rel}: MCQ "${item.id}" has no usable "options" array`);
      } else if (
        typeof item.correctIndex !== 'number' ||
        !Number.isInteger(item.correctIndex) ||
        item.correctIndex < 0 ||
        item.correctIndex >= item.options.length
      ) {
        fail(
          `${rel}: MCQ "${item.id}" has correctIndex ${item.correctIndex} out of range for ${item.options.length} options`
        );
      }
    }
  }
}

// --- Manifest grand total ---
if (manifest?.totals?.rapidFireQAs !== undefined && manifest.totals.rapidFireQAs !== totalQAs) {
  fail(
    `Manifest totals.rapidFireQAs is ${manifest.totals.rapidFireQAs} but all system files total ${totalQAs}`
  );
}

// --- Report ---
console.log(
  `\nChecked ${systemFiles.length} system files, ${totalQAs} Q&As (${totalMcqs} MCQs), ${seenQaIds.size} unique Q&A ids.`
);
if (warnings.length > 0) console.log(`${warnings.length} warning(s).`);
if (errors.length > 0) {
  console.error(`\nvalidate-data: FAILED with ${errors.length} error(s).`);
  process.exit(1);
}
console.log('validate-data: OK.');
