#!/usr/bin/env node

/**
 * SVG Icon Automation Script
 * Adds Fluent UI System Icons to svg-icons.js
 *
 * Usage:
 *   node add-svg-icon.js KC_HELP KC_UNDO KC_CUT
 *   node add-svg-icon.js --dry-run KC_HELP
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const KEYMAP_DICT = path.join(PROJECT_ROOT, 'js', 'keymap-dictionary.js');
const SVG_ICONS = path.join(PROJECT_ROOT, 'js', 'svg-icons.js');
const FLUENT_REPO = '/tmp/fluentui-system-icons/assets';

// Parse CLI arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const keyCodes = args.filter(arg => !arg.startsWith('--'));

if (keyCodes.length === 0) {
  console.error('❌ Usage: node add-svg-icon.js [--dry-run] KEYCODE [KEYCODE...]');
  console.error('   Example: node add-svg-icon.js KC_HELP KC_UNDO');
  process.exit(1);
}

/**
 * Extract icon name from keymap-dictionary.js for given keycode
 */
function getIconNameFromKeymap(keyCode) {
  try {
    const content = fs.readFileSync(KEYMAP_DICT, 'utf8');
    const regex = new RegExp(`"${keyCode}":\\s*{[^}]*fluent:[^,]*},\\s*//\\s*([^\\n]+)`, 's');
    const match = content.match(regex);
    if (match && match[1]) {
      return match[1].trim().split(/\s*[(\n]/)[0];
    }
  } catch (err) {
    console.error(`⚠️  Error reading keymap-dictionary.js: ${err.message}`);
  }
  return null;
}

/**
 * Get Unicode fallback value from keymap-dictionary.js
 */
function getFallbackFromKeymap(keyCode) {
  try {
    const content = fs.readFileSync(KEYMAP_DICT, 'utf8');
    const regex = new RegExp(`"${keyCode}":\\s*{[^}]*fluent:\\s*"([^"]+)"`);
    const match = content.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  } catch (err) {
    console.error(`⚠️  Error reading fallback: ${err.message}`);
  }
  return null;
}

/**
 * Find SVG file path in FluentUI repository (recursive directory search)
 */
function findSVGPath(iconName) {
  const searchPatterns = [
    iconName.replace(/_24$/, '').replace(/_20$/, ''),
    iconName
  ];

  function searchRecursive(dir, pattern) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const result = searchRecursive(fullPath, pattern);
          if (result) return result;
        } else if (entry.name.includes(pattern) && entry.name.includes('24_filled.svg')) {
          return fullPath;
        }
      }
    } catch (err) {
      // ignore read errors
    }
    return null;
  }

  for (const pattern of searchPatterns) {
    const result = searchRecursive('/tmp/fluentui-system-icons/assets', pattern);
    if (result) return result;
  }

  return null;
}

/**
 * Extract SVG content from file
 */
function extractSVGContent(svgPath) {
  try {
    const content = fs.readFileSync(svgPath, 'utf8');
    // Extract only the SVG element
    const svgMatch = content.match(/<svg[^>]*>[\s\S]*?<\/svg>/);
    if (svgMatch) {
      return svgMatch[0];
    }
  } catch (err) {
    console.error(`⚠️  Error reading SVG: ${err.message}`);
  }
  return null;
}

/**
 * Determine category from keycode
 */
function determineCategory(keyCode) {
  if (keyCode.startsWith('KC_AUDIO_') || keyCode.startsWith('KC_KB_VOLUME_')) return 'audio';
  if (keyCode.startsWith('KC_MEDIA_')) return 'media';
  if (keyCode.startsWith('KC_WWW_')) return 'web';
  if (keyCode.startsWith('KC_MS_') || keyCode.startsWith('KC_BTN') || keyCode.startsWith('KC_WH_')) return 'mouse';
  if (keyCode.startsWith('KC_RGB_')) return 'rgb';
  if (keyCode.startsWith('JP_') || keyCode.startsWith('KC_JP_')) return 'jp-keys';
  if (keyCode.includes('BRIGHTNESS')) return 'system';
  if (keyCode.includes('POWER') || keyCode.includes('SLEEP') || keyCode.includes('WAKE')) return 'system';
  return 'utility';
}

/**
 * Generate icon object for svg-icons.js
 */
function generateIconObject(keyCode, svgContent, fallback) {
  const id = keyCode.toLowerCase().replace(/_/g, '-') + '-icon';
  const category = determineCategory(keyCode);

  const icon = {
    id,
    svg: svgContent,
    fallback,
    width: 24,
    height: 24,
    category
  };

  return icon;
}

/**
 * Format icon object as JavaScript code
 */
function formatIconCode(keyCode, icon) {
  return `  ${keyCode}: {
    id: '${icon.id}',
    svg: \`${icon.svg}\`,
    fallback: '${icon.fallback}',
    width: ${icon.width},
    height: ${icon.height},
    category: '${icon.category}'
  }`;
}

/**
 * Add icon entry to svg-icons.js
 */
function addIconToFile(keyCode, iconCode) {
  try {
    let content = fs.readFileSync(SVG_ICONS, 'utf8');

    // Find insertion point: before the closing brace of SVG_ICONS
    const insertPoint = content.lastIndexOf('};');
    if (insertPoint === -1) {
      throw new Error('Could not find SVG_ICONS closing brace');
    }

    // Add comma to previous entry if needed
    const beforeInsert = content.substring(Math.max(0, insertPoint - 50), insertPoint);
    const needsComma = !beforeInsert.includes(',\n');

    const newEntry = `${needsComma ? ',' : ''}\n\n  ${keyCode}: ${iconCode.substring(2)}\n`;

    content = content.substring(0, insertPoint) + newEntry + content.substring(insertPoint);

    if (!dryRun) {
      fs.writeFileSync(SVG_ICONS, content, 'utf8');
    }
    return true;
  } catch (err) {
    console.error(`❌ Error writing to svg-icons.js: ${err.message}`);
    return false;
  }
}

/**
 * Main processing function
 */
function processKeyCode(keyCode) {
  console.log(`\n📋 Processing: ${keyCode}`);

  // Step 1: Get icon name from keymap
  const iconName = getIconNameFromKeymap(keyCode);
  if (!iconName) {
    console.error(`  ❌ Icon name not found in keymap-dictionary.js`);
    return { keyCode, success: false, error: 'Icon name not found' };
  }
  console.log(`  ✓ Icon name: ${iconName}`);

  // Step 2: Get fallback Unicode value
  const fallback = getFallbackFromKeymap(keyCode);
  if (!fallback) {
    console.error(`  ❌ Fallback Unicode not found`);
    return { keyCode, success: false, error: 'Fallback not found' };
  }
  console.log(`  ✓ Fallback: ${fallback}`);

  // Step 3: Find SVG in FluentUI repo
  const svgPath = findSVGPath(iconName);
  if (!svgPath) {
    console.error(`  ❌ SVG file not found in FluentUI repository`);
    return { keyCode, success: false, error: 'SVG not found' };
  }
  console.log(`  ✓ SVG found: ${path.basename(svgPath)}`);

  // Step 4: Extract SVG content
  const svgContent = extractSVGContent(svgPath);
  if (!svgContent) {
    console.error(`  ❌ Failed to extract SVG content`);
    return { keyCode, success: false, error: 'SVG extraction failed' };
  }
  console.log(`  ✓ SVG extracted (${svgContent.length} bytes)`);

  // Step 5: Generate icon object
  const icon = generateIconObject(keyCode, svgContent, fallback);
  const iconCode = formatIconCode(keyCode, icon);

  // Step 6: Add to svg-icons.js
  if (!addIconToFile(keyCode, iconCode)) {
    return { keyCode, success: false, error: 'Failed to add to svg-icons.js' };
  }

  console.log(`  ✅ Successfully added to svg-icons.js`);
  return {
    keyCode,
    success: true,
    iconName,
    fallback,
    category: icon.category,
    svgSize: svgContent.length
  };
}

/**
 * Main entry point
 */
function main() {
  console.log('🚀 SVG Icon Automation Script');
  if (dryRun) {
    console.log('   [DRY RUN MODE - No changes will be made]');
  }

  const results = [];
  for (const keyCode of keyCodes) {
    const result = processKeyCode(keyCode);
    results.push(result);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary');
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  console.log(`  ✅ Successful: ${successful}`);
  console.log(`  ❌ Failed: ${failed}`);

  if (dryRun) {
    console.log('   (Dry run - no changes made)');
  }

  // Output JSON for agent processing
  console.log('\n📋 JSON Output:');
  console.log(JSON.stringify(results, null, 2));

  process.exit(failed > 0 ? 1 : 0);
}

main();
