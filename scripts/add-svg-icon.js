#!/usr/bin/env node

/**
 * SVG Icon Automation Script
 * Adds Fluent UI System Icons to modular category files under js/icons/
 *
 * Usage:
 *   node scripts/add-svg-icon.js KC_HELP KC_UNDO KC_CUT
 *   node scripts/add-svg-icon.js --dry-run KC_HELP
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const KEYMAP_DICT = path.join(PROJECT_ROOT, 'js', 'keymap-dictionary.js');
const FLUENT_REPO = path.join(PROJECT_ROOT, 'fluentui-system-icons', 'assets');
const ICONS_DIR = path.join(PROJECT_ROOT, 'js', 'icons');

// Category-to-File mapping dictionary
const CATEGORY_MAP = {
  'system': { file: 'system.js', exportName: 'SYSTEM_ICONS' },
  'audio': { file: 'media.js', exportName: 'MEDIA_ICONS' },
  'media': { file: 'media.js', exportName: 'MEDIA_ICONS' },
  'wireless': { file: 'wireless.js', exportName: 'WIRELESS_ICONS' },
  'mouse': { file: 'mouse.js', exportName: 'MOUSE_ICONS' },
  'keyboard': { file: 'keyboard.js', exportName: 'KEYBOARD_ICONS' },
  'edit': { file: 'edit.js', exportName: 'EDIT_ICONS' },
  'web': { file: 'web.js', exportName: 'WEB_ICONS' },
  'rgb': { file: 'rgb.js', exportName: 'RGB_ICONS' },
  'jp-keys': { file: 'utility.js', exportName: 'UTILITY_ICONS' },
  'utility': { file: 'utility.js', exportName: 'UTILITY_ICONS' }
};

// Parse CLI arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const keyCodes = args.filter(arg => !arg.startsWith('--'));

if (keyCodes.length === 0) {
  console.error('❌ Usage: node scripts/add-svg-icon.js [--dry-run] KEYCODE [KEYCODE...]');
  console.error('   Example: node scripts/add-svg-icon.js KC_HELP KC_UNDO');
  process.exit(1);
}

// Input validation to prevent Path Traversal and ReDoS
for (const keyCode of keyCodes) {
  if (typeof keyCode !== 'string' || !/^[A-Za-z0-9_]+$/.test(keyCode)) {
    console.error(`❌ Invalid KEYCODE format: "${keyCode}". Only alphanumeric characters and underscores are allowed.`);
    process.exit(1);
  }
}

/**
 * Extract icon name from keymap-dictionary.js for given keycode
 */
function getIconNameFromKeymap(keyCode) {
  if (typeof keyCode !== 'string' || !/^[A-Za-z0-9_]+$/.test(keyCode)) {
    throw new Error('Invalid keyCode format');
  }
  try {
    const safePath = path.normalize(KEYMAP_DICT);
    if (!safePath.startsWith(PROJECT_ROOT)) {
      throw new Error('Path traversal detected');
    }
    const content = fs.readFileSync(safePath, 'utf8');
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
  if (typeof keyCode !== 'string' || !/^[A-Za-z0-9_]+$/.test(keyCode)) {
    throw new Error('Invalid keyCode format');
  }
  try {
    const safePath = path.normalize(KEYMAP_DICT);
    if (!safePath.startsWith(PROJECT_ROOT)) {
      throw new Error('Path traversal detected');
    }
    const content = fs.readFileSync(safePath, 'utf8');
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
  let style = 'regular'; // default style is regular (outline)
  let cleanIconName = iconName;

  if (iconName.endsWith('_filled')) {
    style = 'filled';
    cleanIconName = iconName.substring(0, iconName.length - 7);
  } else if (iconName.endsWith('_regular')) {
    style = 'regular';
    cleanIconName = iconName.substring(0, iconName.length - 8);
  }

  const searchPatterns = [
    cleanIconName.replace(/_24$/, '').replace(/_20$/, ''),
    cleanIconName
  ];

  function searchRecursive(dir, pattern, styleToSearch, exactOnly = false) {
    try {
      const safeDir = path.normalize(dir);
      if (!safeDir.startsWith(PROJECT_ROOT)) {
        return null;
      }
      const entries = fs.readdirSync(safeDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const result = searchRecursive(fullPath, pattern, styleToSearch, exactOnly);
          if (result) return result;
        } else {
          if (exactOnly) {
            // Check for exact matching filename, e.g. ic_fluent_search_24_regular.svg or ic_fluent_search_20_regular.svg
            const expectedName24 = `ic_fluent_${pattern}_24_${styleToSearch}.svg`;
            const expectedName20 = `ic_fluent_${pattern}_20_${styleToSearch}.svg`;
            if (entry.name === expectedName24 || entry.name === expectedName20) {
              return fullPath;
            }
          } else {
            // Substring fallback matching
            if (entry.name.includes(pattern) && (entry.name.includes(`24_${styleToSearch}.svg`) || entry.name.includes(`20_${styleToSearch}.svg`))) {
              return fullPath;
            }
          }
        }
      }
    } catch (err) {
      // ignore read errors
    }
    return null;
  }

  // 1. Try EXACT match with preferred style first
  for (const pattern of searchPatterns) {
    const result = searchRecursive(FLUENT_REPO, pattern, style, true);
    if (result) return result;
  }

  // 2. Try EXACT match with alternate style
  const altStyle = style === 'regular' ? 'filled' : 'regular';
  for (const pattern of searchPatterns) {
    const result = searchRecursive(FLUENT_REPO, pattern, altStyle, true);
    if (result) return result;
  }

  // 3. Fallback to broad SUBSTRING match with preferred style
  for (const pattern of searchPatterns) {
    const result = searchRecursive(FLUENT_REPO, pattern, style, false);
    if (result) return result;
  }

  // 4. Fallback to broad SUBSTRING match with alternate style
  for (const pattern of searchPatterns) {
    const result = searchRecursive(FLUENT_REPO, pattern, altStyle, false);
    if (result) return result;
  }

  return null;
}

/**
 * Extract SVG content from file and normalize color variables
 */
function extractSVGContent(svgPath) {
  try {
    const safePath = path.normalize(svgPath);
    if (!safePath.startsWith(PROJECT_ROOT)) {
      throw new Error('Path traversal detected');
    }
    let content = fs.readFileSync(safePath, 'utf8');
    
    // Extract only the SVG element
    const svgMatch = content.match(/<svg[^>]*>[\s\S]*?<\/svg>/);
    if (svgMatch) {
      let cleanedSvg = svgMatch[0];
      
      // Standardize filled/stroke colors to support Light/Dark theme switching seamlessly
      cleanedSvg = cleanedSvg
        .replace(/fill="#(212121|2c2c2c|2C2C2C)"/g, 'fill="currentColor"')
        .replace(/stroke="#(212121|2c2c2c|2C2C2C)"/g, 'stroke="currentColor"')
        .trim();
        
      return cleanedSvg;
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
  const keyboardKeys = new Set([
    'KC_ENT', 'KC_BSPC', 'KC_TAB', 'KC_CAPS', 'KC_SPC',
    'KC_LCTL', 'KC_RCTL', 'KC_LALT', 'KC_RALT', 'KC_LGUI', 'KC_RGUI',
    'KC_FN', 'KC_APP', 'KC_LSFT', 'KC_RSFT',
    'KC_UP', 'KC_DOWN', 'KC_LEFT', 'KC_RGHT', 'KC_TRNS'
  ]);
  const editKeys = new Set([
    'KC_HELP', 'KC_UNDO', 'KC_CUT', 'KC_COPY', 'KC_PASTE', 'KC_AGAIN'
  ]);
  const webKeys = new Set([
    'KC_MAIL', 'KC_CALCULATOR', 'KC_MY_COMPUTER',
    'KC_ASSISTANT', 'KC_MISSION_CONTROL', 'KC_LAUNCHPAD'
  ]);

  if (keyCode.startsWith('KC_AUDIO_') || keyCode.startsWith('KC_KB_VOLUME_')) return 'audio';
  if (keyCode.startsWith('KC_MEDIA_')) return 'media';
  if (keyCode.startsWith('KC_WWW_')) return 'web';
  if (keyCode.startsWith('KC_MS_') || keyCode.startsWith('KC_BTN') || keyCode.startsWith('KC_WH_')) return 'mouse';
  if (keyCode.startsWith('KC_BT_') || keyCode.startsWith('KC_OUT_')) return 'wireless';
  if (keyCode.startsWith('KC_RGB_')) return 'rgb';
  if (keyboardKeys.has(keyCode)) return 'keyboard';
  if (editKeys.has(keyCode)) return 'edit';
  if (webKeys.has(keyCode)) return 'web';
  if (keyCode.startsWith('JP_') || keyCode.startsWith('KC_JP_')) return 'jp-keys';
  if (keyCode.includes('BRIGHTNESS')) return 'system';
  if (keyCode.includes('POWER') || keyCode.includes('SLEEP') || keyCode.includes('WAKE')) return 'system';
  return 'utility';
}

/**
 * Generate icon object
 */
function generateIconObject(keyCode, svgContent, fallback, category) {
  const id = keyCode.toLowerCase().replace(/_/g, '-') + '-icon';

  return {
    id,
    svg: svgContent,
    fallback,
    width: 24,
    height: 24,
    category
  };
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
 * Add icon entry to the corresponding category file in js/icons/
 */
function addIconToFile(keyCode, iconCode, category) {
  const target = CATEGORY_MAP[category] || CATEGORY_MAP['utility'];
  const targetFile = path.join(ICONS_DIR, target.file);

  try {
    const safePath = path.normalize(targetFile);
    if (!safePath.startsWith(PROJECT_ROOT)) {
      throw new Error('Path traversal detected');
    }
    
    if (!fs.existsSync(safePath)) {
      throw new Error(`Category file does not exist: ${target.file}`);
    }

    const originalContent = fs.readFileSync(safePath, 'utf8');
    let content = originalContent;

    // Check if keycode is already defined in the target file
    const keyMatchRegex = new RegExp(`\\b${keyCode}\\s*:\\s*{`);
    if (keyMatchRegex.test(content)) {
      console.log(`  ⚠ Keycode "${keyCode}" already defined in ${target.file}. Skipping write.`);
      return true;
    }

    // Find insertion point: before the closing brace of the main export object
    const insertPoint = content.lastIndexOf('};');
    if (insertPoint === -1) {
      throw new Error(`Could not find closing brace of ${target.exportName} in ${target.file}`);
    }

    // Check if a comma is needed for the previous item
    const beforeInsertStr = content.substring(0, insertPoint).trim();
    const needsComma = beforeInsertStr.endsWith('}');

    const newEntry = `${needsComma ? ',' : ''}\n\n${iconCode}\n`;
    content = content.substring(0, insertPoint) + newEntry + content.substring(insertPoint);

    if (!dryRun) {
      fs.writeFileSync(safePath, content, 'utf8');
      
      // Auto-validate syntax
      try {
        execSync(`node --check "${safePath}"`, { stdio: 'ignore' });
        console.log(`  ✓ Syntax check passed successfully for ${target.file}`);
      } catch (err) {
        console.error(`  ❌ Syntax validation failed after write! Reverting changes to ${target.file}...`);
        fs.writeFileSync(safePath, originalContent, 'utf8');
        return false;
      }
    }
    
    console.log(`  ✅ Successfully added to js/icons/${target.file}`);
    return true;
  } catch (err) {
    console.error(`❌ Error writing to category file: ${err.message}`);
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
  console.log(`  ✓ SVG extracted and standardized (${svgContent.length} bytes)`);

  // Step 5: Generate and format icon object
  const category = determineCategory(keyCode);
  const icon = generateIconObject(keyCode, svgContent, fallback, category);
  const iconCode = formatIconCode(keyCode, icon);

  // Step 6: Add to category file
  if (!addIconToFile(keyCode, iconCode, category)) {
    return { keyCode, success: false, error: `Failed to add to category module` };
  }

  return {
    keyCode,
    success: true,
    iconName,
    fallback,
    category,
    targetFile: CATEGORY_MAP[category]?.file || 'utility.js',
    svgSize: svgContent.length
  };
}

/**
 * Main entry point
 */
function main() {
  console.log('🚀 SVG Icon Modular Automation Script');
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

  // Output JSON
  console.log('\n📋 JSON Output:');
  console.log(JSON.stringify(results, null, 2));

  process.exit(failed > 0 ? 1 : 0);
}

main();
