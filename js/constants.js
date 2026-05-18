
// Sample data objects are now loaded from external JSON files in SampleLayouts/
export const SAMPLE_100 = null;
export const SAMPLE_HHKB = null;
export const SAMPLE_NUMPAD = null;

export const KC_DICT = {
    0x00: 'None', 0x04: 'A', 0x05: 'B', 0x06: 'C', 0x07: 'D', 0x08: 'E', 0x09: 'F', 0x0A: 'G', 0x0B: 'H', 0x0C: 'I', 0x0D: 'J', 0x0E: 'K', 0x0F: 'L', 0x10: 'M', 0x11: 'N', 0x12: 'O', 0x13: 'P', 0x14: 'Q', 0x15: 'R', 0x16: 'S', 0x17: 'T', 0x18: 'U', 0x19: 'V', 0x1A: 'W', 0x1B: 'X', 0x1C: 'Y', 0x1D: 'Z',
    0x1E: '1', 0x1F: '2', 0x20: '3', 0x21: '4', 0x22: '5', 0x23: '6', 0x24: '7', 0x25: '8', 0x26: '9', 0x27: '0',
    0x28: 'ENT', 0x29: 'ESC', 0x2A: 'BSPC', 0x2B: 'TAB', 0x2C: 'SPC', 0x2D: 'MINS', 0x2E: 'EQL', 0x2F: 'LBRC', 0x30: 'RBRC', 0x31: 'BSLS', 0x33: 'SCLN', 0x34: 'QUOT', 0x35: 'GRV', 0x36: 'COMM', 0x37: 'DOT', 0x38: 'SLSH', 0x39: 'CAPS',
    0x3A: 'F1', 0x3B: 'F2', 0x3C: 'F3', 0x3D: 'F4', 0x3E: 'F5', 0x3F: 'F6', 0x40: 'F7', 0x41: 'F8', 0x42: 'F9', 0x43: 'F10', 0x44: 'F11', 0x45: 'F12',
    0x46: 'PSCR', 0x47: 'SLCK', 0x48: 'PAUS', 0x49: 'INS', 0x4A: 'HOME', 0x4B: 'PGUP', 0x4C: 'DEL', 0x4D: 'END', 0x4E: 'PGDN', 0x4F: 'RGHT', 0x50: 'LEFT', 0x51: 'DOWN', 0x52: 'UP',
    0x53: 'NLCK', 0x54: 'PSLS', 0x55: 'PAST', 0x56: 'PMNS', 0x57: 'PPLS', 0x58: 'PENT', 0x59: 'P1', 0x5A: 'P2', 0x5B: 'P3', 0x5C: 'P4', 0x5D: 'P5', 0x5E: 'P6', 0x5F: 'P7', 0x60: 'P8', 0x61: 'P9', 0x62: 'P0', 0x63: 'PDOT',
    0xE0: 'CTRL', 0xE1: 'SHIFT', 0xE2: 'ALT', 0xE3: 'GUI', 0xE4: 'CTRL', 0xE5: 'SHIFT', 0xE6: 'ALT', 0xE7: 'GUI',
    0xFFFF: 'TRNS', 0x5200: 'MO0', 0x5201: 'MO1', 0x5202: 'MO2', 0x5203: 'MO3'
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

// Fluent System Icons font family stack (for SVG migration compatibility)
export const FLUENT_FONT_STACK = {
  primary: '"FluentSystemIcons-Regular", "Segoe Fluent Icons", "Outfit", sans-serif',
  jpKana: '"Segoe Fluent Icons", "FluentSystemIcons-Regular", sans-serif',  // JP_KANA special handling
  fallback: '"Outfit", sans-serif'
};
