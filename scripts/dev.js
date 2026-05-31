/**
 * dev.js — Safe dev server launcher for Windows/OneDrive
 * Deletes .next before starting to avoid EINVAL readlink errors
 * caused by OneDrive reparse points on Windows.
 */
const { rmSync, existsSync } = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const nextDir = path.join(__dirname, '..', '.next');

if (existsSync(nextDir)) {
  try {
    rmSync(nextDir, { recursive: true, force: true });
    console.log('✓ Cleaned .next cache');
  } catch (e) {
    console.warn('⚠ Could not clean .next:', e.message);
  }
}

const child = spawn('next', ['dev'], { stdio: 'inherit', shell: true });

child.on('exit', (code) => process.exit(code ?? 0));
child.on('error', (err) => { console.error(err); process.exit(1); });
