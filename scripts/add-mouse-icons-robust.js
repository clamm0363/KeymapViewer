#!/usr/bin/env node

/**
 * Legacy mouse icon helper.
 *
 * This script is kept as a compatibility entrypoint for older workflows,
 * but it now delegates to scripts/add-svg-icon.js so that mouse icon
 * generation follows the same modular category logic as every other icon.
 */

const path = require('path');
const { spawnSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ADD_SVG_ICON_SCRIPT = path.join(PROJECT_ROOT, 'scripts', 'add-svg-icon.js');

const MOUSE_KEYCODES = [
  'KC_MS_U',
  'KC_MS_D',
  'KC_MS_L',
  'KC_MS_R',
  'KC_BTN1',
  'KC_BTN2',
  'KC_BTN3',
  'KC_BTN4',
  'KC_BTN5',
  'KC_WH_U',
  'KC_WH_D',
  'KC_WH_L',
  'KC_WH_R',
  'KC_ACL0',
  'KC_ACL1',
  'KC_ACL2'
];

console.log('⚠ scripts/add-mouse-icons-robust.js is deprecated.');
console.log('  Delegating to scripts/add-svg-icon.js for modular output.\n');

const result = spawnSync(process.execPath, [ADD_SVG_ICON_SCRIPT, ...MOUSE_KEYCODES], {
  cwd: PROJECT_ROOT,
  stdio: 'inherit'
});

process.exit(result.status ?? 1);
