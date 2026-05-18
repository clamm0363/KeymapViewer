/**
 * SVG Icon Library for KeymapViewer
 * Provides SVG rendering with WebFont fallback support
 * 
 * Implementation Strategy:
 * - Each icon has SVG definition + WebFont fallback
 * - SVG rendering is optional; WebFont always available
 * - Failed SVG renders silently fall back to WebFont
 */

export const SVG_ICONS = {
  // Test icon: DEBUG key (🐛 bug symbol)
  DEBUG: {
    id: 'debug-icon',
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <!-- Bug icon: simplified representation -->
      <circle cx="12" cy="6" r="2.5" fill="currentColor"/>
      <path d="M 8 9 L 6 7 M 16 9 L 18 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <rect x="10" y="9" width="4" height="8" rx="1" fill="currentColor" opacity="0.7"/>
      <path d="M 7 17 Q 6 18 7 19 M 17 17 Q 18 18 17 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M 9 14 L 6 16 M 15 14 L 18 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    </svg>`,
    fallback: '\uE207',  // Fluent UI System Icons code point for DEBUG
    width: 24,
    height: 24,
    category: 'utility'
  }
};

/**
 * Render SVG icon as DOM element
 * @param {string} iconKey - Key from SVG_ICONS
 * @param {object} options - { size: 24, color: 'currentColor' }
 * @returns {SVGElement|null} - SVG element or null on error
 */
export function createSVGElement(iconKey, options = {}) {
  const icon = SVG_ICONS[iconKey];
  if (!icon || !icon.svg) {
    console.debug(`[SVG] Icon not found: ${iconKey}`);
    return null;
  }

  const { size = 24, color = 'currentColor' } = options;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(icon.svg, 'image/svg+xml');
    
    // Check for parse errors
    if (doc.documentElement.nodeName === 'parsererror') {
      console.warn(`[SVG] Parse error for ${iconKey}:`, doc.documentElement.textContent);
      return null;
    }

    const svgElement = doc.documentElement;
    svgElement.setAttribute('width', size);
    svgElement.setAttribute('height', size);
    svgElement.style.color = color;
    svgElement.style.display = 'block';
    svgElement.style.overflow = 'visible';
    
    return svgElement.cloneNode(true);
  } catch (error) {
    console.warn(`[SVG] Render failed for ${iconKey}:`, error.message);
    return null;
  }
}

/**
 * Check if SVG icon is available and valid
 * @param {string} iconKey - Key from SVG_ICONS
 * @returns {boolean} - true if SVG can be rendered
 */
export function isSVGAvailable(iconKey) {
  const icon = SVG_ICONS[iconKey];
  return icon && icon.svg && icon.svg.length > 0;
}

/**
 * Get WebFont fallback code point
 * @param {string} iconKey - Key from SVG_ICONS
 * @returns {string|null} - Unicode code point or null
 */
export function getSVGFallback(iconKey) {
  const icon = SVG_ICONS[iconKey];
  return icon?.fallback || null;
}

/**
 * Check if icon should use WebFont exclusively (e.g., JP_KANA)
 * @param {string} iconKey - Key from SVG_ICONS
 * @returns {boolean} - true if WebFont is mandatory
 */
export function isWebFontOnly(iconKey) {
  const icon = SVG_ICONS[iconKey];
  return icon?.useWebFontOnly === true;
}

/**
 * Get SVG icon category (for logging/debugging)
 * @param {string} iconKey - Key from SVG_ICONS
 * @returns {string|null} - Category name or null
 */
export function getSVGCategory(iconKey) {
  const icon = SVG_ICONS[iconKey];
  return icon?.category || null;
}

// Export list of all SVG icon keys for debugging
export function listSVGIcons() {
  return Object.keys(SVG_ICONS).map(key => ({
    key,
    category: SVG_ICONS[key].category,
    hasSVG: !!SVG_ICONS[key].svg,
    fallback: SVG_ICONS[key].fallback
  }));
}

// Debug helper: log all available SVG icons to console
export function debugSVGIcons() {
  console.log('[SVG] Available icons:');
  listSVGIcons().forEach(icon => {
    console.log(`  ${icon.key} [${icon.category}] - SVG: ${icon.hasSVG}, Fallback: ${icon.fallback}`);
  });
}
