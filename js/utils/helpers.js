
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
