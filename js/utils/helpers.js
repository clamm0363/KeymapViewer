
import { KC_DICT, STORAGE_KEY } from '../constants.js';

const MOUSE_KEYCODES = {
    0x00CD: 'KC_MS_U',
    0x00CE: 'KC_MS_D',
    0x00CF: 'KC_MS_L',
    0x00D0: 'KC_MS_R',
    0x00D1: 'KC_BTN1',
    0x00D2: 'KC_BTN2',
    0x00D3: 'KC_BTN3',
    0x00D4: 'KC_BTN4',
    0x00D5: 'KC_BTN5',
    0x00D6: 'KC_BTN6',
    0x00D7: 'KC_BTN7',
    0x00D8: 'KC_BTN8',
    0x00D9: 'KC_WH_U',
    0x00DA: 'KC_WH_D',
    0x00DB: 'KC_WH_L',
    0x00DC: 'KC_WH_R',
    0x00DD: 'KC_ACL0',
    0x00DE: 'KC_ACL1',
    0x00DF: 'KC_ACL2'
};

const SUPPLEMENTAL_BASIC_KEYCODES = {
    0x0064: 'KC_NUHS',
    0x0065: 'KC_APP',
    0x0066: 'KC_KB_POWER',
    0x0068: 'KC_F13',
    0x0069: 'KC_F14',
    0x006A: 'KC_F15',
    0x006B: 'KC_F16',
    0x006C: 'KC_F17',
    0x006D: 'KC_F18',
    0x006E: 'KC_F19',
    0x006F: 'KC_F20',
    0x0070: 'KC_F21',
    0x0071: 'KC_F22',
    0x0072: 'KC_F23',
    0x0073: 'KC_F24',
    0x0074: 'KC_EXECUTE',
    0x0075: 'KC_HELP',
    0x0076: 'KC_MENU',
    0x0077: 'KC_SELECT',
    0x0078: 'KC_STOP',
    0x0079: 'KC_AGAIN',
    0x007A: 'KC_UNDO',
    0x007B: 'KC_CUT',
    0x007C: 'KC_COPY',
    0x007D: 'KC_PASTE',
    0x007E: 'KC_FIND',
    0x007F: 'KC_KB_MUTE',
    0x0080: 'KC_KB_VOLUME_UP',
    0x0081: 'KC_KB_VOLUME_DOWN',
    0x0087: 'KC_INT1',
    0x0088: 'KC_INT2',
    0x0089: 'KC_INT3',
    0x008A: 'KC_INT4',
    0x008B: 'KC_INT5',
    0x008C: 'KC_INT6',
    0x008D: 'KC_INT7',
    0x008E: 'KC_INT8',
    0x008F: 'KC_INT9',
    0x0090: 'KC_LNG1',
    0x0091: 'KC_LNG2',
    0x0092: 'KC_LNG3',
    0x0093: 'KC_LNG4',
    0x0094: 'KC_LNG5',
    0x0095: 'KC_LNG6',
    0x0096: 'KC_LNG7',
    0x0097: 'KC_LNG8',
    0x0098: 'KC_LNG9',
    0x00A5: 'KC_SYSTEM_POWER',
    0x00A6: 'KC_SYSTEM_SLEEP',
    0x00A7: 'KC_SYSTEM_WAKE',
    0x00A8: 'KC_AUDIO_MUTE',
    0x00A9: 'KC_AUDIO_VOL_UP',
    0x00AA: 'KC_AUDIO_VOL_DOWN',
    0x00AB: 'KC_MEDIA_NEXT_TRACK',
    0x00AC: 'KC_MEDIA_PREV_TRACK',
    0x00AD: 'KC_MEDIA_STOP',
    0x00AE: 'KC_MEDIA_PLAY_PAUSE',
    0x00AF: 'KC_MEDIA_SELECT',
    0x00B0: 'KC_MEDIA_EJECT',
    0x00B1: 'KC_MAIL',
    0x00B2: 'KC_CALC',
    0x00B3: 'KC_MYCM',
    0x00B4: 'KC_WWW_SEARCH',
    0x00B5: 'KC_WWW_HOME',
    0x00B6: 'KC_WWW_BACK',
    0x00B7: 'KC_WWW_FORWARD',
    0x00B8: 'KC_WWW_STOP',
    0x00B9: 'KC_WWW_REFRESH',
    0x00BA: 'KC_WWW_FAVORITES',
    0x00BB: 'KC_MEDIA_FAST_FORWARD',
    0x00BC: 'KC_MEDIA_REWIND',
    0x00BD: 'KC_BRIGHTNESS_UP',
    0x00BE: 'KC_BRIGHTNESS_DOWN',
    0x00BF: 'KC_CONTROL_PANEL',
    0x00C0: 'KC_ASSISTANT',
    0x00C1: 'KC_MISSION_CONTROL',
    0x00C2: 'KC_LAUNCHPAD'
};

const QUANTUM_KEYCODES = {
    0x7C00: 'QK_BOOTLOADER',
    0x7C01: 'QK_REBOOT',
    0x7C02: 'QK_DEBUG_TOGGLE',
    0x7C03: 'QK_CLEAR_EEPROM',
    0x7C1D: 'QK_REPEAT_KEY',
    0x7C1E: 'QK_ALT_REPEAT_KEY',
    0x7C1F: 'QK_LAYER_LOCK'
};

const MAGIC_KEYCODES = {
    0x7002: 'MAGIC_TOGGLE_CONTROL_CAPS_LOCK',
    0x7016: 'MAGIC_TOGGLE_ALT_GUI',
    0x701B: 'MAGIC_TOGGLE_CTL_GUI',
    0x700B: 'MAGIC_TOGGLE_GUI',
    0x7010: 'MAGIC_TOGGLE_BACKSLASH_BACKSPACE',
    0x700C: 'MAGIC_SWAP_GRAVE_ESC',
    0x700D: 'MAGIC_UNSWAP_GRAVE_ESC',
    0x7022: 'MAGIC_TOGGLE_ESCAPE_CAPS_LOCK',
    0x7013: 'MAGIC_TOGGLE_NKRO'
};

const CONNECTION_KEYCODES = {
    0x7780: 'OUT_AUTO',
    0x7781: 'OUT_NEXT',
    0x7782: 'OUT_PREV',
    0x7783: 'OUT_NONE',
    0x7784: 'OUT_USB',
    0x7785: 'OUT_2G4',
    0x7786: 'OUT_BT',
    0x7787: 'BT_NXT',
    0x7788: 'BT_PRV',
    0x7789: 'BT_CLR',
    0x778A: 'BT_SEL_0',
    0x778B: 'BT_SEL_1',
    0x778C: 'BT_SEL_2',
    0x778D: 'BT_SEL_3',
    0x778E: 'BT_SEL_4',
    0x778F: 'BT_SEL_5'
};

const LIGHTING_KEYCODES = {
    0x7800: 'BL_ON',
    0x7801: 'BL_OFF',
    0x7802: 'BL_TOGG',
    0x7803: 'BL_DOWN',
    0x7804: 'BL_UP',
    0x7805: 'BL_STEP',
    0x7806: 'BL_BRTG',
    0x7810: 'LM_ON',
    0x7811: 'LM_OFF',
    0x7812: 'LM_TOGG',
    0x7813: 'LM_NEXT',
    0x7814: 'LM_PREV',
    0x7815: 'LM_BRIU',
    0x7816: 'LM_BRID',
    0x7817: 'LM_SPDU',
    0x7818: 'LM_SPDD',
    0x7819: 'LM_FLGN',
    0x781A: 'LM_FLGP',
    0x7820: 'RGB_TOG',
    0x7821: 'RGB_MOD',
    0x7822: 'RGB_RMOD',
    0x7823: 'RGB_HUI',
    0x7824: 'RGB_HUD',
    0x7825: 'RGB_SAI',
    0x7826: 'RGB_SAD',
    0x7827: 'RGB_VAI',
    0x7828: 'RGB_VAD',
    0x7829: 'RGB_SPI',
    0x782A: 'RGB_SPD',
    0x782B: 'RGB_M_P',
    0x782C: 'RGB_M_B',
    0x782D: 'RGB_M_R',
    0x782E: 'RGB_M_SW',
    0x782F: 'RGB_M_SN',
    0x7830: 'RGB_M_K',
    0x7831: 'RGB_M_X',
    0x7832: 'RGB_M_G',
    0x7833: 'RGB_M_T',
    0x7834: 'RGB_M_TW',
    0x7840: 'RM_ON',
    0x7841: 'RM_OFF',
    0x7842: 'RM_TOGG',
    0x7843: 'RM_NEXT',
    0x7844: 'RM_PREV',
    0x7845: 'RM_HUEU',
    0x7846: 'RM_HUED',
    0x7847: 'RM_SATU',
    0x7848: 'RM_SATD',
    0x7849: 'RM_VALU',
    0x784A: 'RM_VALD',
    0x784B: 'RM_SPDU',
    0x784C: 'RM_SPDD',
    0x784D: 'RM_FLGN',
    0x784E: 'RM_FLGP'
};

const DYNAMIC_MACRO_KEYCODES = {
    0x7C3D: 'DM_REC1',
    0x7C3E: 'DM_REC2',
    0x7C3F: 'DM_RSTP',
    0x7C40: 'DM_PLY1',
    0x7C41: 'DM_PLY2'
};

const MOD_MASKS = [
    { bit: 0x01, left: 'LCTL', right: 'RCTL' },
    { bit: 0x02, left: 'LSFT', right: 'RSFT' },
    { bit: 0x04, left: 'LALT', right: 'RALT' },
    { bit: 0x08, left: 'LGUI', right: 'RGUI' }
];

const formatHexKeycode = (value) => `0x${value.toString(16).toUpperCase()}`;

const getBasicKeycodeLabel = (value) => {
    if (value <= 0x00FF) {
        return KC_DICT[value] || SUPPLEMENTAL_BASIC_KEYCODES[value] || MOUSE_KEYCODES[value] || null;
    }
    return null;
};

function wrapKeycodeWithModifiers(baseKey, modifiers) {
    return modifiers.reduceRight((current, modifier) => `${modifier}(${current})`, baseKey);
}

function decodeModifierMask(mask) {
    const useRightSide = (mask & 0x10) !== 0;
    return MOD_MASKS
        .filter((entry) => (mask & entry.bit) !== 0)
        .map((entry) => useRightSide ? entry.right : entry.left);
}

function decodeQmkQuantumKeycode(value) {
    if (QUANTUM_KEYCODES[value]) return QUANTUM_KEYCODES[value];
    if (MAGIC_KEYCODES[value]) return MAGIC_KEYCODES[value];
    if (CONNECTION_KEYCODES[value]) return CONNECTION_KEYCODES[value];
    if (LIGHTING_KEYCODES[value]) return LIGHTING_KEYCODES[value];
    if (DYNAMIC_MACRO_KEYCODES[value]) return DYNAMIC_MACRO_KEYCODES[value];

    if (value >= 0x5200 && value <= 0x521F) return `TO(${value - 0x5200})`;
    if (value >= 0x5220 && value <= 0x523F) return `MO(${value - 0x5220})`;
    if (value >= 0x5240 && value <= 0x525F) return `DF(${value - 0x5240})`;
    if (value >= 0x5260 && value <= 0x527F) return `TG(${value - 0x5260})`;
    if (value >= 0x5280 && value <= 0x529F) return `OSL(${value - 0x5280})`;
    if (value >= 0x52C0 && value <= 0x52DF) return `TT(${value - 0x52C0})`;
    if (value >= 0x52E0 && value <= 0x52FF) return `PDF(${value - 0x52E0})`;
    if (value >= 0x7700 && value <= 0x777F) return `MACRO(${value - 0x7700})`;
    if (value >= 0x7E00 && value <= 0x7E3F) return `CUSTOM(${value - 0x7E00})`;

    return null;
}

export const getRawLabel = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v.trim();
    if (v === 0x0001 || v === 0xFFFF) return 'KC_TRNS';

    const basic = getBasicKeycodeLabel(v);
    if (basic) return basic;

    if (v >= 0x0100 && v <= 0x1FFF) {
        const baseKey = getRawLabel(v & 0xFF);
        const mods = decodeModifierMask((v >> 8) & 0x1F);
        if (baseKey && mods.length > 0) {
            return wrapKeycodeWithModifiers(baseKey, mods);
        }
    }

    if (v >= 0x2000 && v <= 0x3FFF) {
        const baseKey = getRawLabel(v & 0xFF);
        const mods = decodeModifierMask((v >> 8) & 0x1F);
        if (baseKey && mods.length === 1) {
            return `MT(MOD_${mods[0]},${baseKey})`;
        }
        if (baseKey && mods.length > 1) {
            return `MT(MOD_${mods.join('|')},${baseKey})`;
        }
        return `MT(${getRawLabel(v & 0xFF)})`;
    }

    if (v >= 0x4000 && v <= 0x4FFF) {
        return `LT(${(v >> 8) & 0xF},${getRawLabel(v & 0xFF)})`;
    }

    if (v >= 0x5000 && v <= 0x51FF) {
        const layer = (v >> 5) & 0xF;
        const mods = decodeModifierMask(v & 0x1F);
        if (mods.length > 0) {
            return `LM(${layer},MOD_${mods.join('|')})`;
        }
    }

    const quantum = decodeQmkQuantumKeycode(v);
    if (quantum) return quantum;

    if (KC_DICT[v]) return KC_DICT[v];

    return formatHexKeycode(v);
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


