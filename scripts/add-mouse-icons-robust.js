const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SVG_ICONS_FILE = path.join(PROJECT_ROOT, 'js', 'svg-icons.js');
const FLUENT_REPO = path.join(PROJECT_ROOT, 'fluentui-system-icons', 'assets');

const mouseIcons = [
  { keyCode: 'KC_MS_U', folder: 'Arrow Circle Up', filePattern: 'ic_fluent_arrow_circle_up_24_regular.svg', fallback: '\\uF19C', size: 24 },
  { keyCode: 'KC_MS_D', folder: 'Arrow Circle Down', filePattern: 'ic_fluent_arrow_circle_down_24_regular.svg', fallback: '\\uF149', size: 24 },
  { keyCode: 'KC_MS_L', folder: 'Arrow Circle Left', filePattern: 'ic_fluent_arrow_circle_left_24_regular.svg', fallback: '\\uF15C', size: 24 },
  { keyCode: 'KC_MS_R', folder: 'Arrow Circle Right', filePattern: 'ic_fluent_arrow_circle_right_24_regular.svg', fallback: '\\uF182', size: 24 },
  { keyCode: 'KC_BTN1', folder: 'Cursor Click', filePattern: 'ic_fluent_cursor_click_24_regular.svg', fallback: '\\uE446', size: 24 },
  { keyCode: 'KC_BTN2', folder: 'Cursor Click', filePattern: 'ic_fluent_cursor_click_24_regular.svg', fallback: '\\uE449', size: 24 },
  { keyCode: 'KC_BTN3', folder: 'Cursor Click', filePattern: 'ic_fluent_cursor_click_24_regular.svg', fallback: '\\uE444', size: 24 },
  { keyCode: 'KC_BTN4', folder: 'Cursor Click', filePattern: 'ic_fluent_cursor_click_24_regular.svg', fallback: '\\uE446', size: 24 },
  { keyCode: 'KC_BTN5', folder: 'Cursor Click', filePattern: 'ic_fluent_cursor_click_24_regular.svg', fallback: '\\uE446', size: 24 },
  { keyCode: 'KC_WH_U', folder: 'Chevron Double Up', filePattern: 'ic_fluent_chevron_double_up_20_regular.svg', fallback: '\\uF2CA', size: 20 },
  { keyCode: 'KC_WH_D', folder: 'Chevron Double Down', filePattern: 'ic_fluent_chevron_double_down_20_regular.svg', fallback: '\\uF2C7', size: 20 },
  { keyCode: 'KC_WH_L', folder: 'Chevron Double Left', filePattern: 'ic_fluent_chevron_double_left_20_regular.svg', fallback: '\\uF2C8', size: 20 },
  { keyCode: 'KC_WH_R', folder: 'Chevron Double Right', filePattern: 'ic_fluent_chevron_double_right_20_regular.svg', fallback: '\\uF2C9', size: 20 },
  { keyCode: 'KC_ACL0', folder: 'Gauge', filePattern: 'ic_fluent_gauge_24_regular.svg', fallback: '\\uF445', size: 24 },
  { keyCode: 'KC_ACL1', folder: 'Gauge', filePattern: 'ic_fluent_gauge_24_regular.svg', fallback: '\\uF445', size: 24 },
  { keyCode: 'KC_ACL2', folder: 'Gauge', filePattern: 'ic_fluent_gauge_24_regular.svg', fallback: '\\uF445', size: 24 },
];

let appendData = '\n\n// ============================================================================\n';
appendData += '// Mouse Input Keycode Icons\n';
appendData += '// ============================================================================\n';

for (const icon of mouseIcons) {
  const filePath = path.join(FLUENT_REPO, icon.folder, 'SVG', icon.filePattern);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  let svgContent = fs.readFileSync(filePath, 'utf8').trim();
  
  // Extract svg tags only
  const match = svgContent.match(/<svg[^>]*>[\s\S]*?<\/svg>/);
  if (!match) {
    console.error(`❌ Could not parse SVG content from: ${filePath}`);
    process.exit(1);
  }
  
  // Clean up and standardize
  let cleanedSvg = match[0]
    .replace(/fill="#212121"/g, 'fill="currentColor"')
    .replace(/fill="none"/g, 'fill="none"') // preserve none
    .trim();

  const id = icon.keyCode.toLowerCase().replace(/_/g, '-') + '-icon';
  const category = (icon.keyCode.startsWith('KC_ACL')) ? 'utility' : 'mouse';

  appendData += `\nSVG_ICONS['${icon.keyCode}'] = {
  id: '${id}',
  svg: \`${cleanedSvg}\`,
  fallback: '${icon.fallback}',
  width: ${icon.size},
  height: ${icon.size},
  category: '${category}'
};\n`;

  console.log(`✅ Formatted: ${icon.keyCode} (${icon.filePattern})`);
}

// Append directly to js/svg-icons.js
fs.appendFileSync(SVG_ICONS_FILE, appendData, 'utf8');
console.log('🎉 Successfully appended all 16 mouse icons to js/svg-icons.js!');
