
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

