
// Sample data objects are now loaded from external JSON files in SampleLayouts/
export const SAMPLE_100 = null;
export const SAMPLE_HHKB = null;
export const SAMPLE_NUMPAD = null;

export const KC_DICT = {
    0x00: 'KC_NO', 0x04: 'KC_A', 0x05: 'KC_B', 0x06: 'KC_C', 0x07: 'KC_D', 0x08: 'KC_E', 0x09: 'KC_F', 0x0A: 'KC_G', 0x0B: 'KC_H', 0x0C: 'KC_I', 0x0D: 'KC_J', 0x0E: 'KC_K', 0x0F: 'KC_L', 0x10: 'KC_M', 0x11: 'KC_N', 0x12: 'KC_O', 0x13: 'KC_P', 0x14: 'KC_Q', 0x15: 'KC_R', 0x16: 'KC_S', 0x17: 'KC_T', 0x18: 'KC_U', 0x19: 'KC_V', 0x1A: 'KC_W', 0x1B: 'KC_X', 0x1C: 'KC_Y', 0x1D: 'KC_Z',
    0x1E: 'KC_1', 0x1F: 'KC_2', 0x20: 'KC_3', 0x21: 'KC_4', 0x22: 'KC_5', 0x23: 'KC_6', 0x24: 'KC_7', 0x25: 'KC_8', 0x26: 'KC_9', 0x27: 'KC_0',
    0x28: 'KC_ENT', 0x29: 'KC_ESC', 0x2A: 'KC_BSPC', 0x2B: 'KC_TAB', 0x2C: 'KC_SPC', 0x2D: 'KC_MINS', 0x2E: 'KC_EQL', 0x2F: 'KC_LBRC', 0x30: 'KC_RBRC', 0x31: 'KC_BSLS', 0x33: 'KC_SCLN', 0x34: 'KC_QUOT', 0x35: 'KC_GRV', 0x36: 'KC_COMM', 0x37: 'KC_DOT', 0x38: 'KC_SLSH', 0x39: 'KC_CAPS',
    0x3A: 'KC_F1', 0x3B: 'KC_F2', 0x3C: 'KC_F3', 0x3D: 'KC_F4', 0x3E: 'KC_F5', 0x3F: 'KC_F6', 0x40: 'KC_F7', 0x41: 'KC_F8', 0x42: 'KC_F9', 0x43: 'KC_F10', 0x44: 'KC_F11', 0x45: 'KC_F12',
    0x46: 'KC_PSCR', 0x47: 'KC_SLCK', 0x48: 'KC_PAUS', 0x49: 'KC_INS', 0x4A: 'KC_HOME', 0x4B: 'KC_PGUP', 0x4C: 'KC_DEL', 0x4D: 'KC_END', 0x4E: 'KC_PGDN', 0x4F: 'KC_RGHT', 0x50: 'KC_LEFT', 0x51: 'KC_DOWN', 0x52: 'KC_UP',
    0x53: 'KC_NUM', 0x54: 'KC_PSLS', 0x55: 'KC_PAST', 0x56: 'KC_PMNS', 0x57: 'KC_PPLS', 0x58: 'KC_PENT', 0x59: 'KC_P1', 0x5A: 'KC_P2', 0x5B: 'KC_P3', 0x5C: 'KC_P4', 0x5D: 'KC_P5', 0x5E: 'KC_P6', 0x5F: 'KC_P7', 0x60: 'KC_P8', 0x61: 'KC_P9', 0x62: 'KC_P0', 0x63: 'KC_PDOT',
    0xE0: 'KC_LCTL', 0xE1: 'KC_LSFT', 0xE2: 'KC_LALT', 0xE3: 'KC_LGUI', 0xE4: 'KC_RCTL', 0xE5: 'KC_RSFT', 0xE6: 'KC_RALT', 0xE7: 'KC_RGUI',
    0xFFFF: 'KC_TRNS', 0x5200: 'MO(0)', 0x5201: 'MO(1)', 0x5202: 'MO(2)', 0x5203: 'MO(3)'
};

export const SYMBOL_MAP = {
    'MINS': '-', 'EQL': '=', 'LBRC': '[', 'RBRC': ']', 'BSLS': '\\',
    'SCLN': ';', 'QUOT': "'", 'GRV': '`', 'COMM': ',', 'DOT': '.', 'SLSH': '/',
    'PSLS': '/', 'PAST': '*', 'PMNS': '-', 'PPLS': '+', 'PDOT': '.'
};

export const FLUENT_MAP = {
    'WIN': '\uE782', 'GUI': '\uE782', 'LGUI': '\uE782', 'RGUI': '\uE782',
    'BSPC': '\uE750',
    'ENT': '\uE751', 'ENTER': '\uE751', 'RETURN': '\uE751',
    'SHIFT': '\uE752', 'LSFT': '\uE752', 'RSFT': '\uE752',
    'UP': '\uE70E', 'DOWN': '\uE70D', 'LEFT': '\uE76B', 'RGHT': '\uE76C',
    'MUTE': '\uE74F', 'VOLD': '\uE993', 'VOLU': '\uE994',
    'PLAY': '\uE768', 'PAUS': '\uE769', 'HOME': '\uE80F', 'TAB': '\uE7A6',
    'ALT': '\uE765', 'LALT': '\uE765', 'RALT': '\uE765',
    'CTRL': '\uE764', 'LCTL': '\uE764', 'RCTL': '\uE764'
};

export const STORAGE_KEY = 'keymapViewer_state';
export const LOCAL_DEVICE_DEFINITION_STORAGE_KEY = 'keymapViewer_localDeviceDefinitions';

// Fluent System Icons font family stack (for SVG migration compatibility)
export const FLUENT_FONT_STACK = {
  primary: '"FluentSystemIcons-Regular", "Segoe Fluent Icons", "Outfit", sans-serif',
  jpKana: '"Segoe Fluent Icons", "FluentSystemIcons-Regular", sans-serif',  // JP_KANA special handling
  fallback: '"Outfit", "Arial", "Helvetica", sans-serif'
};
