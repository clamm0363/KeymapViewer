
export const SAMPLE_100 = {
  "name": "SAMPLE KEYBOARD (100%)",
  "layouts": {
    "keymap": [
      ["0,0", {"x": 1}, "0,1", "0,2", "0,3", "0,4", {"x": 0.5}, "0,5", "0,6", "0,7", "0,8", {"x": 0.5}, "0,9", "0,10", "0,11", "0,12", {"x": 0.25}, "0,16", "0,17", "0,18"],
      ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "1,6", "1,7", "1,8", "1,9", "1,10", "1,11", "1,12", {"w": 2}, "1,13", {"x": 0.25}, "1,16", "1,17", "1,18", {"x": 0.25}, "1,20", "1,21", "1,22", "1,23"],
      [{"w": 1.5}, "2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "2,6", "2,7", "2,8", "2,9", "2,10", "2,11", "2,12", {"w": 1.5}, "2,13", {"x": 0.25}, "2,16", "2,17", "2,18", {"x": 0.25}, "2,20", "2,21", "2,22", {"h": 2}, "2,23"],
      [{"w": 1.75}, "3,0", "3,1", "3,2", "3,3", "3,4", "3,5", "3,6", "3,7", "3,8", "3,9", "3,10", "3,11", {"w": 2.25}, "3,12", {"x": 3.5}, "3,20", "3,21", "3,22"],
      [{"w": 2.25}, "4,0", "4,1", "4,2", "4,3", "4,4", "4,5", "4,6", "4,7", "4,8", "4,9", "4,10", {"w": 2.75}, "4,11", {"x": 1.25}, "4,17", {"x": 1.25}, "4,20", "4,21", "4,22", {"h": 2}, "4,23"],
      [{"w": 1.25}, "5,0", {"w": 1.25}, "5,1", {"w": 1.25}, "5,2", {"w": 6.25}, "5,3", {"w": 1.25}, "5,4", {"w": 1.25}, "5,5", {"w": 1.25}, "5,6", {"w": 1.25}, "5,7", {"x": 0.25}, "5,16", "5,17", "5,18", {"x": 0.25}, {"w": 2}, "5,20", "5,22"]
    ]
  },
  "matrix": { "rows": 6, "cols": 24 },
  "layers": [
    [
      "KC_ESC", "KC_F1", "KC_F2", "KC_F3", "KC_F4", "KC_F5", "KC_F6", "KC_F7", "KC_F8", "KC_F9", "KC_F10", "KC_F11", "KC_F12", null, null, null, "KC_PSCR", "KC_SLCK", "KC_PAUS", null, null, null, null, null,
      "KC_GRV", "KC_1", "KC_2", "KC_3", "KC_4", "KC_5", "KC_6", "KC_7", "KC_8", "KC_9", "KC_0", "KC_MINS", "KC_EQL", "KC_BSPC", null, null, "KC_INS", "KC_HOME", "KC_PGUP", null, "KC_NUM", "KC_PSLS", "KC_PAST", "KC_PMNS",
      "KC_TAB", "KC_Q", "KC_W", "KC_E", "KC_R", "KC_T", "KC_Y", "KC_U", "KC_I", "KC_O", "KC_P", "KC_LBRC", "KC_RBRC", "KC_BSLS", null, null, "KC_DEL", "KC_END", "KC_PGDN", null, "KC_P7", "KC_P8", "KC_P9", "KC_PPLS",
      "KC_CAPS", "KC_A", "KC_S", "KC_D", "KC_F", "KC_G", "KC_H", "KC_J", "KC_K", "KC_L", "KC_SCLN", "KC_QUOT", "KC_ENT", null, null, null, null, null, null, null, "KC_P4", "KC_P5", "KC_P6", null,
      "KC_LSFT", "KC_Z", "KC_X", "KC_C", "KC_V", "KC_B", "KC_N", "KC_M", "KC_COMM", "KC_DOT", "KC_SLSH", "KC_RSFT", null, null, null, null, null, "KC_UP", null, null, "KC_P1", "KC_P2", "KC_P3", "KC_PENT",
      "KC_LCTL", "KC_LGUI", "KC_LALT", "KC_SPC", "KC_RALT", "KC_RGUI", "KC_APP", "KC_RCTL", null, null, null, null, null, null, null, null, "KC_LEFT", "KC_DOWN", "KC_RGHT", null, "KC_P0", null, "KC_PDOT", null
    ]
  ]
};

export const SAMPLE_HHKB = {
  "name": "SAMPLE KEYBOARD (MAC)",
  "layouts": {
    "keymap": [
      ["0,0", "0,1", "0,2", "0,3", "0,4", "0,5", "0,6", "0,7", "0,8", "0,9", "0,10", "0,11", "0,12", "0,13", "0,14"],
      [{"w": 1.5}, "1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "1,6", "1,7", "1,8", "1,9", "1,10", "1,11", "1,12", {"w": 1.5}, "1,13"],
      [{"w": 1.75}, "2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "2,6", "2,7", "2,8", "2,9", "2,10", "2,11", {"w": 2.25}, "2,12"],
      [{"w": 2.25}, "3,0", "3,1", "3,2", "3,3", "3,4", "3,5", "3,6", "3,7", "3,8", "3,9", "3,10", {"w": 1.75}, "3,11", "3,12"],
      [{"x": 1.5}, "4,1", {"w": 1.5}, "4,2", {"w": 6}, "4,3", {"w": 1.5}, "4,4", "4,5", "4,6"]
    ]
  },
  "matrix": { "rows": 5, "cols": 15 },
  "layers": [
    [
      "KC_ESC", "KC_1", "KC_2", "KC_3", "KC_4", "KC_5", "KC_6", "KC_7", "KC_8", "KC_9", "KC_0", "KC_MINS", "KC_EQL", "KC_BSLS", "KC_GRV",
      "KC_TAB", "KC_Q", "KC_W", "KC_E", "KC_R", "KC_T", "KC_Y", "KC_U", "KC_I", "KC_O", "KC_P", "KC_LBRC", "KC_RBRC", "KC_BSPC", null,
      "KC_LCTL", "KC_A", "KC_S", "KC_D", "KC_F", "KC_G", "KC_H", "KC_J", "KC_K", "KC_L", "KC_SCLN", "KC_QUOT", "KC_ENT", null, null,
      "KC_LSFT", "KC_Z", "KC_X", "KC_C", "KC_V", "KC_B", "KC_N", "KC_M", "KC_COMM", "KC_DOT", "KC_SLSH", "KC_RSFT", "MO(1)", null, null,
      null, "KC_LGUI", "KC_LALT", "KC_SPC", "KC_RALT", "KC_RGUI", "MO(1)", null, null, null, null, null, null, null, null
    ],
    [
      "KC_PWR", "KC_F1", "KC_F2", "KC_F3", "KC_F4", "KC_F5", "KC_F6", "KC_F7", "KC_F8", "KC_F9", "KC_F10", "KC_F11", "KC_F12", "KC_INS", "KC_DEL",
      "TRNS", "KC_VOLD", "KC_VOLU", "KC_MUTE", "TRNS", "TRNS", "TRNS", "TRNS", "KC_PSCR", "KC_SLCK", "KC_PAUS", "KC_UP", "TRNS", "TRNS", null,
      "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "KC_PAST", "KC_PSLS", "KC_HOME", "KC_PGUP", "KC_LEFT", "KC_RGHT", "TRNS", null, null,
      "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "KC_PPLS", "KC_PMNS", "KC_END", "KC_PGDN", "KC_DOWN", "TRNS", "TRNS", null, null,
      null, "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", null, null, null, null, null, null, null, null
    ],
    [
      "KC_ESC", "KC_1", "KC_2", "KC_3", "KC_4", "KC_5", "KC_6", "KC_7", "KC_8", "KC_9", "KC_0", "KC_MINS", "KC_EQL", "KC_BSLS", "KC_GRV",
      "KC_TAB", "KC_Q", "KC_W", "KC_E", "KC_R", "KC_T", "KC_Y", "KC_U", "KC_I", "KC_O", "KC_P", "KC_LBRC", "KC_RBRC", "KC_BSPC", null,
      "KC_LCTL", "KC_A", "KC_S", "KC_D", "KC_F", "KC_G", "KC_H", "KC_J", "KC_K", "KC_L", "KC_SCLN", "KC_QUOT", "KC_ENT", null, null,
      "KC_LSFT", "KC_Z", "KC_X", "KC_C", "KC_V", "KC_B", "KC_N", "KC_M", "KC_COMM", "KC_DOT", "KC_SLSH", "KC_RSFT", "MO(3)", null, null,
      null, "KC_LALT", "KC_LGUI", "KC_SPC", "KC_RGUI", "KC_RALT", "MO(3)", null, null, null, null, null, null, null, null
    ],
    [
      "KC_PWR", "KC_F1", "KC_F2", "KC_F3", "KC_F4", "KC_F5", "KC_F6", "KC_F7", "KC_F8", "KC_F9", "KC_F10", "KC_F11", "KC_F12", "KC_INS", "KC_DEL",
      "TRNS", "KC_VOLD", "KC_VOLU", "KC_MUTE", "TRNS", "TRNS", "TRNS", "TRNS", "KC_PSCR", "KC_SLCK", "KC_PAUS", "KC_UP", "TRNS", "TRNS", null,
      "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "KC_PAST", "KC_PSLS", "KC_HOME", "KC_PGUP", "KC_LEFT", "KC_RGHT", "TRNS", null, null,
      "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "KC_PPLS", "KC_PMNS", "KC_END", "KC_PGDN", "KC_DOWN", "TRNS", "TRNS", null, null,
      null, "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", null, null, null, null, null, null, null, null
    ]
  ],
  "macroAliases": {}
};

export const SAMPLE_NUMPAD = {
  "name": "SAMPLE NUMPAD",
  "layouts": {
    "keymap": [
      ["0,0", "0,1", "0,2", "0,3"],
      ["1,0", "1,1", "1,2", "1,3"],
      ["2,0", "2,1", "2,2", "2,3"],
      ["3,0", "3,1", "3,2", "3,3"]
    ]
  },
  "matrix": { "rows": 4, "cols": 4 },
  "layers": [
    [
      "KC_P7", "KC_P8", "KC_P9", "KC_PSLS",
      "KC_P4", "KC_P5", "KC_P6", "KC_PAST",
      "KC_P1", "KC_P2", "KC_P3", "KC_PMNS",
      "KC_P0", "KC_PDOT", "KC_PENT", "KC_PPLS"
    ],
    ["MACRO(0)", "MACRO(1)", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS"],
    ["TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS"],
    ["TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS"],
    ["TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS"],
    ["TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS"],
    ["TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS"],
    ["TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS", "TRNS"]
  ],
  "macros": [
    "Hello! This is a sample macro.",
    "LSFT(KC_C)"
  ],
  "macroAliases": { "0": "GREET", "1": "COPY" }
};

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
    'BSPC': '\uE750', 'DEL': '\uE74D',
    'ENT': '\uE751', 'ENTER': '\uE751', 'RETURN': '\uE751',
    'SHIFT': '\uE752', 'LSFT': '\uE752', 'RSFT': '\uE752',
    'UP': '\uE70E', 'DOWN': '\uE70D', 'LEFT': '\uE76B', 'RGHT': '\uE76C',
    'MUTE': '\uE74F', 'VOLD': '\uE993', 'VOLU': '\uE994',
    'PLAY': '\uE768', 'PAUS': '\uE769', 'HOME': '\uE80F', 'TAB': '\uE7A6',
    'ALT': '\uE765', 'LALT': '\uE765', 'RALT': '\uE765',
    'CTRL': '\uE764', 'LCTL': '\uE764', 'RCTL': '\uE764'
};

export const STORAGE_KEY = 'keymapViewer_state';
