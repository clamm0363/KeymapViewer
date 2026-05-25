/**
 * SVG Icon Library for KeymapViewer
 * Provides SVG rendering with WebFont fallback support
 *
 * This entrypoint modularizes system, media, wireless, mouse, utility,
 * keyboard, edit, RGB, and web icons
 * into distinct submodules under js/icons/ for extreme safety and clean version control.
 */

import { SYSTEM_ICONS } from './icons/system.js';
import { MEDIA_ICONS } from './icons/media.js';
import { WIRELESS_ICONS } from './icons/wireless.js';
import { MOUSE_ICONS } from './icons/mouse.js';
import { UTILITY_ICONS } from './icons/utility.js';
import { KEYBOARD_ICONS } from './icons/keyboard.js';
import { EDIT_ICONS } from './icons/edit.js';
import { RGB_ICONS } from './icons/rgb.js';
import { WEB_ICONS } from './icons/web.js';
import { ICON_ALIASES } from './icons/aliases.js';

// Assemble all icon categories into a unified SVG_ICONS dictionary
export const SVG_ICONS = Object.assign(
  {},
  SYSTEM_ICONS,
  MEDIA_ICONS,
  WIRELESS_ICONS,
  MOUSE_ICONS,
  KEYBOARD_ICONS,
  EDIT_ICONS,
  RGB_ICONS,
  WEB_ICONS,
  UTILITY_ICONS
);

// Map all keycode aliases dynamically using the alias lookup table
for (const [alias, target] of Object.entries(ICON_ALIASES)) {
  if (SVG_ICONS[target]) {
    SVG_ICONS[alias] = SVG_ICONS[target];
  } else {
    console.debug(`[SVG] Target icon not found for alias: ${alias} -> ${target}`);
  }
}

/**
 * Safely retrieve icon from SVG_ICONS preventing prototype pollution
 * @param {string} key - Key from SVG_ICONS
 * @returns {object|null} - Icon object or null
 */
function getSafeIcon(key) {
  if (typeof key !== 'string' || key === '__proto__' || key === 'constructor' || key === 'prototype') {
    return null;
  }
  return Object.prototype.hasOwnProperty.call(SVG_ICONS, key) ? SVG_ICONS[key] : null;
}

/**
 * Render SVG icon as DOM element
 * @param {string} iconKey - Key from SVG_ICONS
 * @param {object} options - { size: 24, color: 'currentColor' }
 * @returns {SVGElement|null} - SVG element or null on error
 */
export function createSVGElement(iconKey, options = {}) {
  const icon = getSafeIcon(iconKey);
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

    // Normalize hardcoded colors in all child nodes to currentColor to support theme styling
    const allElements = svgElement.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      
      const fill = el.getAttribute('fill');
      if (fill && fill !== 'none' && fill !== 'currentColor' && fill.startsWith('#')) {
        el.setAttribute('fill', 'currentColor');
      }
      const stroke = el.getAttribute('stroke');
      if (stroke && stroke !== 'none' && stroke !== 'currentColor' && stroke.startsWith('#')) {
        el.setAttribute('stroke', 'currentColor');
      }

      if (el.style.fill && el.style.fill.startsWith('#')) {
        el.style.fill = 'currentColor';
      }
      if (el.style.stroke && el.style.stroke.startsWith('#')) {
        el.style.stroke = 'currentColor';
      }
    }
    
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
  const icon = getSafeIcon(iconKey);
  return icon && icon.svg && icon.svg.length > 0;
}

/**
 * Get WebFont fallback code point
 * @param {string} iconKey - Key from SVG_ICONS
 * @returns {string|null} - Unicode code point or null
 */
export function getSVGFallback(iconKey) {
  const icon = getSafeIcon(iconKey);
  return icon?.fallback || null;
}

/**
 * Check if icon should use WebFont exclusively (e.g., JP_KANA)
 * @param {string} iconKey - Key from SVG_ICONS
 * @returns {boolean} - true if WebFont is mandatory
 */
export function isWebFontOnly(iconKey) {
  const icon = getSafeIcon(iconKey);
  return icon?.useWebFontOnly === true;
}

/**
 * Get SVG icon category (for logging/debugging)
 * @param {string} iconKey - Key from SVG_ICONS
 * @returns {string|null} - Category name or null
 */
export function getSVGCategory(iconKey) {
  const icon = getSafeIcon(iconKey);
  return icon?.category || null;
}

// Export list of all SVG icon keys for debugging
export function listSVGIcons() {
  return Object.keys(SVG_ICONS).map(key => {
    const icon = getSafeIcon(key);
    return {
      key,
      category: icon ? icon.category : null,
      hasSVG: !!(icon && icon.svg),
      fallback: icon ? icon.fallback : null
    };
  });
}

// Debug helper: log all available SVG icons to console
export function debugSVGIcons() {
  console.log('[SVG] Available icons:');
  listSVGIcons().forEach(icon => {
    console.log(`  ${icon.key} [${icon.category}] - SVG: ${icon.hasSVG}, Fallback: ${icon.fallback}`);
  });
}
