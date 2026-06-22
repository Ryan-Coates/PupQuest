#!/usr/bin/env node
/**
 * Sets GitHub Actions secrets from .env.local using the GitHub REST API.
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_xxx node scripts/set-github-secrets.js owner/repo
 *
 * The token needs the `repo` scope (or `secrets` fine-grained permission).
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sodium from 'tweetsodium';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────

const REPO = process.argv[2]; // e.g. "ryan-coates/PupQuest"
const TOKEN = process.env.GITHUB_TOKEN;

if (!REPO || !TOKEN) {
  console.error('Usage: GITHUB_TOKEN=ghp_xxx node scripts/set-github-secrets.js owner/repo');
  process.exit(1);
}

// Keys to upload (reads values from .env.local)
const SECRET_KEYS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

// ── Parse .env.local ──────────────────────────────────────────────────────────

function parseEnvFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  return Object.fromEntries(
    content
      .split('\n')
      .filter((l) => l.trim() && !l.startsWith('#'))
      .map((l) => {
        const idx = l.indexOf('=');
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
      })
  );
}

const envPath = resolve(__dirname, '..', '.env.local');
let envVars;
try {
  envVars = parseEnvFile(envPath);
} catch {
  console.error('.env.local not found. Create it first (see .env.local.example).');
  process.exit(1);
}

// ── GitHub API helpers ────────────────────────────────────────────────────────

const BASE = 'https://api.github.com';
const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json',
  'User-Agent': 'pupquest-secrets-script',
};

async function apiGet(path) {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function apiPut(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok && res.status !== 204) throw new Error(`PUT ${path} → ${res.status} ${await res.text()}`);
}

// ── Encrypt a secret value with the repo's public key ────────────────────────

function encryptSecret(publicKeyB64, secretValue) {
  const keyBytes = Buffer.from(publicKeyB64, 'base64');
  const valueBytes = Buffer.from(secretValue, 'utf8');
  const encrypted = sodium.seal(valueBytes, keyBytes);
  return Buffer.from(encrypted).toString('base64');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔑 Setting GitHub secrets for ${REPO}\n`);

  // Get repo public key (required by the API to encrypt secrets)
  const { key_id, key } = await apiGet(`/repos/${REPO}/actions/secrets/public-key`);

  for (const name of SECRET_KEYS) {
    const value = envVars[name];
    if (!value) {
      console.warn(`  ⚠  ${name} — not found in .env.local, skipping`);
      continue;
    }

    const encryptedValue = encryptSecret(key, value);
    await apiPut(`/repos/${REPO}/actions/secrets/${name}`, {
      encrypted_value: encryptedValue,
      key_id,
    });

    console.log(`  ✓  ${name}`);
  }

  console.log('\n✅ Done! All secrets uploaded to GitHub Actions.\n');
}

main().catch((err) => {
  console.error('\n❌', err.message);
  process.exit(1);
});
