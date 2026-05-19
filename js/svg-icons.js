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
    fallback: '\uE207',
    width: 24,
    height: 24,
    category: 'utility'
  },

  // Phase 2: System/Media Icons (低リスク - Low Risk Group)
  
  // Power & System
  KC_KB_POWER: {
    id: 'power-icon',
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <!-- Power icon: circle with top notch -->
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
      <path d="M 12 2 L 12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    fallback: '\uF60F',  // power_24
    width: 24,
    height: 24,
    category: 'system'
  },

  KC_SYSTEM_SLEEP: {
    id: 'sleep-icon',
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <!-- Sleep/Bed icon: pillow and blanket -->
      <path d="M 3 10 L 3 19 Q 3 20 4 20 L 20 20 Q 21 20 21 19 L 21 10 Z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
      <path d="M 3 10 Q 3 6 9 6 Q 12 8 15 6 Q 21 6 21 10" stroke="currentColor" stroke-width="1.5" fill="currentColor" opacity="0.5" stroke-linejoin="round"/>
    </svg>`,
    fallback: '\uF1DA',  // bed_24
    width: 24,
    height: 24,
    category: 'system'
  },

  KC_SYSTEM_WAKE: {
    id: 'wake-icon',
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <!-- Wake/Eye icon: open eye -->
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
      <path d="M 2 12 Q 6 8 12 8 Q 18 8 22 12 Q 18 16 12 16 Q 6 16 2 12" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
    </svg>`,
    fallback: '\uE5F3',  // eye_24
    width: 24,
    height: 24,
    category: 'system'
  },

  // Audio Controls
  KC_AUDIO_MUTE: {
    id: 'mute-icon',
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <!-- Mute icon: speaker with X -->
      <path d="M 4 9 L 9 9 L 14 4 L 14 20 L 9 15 L 4 15 Q 3 15 3 14 L 3 10 Q 3 9 4 9 Z" fill="currentColor" opacity="0.7"/>
      <path d="M 18 6 L 22 18 M 22 6 L 18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    fallback: '\uEB4B',  // speaker_mute_24
    width: 24,
    height: 24,
    category: 'audio'
  },

  KC_AUDIO_VOL_UP: {
    id: 'volume-up-icon',
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <!-- Volume Up icon: speaker with waves -->
      <path d="M 4 9 L 9 9 L 14 4 L 14 20 L 9 15 L 4 15 Q 3 15 3 14 L 3 10 Q 3 9 4 9 Z" fill="currentColor" opacity="0.7"/>
      <path d="M 16 7 Q 18 9 18 12 Q 18 15 16 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M 19 4 Q 22 7 22 12 Q 22 17 19 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    </svg>`,
    fallback: '\uEA5E',  // speaker_24
    width: 24,
    height: 24,
    category: 'audio'
  },

  KC_AUDIO_VOL_DOWN: {
    id: 'volume-down-icon',
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <!-- Volume Down icon: speaker with single wave -->
      <path d="M 4 9 L 9 9 L 14 4 L 14 20 L 9 15 L 4 15 Q 3 15 3 14 L 3 10 Q 3 9 4 9 Z" fill="currentColor" opacity="0.7"/>
      <path d="M 16 7 Q 18 9 18 12 Q 18 15 16 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    </svg>`,
    fallback: '\uE74F',  // speaker_1_24
    width: 24,
    height: 24,
    category: 'audio'
  },

  // Brightness Controls
  KC_KB_BRIGHTNESS_UP: {
    id: 'brightness-up-icon',
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <!-- Brightness Up icon: sun with rays -->
      <circle cx="12" cy="12" r="5" fill="currentColor"/>
      <path d="M 12 1 L 12 3 M 12 21 L 12 23 M 23 12 L 21 12 M 3 12 L 1 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M 19.07 4.93 L 17.66 6.34 M 6.34 17.66 L 4.93 19.07 M 19.07 19.07 L 17.66 17.66 M 6.34 6.34 L 4.93 4.93" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    fallback: '\uF47F',  // brightness_high_24
    width: 24,
    height: 24,
    category: 'system'
  },

  KC_KB_BRIGHTNESS_DOWN: {
    id: 'brightness-down-icon',
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <!-- Brightness Down icon: dimmed sun -->
      <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.4"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.5" fill="none"/>
      <path d="M 12 2 L 12 4 M 12 20 L 12 22 M 22 12 L 20 12 M 4 12 L 2 12" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
    </svg>`,
    fallback: '\uF480',  // brightness_low_24
    width: 24,
    height: 24,
    category: 'system'
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
