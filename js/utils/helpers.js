
import { KC_DICT, STORAGE_KEY } from '../constants.js';

export const getRawLabel = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v.replace('KC_', '');
    if (KC_DICT[v]) return KC_DICT[v];
    if (v >= 0x4000 && v <= 0x4FFF) return `LT${(v >> 8) & 0xF}(L${(v >> 8) & 0xF}, ${getRawLabel(v & 0xFF)})`;
    if (v >= 0x2000 && v <= 0x3FFF) return `MT(${getRawLabel(v & 0xFF)})`;
    return `0x${v.toString(16).toUpperCase()}`;
};

export const loadSavedState = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) { console.warn('Failed to load saved state:', e); }
    return null;
};

export const sanitizeDeviceName = (name) => {
    if (!name) return '';
    // Strip HTML tags
    let sanitized = name.replace(/<[^>]*>?/gm, '');
    // Strip javascript: protocol and onEvent= handlers
    sanitized = sanitized.replace(/javascript\s*:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    // Strip quotes and other potentially dangerous shell/HTML injection characters
    sanitized = sanitized.replace(/[<>'"\\`]/g, '');
    // Limit length to prevent UI layout breakage (Max 32 characters)
    return sanitized.substring(0, 32);
};

export const findSplitX = (design) => {
    if (!design || !design.layouts || !design.layouts.keymap) return null;
    
    const UNIT = 56;
    const keys = [];
    let x = 0, y = 0, w = 1, h = 1;
    design.layouts.keymap.forEach(row => {
        x = 0;
        row.forEach(item => {
            if (typeof item === 'string') {
                keys.push({ x: x * UNIT, w: w * UNIT });
                x += w; w = 1; h = 1;
            } else {
                if (item.x !== undefined) x += item.x;
                if (item.w !== undefined) w = item.w;
            }
        });
        y++;
    });

    if (keys.length === 0) return null;

    const maxWidth = Math.max(...keys.map(k => k.x + k.w), 0);
    const minSplitX = maxWidth * 0.35; // Target center 35% to 65% area
    const maxSplitX = maxWidth * 0.65;

    let gapStart = null;
    const gaps = [];

    // Scan X coordinates to find empty spaces (no keys intersecting)
    for (let sx = Math.floor(minSplitX); sx <= Math.ceil(maxSplitX); sx += 2) {
        const intersecting = keys.some(k => k.x < sx && (k.x + k.w) > sx);
        if (!intersecting) {
            if (gapStart === null) {
                gapStart = sx;
            }
        } else {
            if (gapStart !== null) {
                gaps.push({ start: gapStart, end: sx - 2, width: (sx - 2) - gapStart });
                gapStart = null;
            }
        }
    }
    if (gapStart !== null) {
        gaps.push({ start: gapStart, end: Math.ceil(maxSplitX), width: Math.ceil(maxSplitX) - gapStart });
    }

    if (gaps.length === 0) return null;

    // Select the widest gap
    gaps.sort((a, b) => b.width - a.width);
    const bestGap = gaps[0];

    // Threshold of valid gap width: at least 6px (approx 0.1u)
    if (bestGap.width >= 6) {
        return (bestGap.start + bestGap.end) / 2;
    }

    return null;
};


