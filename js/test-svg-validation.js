/**
 * SVG Icon Test Validation
 *
 * Current validation goals:
 * 1. svg-icons.js exports load without errors
 * 2. Core API functions are present
 * 3. Representative icons and aliases resolve correctly
 * 4. Basic icon metadata is internally consistent
 * 5. DOM-only rendering checks are skipped outside the browser
 */

import {
  SVG_ICONS,
  createSVGElement,
  getSVGCategory,
  getSVGFallback,
  isSVGAvailable,
  listSVGIcons
} from './svg-icons.js';

console.log('\n=== SVG Validation ===\n');

function logResult(name, passed, detail = '') {
  const marker = passed ? '✓' : '✗';
  const suffix = detail ? ` - ${detail}` : '';
  console.log(`  ${marker} ${name}${suffix}`);
}

// Test 1: Module Structure
console.log('Test 1: Checking SVG module structure...');
{
  const checks = [
    ['SVG_ICONS exists', typeof SVG_ICONS === 'object' && SVG_ICONS !== null],
    ['createSVGElement function', typeof createSVGElement === 'function'],
    ['isSVGAvailable function', typeof isSVGAvailable === 'function'],
    ['getSVGFallback function', typeof getSVGFallback === 'function'],
    ['DEBUG icon defined', SVG_ICONS.DEBUG !== undefined]
  ];

  let passed = 0;
  for (const [name, ok] of checks) {
    logResult(name, ok);
    if (ok) passed++;
  }
  console.log(`Result: ${passed}/${checks.length} checks passed\n`);
}

// Test 2: Representative key resolution
console.log('Test 2: Checking representative icons...');
{
  const checks = [
    ['DEBUG available', isSVGAvailable('DEBUG')],
    ['KC_COPY available', isSVGAvailable('KC_COPY')],
    ['KC_WWW_HOME available', isSVGAvailable('KC_WWW_HOME')],
    ['KC_RGB_TOG available', isSVGAvailable('KC_RGB_TOG')],
    ['KC_ACL0 available', isSVGAvailable('KC_ACL0')],
    ['Alias KC_DEBUG resolves', SVG_ICONS.KC_DEBUG === SVG_ICONS.DEBUG],
    ['Alias KC_WBAK resolves', SVG_ICONS.KC_WBAK === SVG_ICONS.KC_WWW_BACK]
  ];

  let passed = 0;
  for (const [name, ok] of checks) {
    logResult(name, ok);
    if (ok) passed++;
  }
  console.log(`Result: ${passed}/${checks.length} checks passed\n`);
}

// Test 3: Metadata sanity
console.log('Test 3: Checking icon metadata...');
{
  const sampleKeys = ['DEBUG', 'KC_COPY', 'KC_WWW_HOME', 'KC_RGB_TOG', 'KC_ACL0'];
  for (const key of sampleKeys) {
    const icon = SVG_ICONS[key];
    const category = getSVGCategory(key);
    const fallback = getSVGFallback(key);
    const ok = !!icon && typeof icon.width === 'number' && typeof icon.height === 'number' && !!category && !!fallback;
    logResult(key, ok, ok ? `${category}, ${icon.width}x${icon.height}` : 'metadata missing');
  }
  console.log('');
}

// Test 4: Exported icon list
console.log('Test 4: Listing icon inventory...');
{
  const icons = listSVGIcons();
  const categoryCounts = icons.reduce((acc, icon) => {
    const category = icon.category || 'unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  logResult('Icon list generated', icons.length > 0, `${icons.length} icon entries`);
  console.log(`  Categories: ${JSON.stringify(categoryCounts)}`);
  console.log('');
}

// Test 5: Rendering checks
console.log('Test 5: Testing SVG rendering...');
if (typeof DOMParser === 'undefined' || typeof document === 'undefined') {
  console.log('  (Skipping DOM rendering checks outside the browser)\n');
} else {
  const rendered = createSVGElement('DEBUG', { size: 24 });
  const missing = createSVGElement('DOES_NOT_EXIST', { size: 24 });
  logResult('DEBUG renders to SVG element', !!rendered && rendered.tagName.toLowerCase() === 'svg');
  logResult('Missing icon returns null', missing === null);
  console.log('');
}

console.log('=== SVG Validation Complete ===\n');
