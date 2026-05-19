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
  // All SVG paths sourced from official Microsoft Fluent UI System Icons repository
  // https://github.com/microsoft/fluentui-system-icons
  
  // Power & System
  KC_KB_POWER: {
    id: 'power-icon',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.2042 4.82046C8.57962 4.64545 9.02584 4.80792 9.20085 5.18334C9.37586 5.55876 9.2134 6.00498 8.83797 6.18C6.21382 7.4033 4.5 10.0416 4.5 12.9914C4.5 17.1386 7.85759 20.5002 11.9989 20.5002C16.1403 20.5002 19.4979 17.1386 19.4979 12.9914C19.4979 10.0477 17.7912 7.41389 15.1753 6.18718C14.8002 6.01131 14.6388 5.56472 14.8147 5.1897C14.9905 4.81467 15.4371 4.65322 15.8121 4.82909C18.9502 6.30065 20.9979 9.46066 20.9979 12.9914C20.9979 17.9666 16.9691 22.0002 11.9989 22.0002C7.02876 22.0002 3 17.9666 3 12.9914C3 9.45334 5.05623 6.28796 8.2042 4.82046ZM11.9989 2.49609C12.3786 2.49609 12.6924 2.77825 12.7421 3.14432L12.7489 3.24609V10.746C12.7489 11.1602 12.4132 11.496 11.9989 11.496C11.6192 11.496 11.3055 11.2139 11.2558 10.8478L11.2489 10.746V3.24609C11.2489 2.83188 11.5847 2.49609 11.9989 2.49609Z" fill="currentColor"/>
    </svg>`,
    fallback: '\uF60F',  // power_24
    width: 24,
    height: 24,
    category: 'system'
  },

  KC_SYSTEM_SLEEP: {
    id: 'sleep-icon',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.75 4H17.25C18.7125 4 19.9084 5.1417 19.995 6.58248L20 6.75L20.0006 10.1037C21.0968 10.414 21.9147 11.3872 21.9937 12.5628L22 12.75V20.25C22 20.6642 21.6642 21 21.25 21C20.8703 21 20.5565 20.7178 20.5068 20.3518L20.5 20.25V18H3.5V20.25C3.5 20.6297 3.21785 20.9435 2.85177 20.9932L2.75 21C2.3703 21 2.05651 20.7178 2.00685 20.3518L2 20.25V12.75C2 11.4911 2.84596 10.4297 4.00044 10.1034L4 6.75C4 5.28747 5.1417 4.0916 6.58248 4.00502L6.75 4ZM19.25 11.5H4.75C4.10279 11.5 3.57047 11.9919 3.50645 12.6222L3.5 12.75V16.5H20.5V12.75C20.5 12.1028 20.0081 11.5705 19.3778 11.5065L19.25 11.5ZM17.25 5.5H6.75C6.10279 5.5 5.57047 5.99187 5.50645 6.62219L5.5 6.75V10H7C7 9.44772 7.44772 9 8 9H10C10.5128 9 10.9355 9.38604 10.9933 9.88338L11 10H13C13 9.44772 13.4477 9 14 9H16C16.5128 9 16.9355 9.38604 16.9933 9.88338L17 10H18.5V6.75C18.5 6.10279 18.0081 5.57047 17.3778 5.50645L17.25 5.5Z" fill="currentColor"/>
    </svg>`,
    fallback: '\uF1DA',  // bed_24
    width: 24,
    height: 24,
    category: 'system'
  },

  KC_SYSTEM_WAKE: {
    id: 'wake-icon',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.9999 9.00462C14.209 9.00462 15.9999 10.7955 15.9999 13.0046C15.9999 15.2138 14.209 17.0046 11.9999 17.0046C9.79073 17.0046 7.99987 15.2138 7.99987 13.0046C7.99987 10.7955 9.79073 9.00462 11.9999 9.00462ZM11.9999 10.5046C10.6192 10.5046 9.49987 11.6239 9.49987 13.0046C9.49987 14.3853 10.6192 15.5046 11.9999 15.5046C13.3806 15.5046 14.4999 14.3853 14.4999 13.0046C14.4999 11.6239 13.3806 10.5046 11.9999 10.5046ZM11.9999 5.5C16.6134 5.5 20.596 8.65001 21.701 13.0644C21.8016 13.4662 21.5574 13.8735 21.1556 13.9741C20.7537 14.0746 20.3465 13.8305 20.2459 13.4286C19.307 9.67796 15.9212 7 11.9999 7C8.07681 7 4.68997 9.68026 3.75273 13.4332C3.65237 13.835 3.24523 14.0794 2.84336 13.9791C2.44149 13.8787 2.19707 13.4716 2.29743 13.0697C3.40052 8.65272 7.38436 5.5 11.9999 5.5Z" fill="currentColor"/>
    </svg>`,
    fallback: '\uE5F3',  // eye_24
    width: 24,
    height: 24,
    category: 'system'
  },

  // Audio Controls
  KC_AUDIO_MUTE: {
    id: 'mute-icon',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.9195 3.31534C13.7255 2.59866 15 3.17089 15 4.24951V19.7451C15 20.8238 13.7255 21.396 12.9194 20.6792L8.42793 16.6855C8.29063 16.5634 8.11329 16.496 7.92956 16.496H4.25C3.00736 16.496 2 15.4886 2 14.246V9.7481C2 8.50546 3.00736 7.4981 4.25 7.4981H7.92961C8.11333 7.4981 8.29065 7.43067 8.42794 7.30861L12.9195 3.31534ZM13.5 4.8063L9.4246 8.42962C9.01272 8.79581 8.48075 8.9981 7.92961 8.9981H4.25C3.83579 8.9981 3.5 9.33388 3.5 9.7481V14.246C3.5 14.6602 3.83579 14.996 4.25 14.996H7.92956C8.48074 14.996 9.01275 15.1983 9.42465 15.5646L13.5 19.1883V4.8063ZM16.2197 9.2192C16.5126 8.9263 16.9874 8.9263 17.2803 9.2192L19 10.9389L20.7197 9.2192C21.0126 8.9263 21.4874 8.9263 21.7803 9.2192C22.0732 9.51209 22.0732 9.98696 21.7803 10.2799L20.0607 11.9995L21.7803 13.7192C22.0732 14.0121 22.0732 14.487 21.7803 14.7799C21.4874 15.0728 21.0126 15.0728 20.7197 14.7799L19 13.0602L17.2803 14.7799C16.9874 15.0728 16.5126 15.0728 16.2197 14.7799C15.9268 14.487 15.9268 14.0121 16.2197 13.7192L17.9393 11.9995L16.2197 10.2799C15.9268 9.98696 15.9268 9.51209 16.2197 9.2192Z" fill="currentColor"/>
    </svg>`,
    fallback: '\uEB4B',  // speaker_mute_24
    width: 24,
    height: 24,
    category: 'audio'
  },

  KC_AUDIO_VOL_UP: {
    id: 'volume-up-icon',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 4.24951C15 3.17089 13.7255 2.59866 12.9195 3.31534L8.42794 7.30861C8.29065 7.43067 8.11333 7.4981 7.92961 7.4981H4.25C3.00736 7.4981 2 8.50546 2 9.7481V14.246C2 15.4886 3.00736 16.496 4.25 16.496H7.92956C8.11329 16.496 8.29063 16.5634 8.42793 16.6855L12.9194 20.6792C13.7255 21.396 15 20.8238 15 19.7451V4.24951ZM9.4246 8.42962L13.5 4.8063V19.1883L9.42465 15.5646C9.01275 15.1983 8.48074 14.996 7.92956 14.996H4.25C3.83579 14.996 3.5 14.6602 3.5 14.246V9.7481C3.5 9.33388 3.83579 8.9981 4.25 8.9981H7.92961C8.48075 8.9981 9.01272 8.79581 9.4246 8.42962ZM18.9916 5.89684C19.3244 5.6503 19.7941 5.72028 20.0407 6.05313C21.2717 7.71521 22 9.77341 22 11.9995C22 14.2256 21.2717 16.2838 20.0407 17.9459C19.7941 18.2788 19.3244 18.3488 18.9916 18.1022C18.6587 17.8557 18.5888 17.386 18.8353 17.0531C19.8815 15.6406 20.5 13.8934 20.5 11.9995C20.5 10.1057 19.8815 8.35848 18.8353 6.94592C18.5888 6.61307 18.6587 6.14338 18.9916 5.89684ZM17.143 8.36884C17.5072 8.17165 17.9624 8.30709 18.1596 8.67135C18.6958 9.66196 19 10.7963 19 11.9995C19 13.2027 18.6958 14.3371 18.1596 15.3277C17.9624 15.6919 17.5072 15.8274 17.143 15.6302C16.7787 15.433 16.6432 14.9778 16.8404 14.6136C17.2609 13.8368 17.5 12.9472 17.5 11.9995C17.5 11.0518 17.2609 10.1622 16.8404 9.38544C16.6432 9.02118 16.7787 8.56603 17.143 8.36884Z" fill="currentColor"/>
    </svg>`,
    fallback: '\uEB43',  // speaker_2_24
    width: 24,
    height: 24,
    category: 'audio'
  },

  KC_AUDIO_VOL_DOWN: {
    id: 'volume-down-icon',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.7041 3.4425C14.8952 3.66821 15 3.95433 15 4.25003V19.7517C15 20.442 14.4404 21.0017 13.75 21.0017C13.4542 21.0017 13.168 20.8968 12.9423 20.7056L7.97513 16.4999H4.25C3.00736 16.4999 2 15.4925 2 14.2499V9.74985C2 8.50721 3.00736 7.49985 4.25 7.49985H7.97522L12.9425 3.29588C13.4694 2.84989 14.2582 2.91554 14.7041 3.4425ZM13.5 4.78913L8.52478 8.99985H4.25C3.83579 8.99985 3.5 9.33564 3.5 9.74985V14.2499C3.5 14.6641 3.83579 14.9999 4.25 14.9999H8.52487L13.5 19.2124V4.78913ZM17.1035 8.64021C17.4571 8.42442 17.9187 8.5361 18.1344 8.88967C18.7083 9.8298 18.9957 10.8818 18.9957 12.0304C18.9957 13.1789 18.7083 14.231 18.1344 15.1711C17.9187 15.5247 17.4571 15.6364 17.1035 15.4206C16.75 15.2048 16.6383 14.7432 16.8541 14.3897C17.2822 13.6882 17.4957 12.9069 17.4957 12.0304C17.4957 11.1539 17.2822 10.3726 16.8541 9.67112C16.6383 9.31756 16.75 8.85601 17.1035 8.64021Z" fill="currentColor"/>
    </svg>`,
    fallback: '\uF6FB',  // speaker_1_24
    width: 24,
    height: 24,
    category: 'audio'
  },

  // Brightness Controls
  KC_KB_BRIGHTNESS_UP: {
    id: 'brightness-up-icon',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12.4142 2 12.75 2.33579 12.75 2.75V4.25C12.75 4.66421 12.4142 5 12 5C11.5858 5 11.25 4.66421 11.25 4.25V2.75C11.25 2.33579 11.5858 2 12 2ZM12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17ZM12 15.5C10.067 15.5 8.5 13.933 8.5 12C8.5 10.067 10.067 8.5 12 8.5C13.933 8.5 15.5 10.067 15.5 12C15.5 13.933 13.933 15.5 12 15.5ZM21.25 12.75C21.6642 12.75 22 12.4142 22 12C22 11.5858 21.6642 11.25 21.25 11.25H19.75C19.3358 11.25 19 11.5858 19 12C19 12.4142 19.3358 12.75 19.75 12.75H21.25ZM12 19C12.4142 19 12.75 19.3358 12.75 19.75V21.25C12.75 21.6642 12.4142 22 12 22C11.5858 22 11.25 21.6642 11.25 21.25V19.75C11.25 19.3358 11.5858 19 12 19ZM4.25 12.75C4.66421 12.75 5 12.4142 5 12C5 11.5858 4.66421 11.25 4.25 11.25H2.75C2.33579 11.25 2 11.5858 2 12C2 12.4142 2.33579 12.75 2.75 12.75H4.25ZM4.21967 4.22004C4.51256 3.92714 4.98744 3.92714 5.28033 4.22004L6.78033 5.72004C7.07322 6.01293 7.07322 6.4878 6.78033 6.7807C6.48744 7.07359 6.01256 7.07359 5.71967 6.7807L4.21967 5.2807C3.92678 4.9878 3.92678 4.51293 4.21967 4.22004ZM5.28033 19.7807C4.98744 20.0736 4.51256 20.0736 4.21967 19.7807C3.92678 19.4878 3.92678 19.0129 4.21967 18.72L5.71967 17.22C6.01256 16.9271 6.48744 16.9271 6.78033 17.22C7.07322 17.5129 7.07322 17.9878 6.78033 18.2807L5.28033 19.7807ZM19.7803 4.22004C19.4874 3.92714 19.0126 3.92714 18.7197 4.22004L17.2197 5.72004C16.9268 6.01293 16.9268 6.4878 17.2197 6.7807C17.5126 7.07359 17.9874 7.07359 18.2803 6.7807L19.7803 5.2807C20.0732 4.9878 20.0732 4.51293 19.7803 4.22004ZM18.7197 19.7807C19.0126 20.0736 19.4874 20.0736 19.7803 19.7807C20.0732 19.4878 20.0732 19.0129 19.7803 18.72L18.2803 17.22C17.9874 16.9271 17.5126 16.9271 17.2197 17.22C16.9268 17.5129 16.9268 17.9878 17.2197 18.2807L18.7197 19.7807Z" fill="currentColor"/>
    </svg>`,
    fallback: '\uE1F8',  // brightness_high_24
    width: 24,
    height: 24,
    category: 'system'
  },

  KC_KB_BRIGHTNESS_DOWN: {
    id: 'brightness-down-icon',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.75 2.75C12.75 2.33579 12.4142 2 12 2C11.5858 2 11.25 2.33579 11.25 2.75V4.25C11.25 4.66421 11.5858 5 12 5C12.4142 5 12.75 4.66421 12.75 4.25V2.75ZM19.0303 4.96966C19.3232 5.26255 19.3232 5.73743 19.0303 6.03032L17.9697 7.09098C17.6768 7.38387 17.2019 7.38387 16.909 7.09098C16.6161 6.79809 16.6161 6.32321 16.909 6.03032L17.9697 4.96966C18.2626 4.67677 18.7374 4.67677 19.0303 4.96966ZM17.4093 13C17.4689 12.6757 17.5 12.3415 17.5 12C17.5 8.96243 15.0376 6.5 12 6.5C8.96243 6.5 6.5 8.96243 6.5 12C6.5 12.3415 6.53112 12.6757 6.59069 13H2.75C2.33579 13 2 13.3358 2 13.75C2 14.1642 2.33579 14.5 2.75 14.5H21.25C21.6642 14.5 22 14.1642 22 13.75C22 13.3358 21.6642 13 21.25 13H17.4093ZM12 8C14.2091 8 16 9.79086 16 12C16 12.3453 15.9562 12.6804 15.874 13H8.12602C8.04375 12.6804 8 12.3453 8 12C8 9.79086 9.79086 8 12 8ZM6 16.75C6 16.3358 6.33579 16 6.75 16H17.25C17.6642 16 18 16.3358 18 16.75C18 17.1642 17.6642 17.5 17.25 17.5H6.75C6.33579 17.5 6 17.1642 6 16.75ZM10 19.75C10 19.3358 10.3358 19 10.75 19H13.25C13.6642 19 14 19.3358 14 19.75C14 20.1642 13.6642 20.5 13.25 20.5H10.75C10.3358 20.5 10 20.1642 10 19.75ZM4.96978 4.96967C5.26268 4.67678 5.73755 4.67678 6.03044 4.96967L7.0911 6.03033C7.384 6.32322 7.384 6.7981 7.0911 7.09099C6.79821 7.38388 6.32334 7.38388 6.03044 7.09099L4.96978 6.03033C4.67689 5.73744 4.67689 5.26256 4.96978 4.96967Z" fill="currentColor"/>
    </svg>`,
    fallback: '\uEE53',  // weather_sunny_low_24 (日の入り)
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

// QMKのキーコードエイリアス（別名）マッピング
// レイアウトファイルによって使われるキーコードが異なるための対策
SVG_ICONS['KC_BRIGHTNESS_UP'] = SVG_ICONS['KC_KB_BRIGHTNESS_UP'];
SVG_ICONS['KC_BRIU'] = SVG_ICONS['KC_KB_BRIGHTNESS_UP'];

SVG_ICONS['KC_BRIGHTNESS_DOWN'] = SVG_ICONS['KC_KB_BRIGHTNESS_DOWN'];
SVG_ICONS['KC_BRID'] = SVG_ICONS['KC_KB_BRIGHTNESS_DOWN'];