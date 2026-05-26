// js/keymap-dictionary.js

const MODIFIER_LABEL_ALIASES = {
  SHIFT: 'SHFT',
  SHFT: 'SHFT',
  CTRL: 'CTRL',
  CTL: 'CTRL',
  ALT: 'ALT',
  OPT: 'ALT',
  GUI: 'GUI',
  WIN: 'GUI',
  CMD: 'GUI',
  MEH: 'MEH',
  HYPR: 'HYPR',
  HPR: 'HYPR'
};

export const MODIFIER_LABELS = {
  CTRL: {
    default: { Windows: 'CTRL', Mac: 'CTRL' },
    short3: { Windows: 'CTL', Mac: 'CTL' },
    short4: { Windows: 'CTRL', Mac: 'CTRL' },
    symbol: '⌃'
  },
  SHFT: {
    default: { Windows: 'SHFT', Mac: 'SHFT' },
    short3: { Windows: 'SFT', Mac: 'SFT' },
    short4: { Windows: 'SHFT', Mac: 'SHFT' },
    symbol: '⇧'
  },
  ALT: {
    default: { Windows: 'ALT', Mac: 'OPT' },
    short3: { Windows: 'ALT', Mac: 'OPT' },
    short4: { Windows: 'ALT', Mac: 'OPT' },
    symbol: '⌥'
  },
  GUI: {
    default: { Windows: 'WIN', Mac: 'CMD' },
    short3: { Windows: 'WIN', Mac: 'CMD' },
    short4: { Windows: 'WIN', Mac: 'CMD' },
    symbol: '⌘'
  },
  MEH: {
    default: { Windows: 'MEH', Mac: 'MEH' },
    short3: { Windows: 'MEH', Mac: 'MEH' },
    short4: { Windows: 'MEH', Mac: 'MEH' }
  },
  HYPR: {
    default: { Windows: 'HYPR', Mac: 'HYPR' },
    short3: { Windows: 'HPR', Mac: 'HPR' },
    short4: { Windows: 'HYPR', Mac: 'HYPR' }
  }
};

export function normalizeModifierLabel(label) {
  if (!label) return '';
  const normalized = String(label).trim().toUpperCase();
  return MODIFIER_LABEL_ALIASES[normalized] || normalized;
}

export function getModifierLabel(label, {
  keyStyle = 'Windows',
  variant = 'default',
  preferSymbol = false
} = {}) {
  const normalized = normalizeModifierLabel(label);
  const entry = MODIFIER_LABELS[normalized];
  if (!entry) return normalized;

  if (preferSymbol && entry.symbol) {
    return entry.symbol;
  }

  const styleKey = keyStyle === 'Mac' ? 'Mac' : 'Windows';
  const variantEntry = entry[variant] || entry.default;
  return variantEntry[styleKey] || variantEntry.Windows || normalized;
}

export function abbreviateModifierCombo(label, options = {}) {
  if (!label) return '';
  return String(label)
    .split('+')
    .map((token) => getModifierLabel(token, options))
    .join('+');
}

function normalizeKeycodeToken(code) {
  return String(code || '').trim().toUpperCase();
}

// Microsoft Fluent System Icons (Open Source WebFont) に基づくマッピング
export const KeymapDictionary = {
  modifiers: {
    // 修飾キー
    "KC_LSFT": { win: "\uF4BF", mac: "\uF4BF", isFluent: true,  text: "Shift", macText: "Shift" },
    "KC_RSFT": { win: "\uF4BF", mac: "\uF4BF", isFluent: true,  text: "Shift", macText: "Shift" },
    "KC_LCTL": { win: "Ctrl",   mac: "\uF2B7", isFluent: "auto", text: "Ctrl",  macText: "Ctrl" },
    "KC_RCTL": { win: "Ctrl",   mac: "\uF2B7", isFluent: "auto", text: "Ctrl",  macText: "Ctrl" },
    "KC_LALT": { win: "Alt",    mac: "\u2325", isFluent: false, text: "Alt",   macText: "Opt" },
    "KC_RALT": { win: "Alt",    mac: "\u2325", isFluent: false, text: "Alt",   macText: "Opt" },
    "KC_LGUI": { win: "WIN",    mac: "\uE744", isFluent: "auto", text: "Win",   macText: "Cmd" },
    "KC_RGUI": { win: "WIN",    mac: "\uE744", isFluent: "auto", text: "Win",   macText: "Cmd" }, 
    "KC_APP":  { win: "MENU",   mac: "\uF4EE", isFluent: "auto", text: "MENU",  macText: "Opt" }, 
    "KC_FN":   { win: "Fn",     mac: "\uF3F6", isFluent: "auto", text: "Fn",    macText: "Fn" },
    "JP_EISU": { win: "\uF4C0", mac: "英数",   isFluent: "auto", text: "Caps",  macText: "英数" },
    "KC_JP_EISU": { win: "\uF4C0", mac: "英数",   isFluent: "auto", text: "Caps",  macText: "英数" }
  },
  keys: {
    // 特殊キー (アイコン優先)
    "KC_ENT":  { text: "ENTER", fluent: "\uE0C1" }, // arrow_enter_left
    "KC_PENT": { text: "\u23CE", fluent: "\uE0C1" }, 
    "KC_BSPC": { text: "BACK",  fluent: "\uF1B2" },
    "KC_TAB":  { text: "TAB",   fluent: "\uF4C1" }, // keyboard_tab
    "KC_CAPS": { text: "CAPS",  fluent: "\uF4C0" }, // keyboard_shift_uppercase
    "KC_ESC":  { text: "Esc" },                     
    "KC_SPC":  { text: "Space",  fluent: "\uF6F8" }, // keyboard_spacebar
    "DEBUG":   { text: "DBG",    fluent: "\uE207" }, // SVG test: debug icon

    // システム・電源
    "KC_KB_POWER":     { text: "PWR",  fluent: "\uF60F" }, // power_24
    "KC_SYSTEM_POWER": { text: "PWR",  fluent: "\uF60F" },
    "KC_SYSTEM_SLEEP": { text: "SLEP", fluent: "\uF1DA" }, // bed_24 (Sleep)
    "KC_SYSTEM_WAKE":  { text: "WAKE", fluent: "\uE5F3" }, // eye_24 (WakeUp)

    // 編集・一般
    "KC_HELP":   { text: "HELP", fluent: "\uF63E" }, // question_circle_24
    "KC_UNDO":   { text: "UNDO", fluent: "\uF19A" }, // arrow_undo_24
    "KC_CUT":    { text: "CUT",  fluent: "\uF33B" }, // cut_24
    "KC_COPY":   { text: "COPY", fluent: "\uF32C" }, // copy_24
    "KC_PASTE":  { text: "PSTE", fluent: "\uF2D6" }, // clipboard_paste_24
    "KC_FIND":   { text: "FIND", fluent: "\uF690" }, // search_24
    "KC_AGAIN":  { text: "AGIN", fluent: "\uF16F" }, // arrow_redo_24
    "KC_SELECT": { text: "SEL",  fluent: "\uF77F" }, // tap_single (指)
    "KC_MENU":   { text: "MENU", fluent: "\uF4EE" }, // list (リストメニュー)
    "KC_STOP":   { text: "STOP", fluent: "\uF36E" }, // dismiss_circle_24 (丸に✖)

    // オーディオ (スピーカーアイコンで統一)
    "KC_KB_MUTE":       { text: "MUTE", fluent: "\uEB4B" }, // speaker_mute_24 (✖)
    "KC_AUDIO_MUTE":    { text: "MUTE", fluent: "\uEB4B" },
    "KC_KB_VOLUME_UP":  { text: "VOL+", fluent: "\uEB43" }, // speaker_2_24
    "KC_AUDIO_VOL_UP":  { text: "VOL+", fluent: "\uEB43" },
    "KC_KB_VOLUME_DOWN":{ text: "VOL-", fluent: "\uF6FB" }, // speaker_1_24
    "KC_AUDIO_VOL_DOWN":{ text: "VOL-", fluent: "\uF6FB" },

    // メディア操作
    "KC_MEDIA_PLAY_PAUSE": { text: "PLAY", fluent: "\uF857" }, // video_play_pause_24 (▶‖)
    "KC_MEDIA_STOP":       { text: "STOP", fluent: "\uF72B" }, // stop_24 (四角)
    "KC_MEDIA_NEXT_TRACK": { text: "NEXT", fluent: "\uF56A" }, // next_24
    "KC_MEDIA_PREV_TRACK": { text: "PREV", fluent: "\uF629" }, // previous_24
    "KC_MEDIA_FAST_FORWARD": { text: "FWD",  fluent: "\uF3FF" }, // fast_forward_24
    "KC_MEDIA_REWIND":     { text: "RWD",  fluent: "\uF675" }, // rewind_24
    "KC_MEDIA_EJECT":      { text: "EJECT", fluent: "\uE0BE" }, // arrow_eject_20
    "KC_MEDIA_SELECT":     { text: "SELECT", fluent: "\uF55A" }, // movies_and_tv_24

    // WWW 操作
    "KC_WWW_SEARCH":    { text: "SRCH", fluent: "\uF690" }, // search_24
    "KC_WWW_HOME":      { text: "HOME", fluent: "\uF481" }, // home_24
    "KC_WWW_BACK":      { text: "BACK", fluent: "\uF2AB" }, // chevron_left_24
    "KC_WWW_FORWARD":   { text: "FWD",  fluent: "\uF2B1" }, // chevron_right_24
    "KC_WWW_STOP":      { text: "STOP", fluent: "\uF36A" }, // dismiss (✖)
    "KC_WWW_REFRESH":   { text: "RLOD", fluent: "\uF191" }, // arrow_sync_24
    "KC_WWW_FAVORITES": { text: "FAV",  fluent: "\uF710" }, // star_24

    // OS 固有・アプリケーション
    "KC_MAIL":          { text: "MAIL", fluent: "\uF507" }, // mail_24
    "KC_CALCULATOR":    { text: "CALC", fluent: "\uE233" }, // calculator_24
    "KC_MY_COMPUTER":   { text: "PC",   fluent: "\uF35A" }, // desktop_24
    "KC_BRIGHTNESS_UP": { text: "BRT+", fluent: "\uE1F8" }, // brightness_high_24
    "KC_BRIGHTNESS_DOWN":{ text: "BRT-", fluent: "\uEE53" }, // weather_sunny_low_24 (日の入り)
    "KC_CONTROL_PANEL": { text: "SET",  fluent: "\uF6AA" }, // settings_24
    "KC_ASSISTANT":     { text: "ASST", fluent: "\uE7FA" }, // mic_24
    "KC_MISSION_CONTROL":{ text: "MISS", fluent: "\uF463" }, // grid_24
    "KC_LAUNCHPAD":     { text: "LNCH", fluent: "\uF134" }, // apps_24

    // 矢印キー
    "KC_UP":   { text: "\u2191", fluent: "\uF19B" },
    "KC_DOWN": { text: "\u2193", fluent: "\uF148" },
    "KC_LEFT": { text: "\u2190", fluent: "\uF15B" },
    "KC_RGHT": { text: "\u2192", fluent: "\uF181" },

    // テキスト表示キー (アイコンなし)
    "KC_PSCR": { text: "PSCR" },
    "KC_SLCK": { text: "SLCK" },
    "KC_PAUS": { text: "PAUS" },
    "KC_INS":  { text: "INS" },
    "KC_HOME": { text: "HOME" },
    "KC_PGUP": { text: "PGUP" },
    "KC_DEL":  { text: "DEL" },
    "KC_END":  { text: "END" },
    "KC_PGDN": { text: "PGDN" },

    // QMK Japanese Layout Keycodes (quantum/keymap_extras/keymap_japanese.h)
    "JP_ZKHK": { text: "E/J", fluent: "\uF45B" },
    "JP_1":    { text: "1" },
    "JP_2":    { text: "2" },
    "JP_3":    { text: "3" },
    "JP_4":    { text: "4" },
    "JP_5":    { text: "5" },
    "JP_6":    { text: "6" },
    "JP_7":    { text: "7" },
    "JP_8":    { text: "8" },
    "JP_9":    { text: "9" },
    "JP_0":    { text: "0" },
    "JP_MINS": { text: "-" },
    "JP_CIRC": { text: "^" },
    "JP_YEN":  { text: "￥" },
    "JP_AT":   { text: "@" },
    "JP_LBRC": { text: "[" },
    "JP_EISU": { text: "英数" },
    "JP_SCLN": { text: ";" },
    "JP_COLN": { text: ":" },
    "JP_RBRC": { text: "]" },
    "JP_BSLS": { text: "\\" },
    "JP_MHEN": { text: "無変換", fluent: "\uE114" },
    "JP_HENK": { text: "変換", fluent: "\uF191" },
    "JP_KANA": { text: "KANA", fluent: "\uE986" },
    "JP_EXLM": { text: "!" },
    "JP_DQUO": { text: "\"" },
    "JP_HASH": { text: "#" },
    "JP_DLR":  { text: "$" },
    "JP_PERC": { text: "%" },
    "JP_AMPR": { text: "&" },
    "JP_QUOT": { text: "'" },
    "JP_LPRN": { text: "(" },
    "JP_RPRN": { text: ")" },
    "JP_EQL":  { text: "=" },
    "JP_TILD": { text: "~" },
    "JP_PIPE": { text: "|" },
    "JP_GRV":  { text: "`" },
    "JP_LCBR": { text: "{" },
    "JP_PLUS": { text: "+" },
    "JP_ASTR": { text: "*" },
    "JP_RCBR": { text: "}" },
    "JP_LABK": { text: "<" },
    "JP_RABK": { text: ">" },
    "JP_QUES": { text: "?" },
    "JP_UNDS": { text: "_" },

    "KC_JP_ZKHK": { text: "E/J", fluent: "\uF45B" },
    "KC_JP_1":    { text: "1" },
    "KC_JP_2":    { text: "2" },
    "KC_JP_3":    { text: "3" },
    "KC_JP_4":    { text: "4" },
    "KC_JP_5":    { text: "5" },
    "KC_JP_6":    { text: "6" },
    "KC_JP_7":    { text: "7" },
    "KC_JP_8":    { text: "8" },
    "KC_JP_9":    { text: "9" },
    "KC_JP_0":    { text: "0" },
    "KC_JP_MINS": { text: "-" },
    "KC_JP_CIRC": { text: "^" },
    "KC_JP_YEN":  { text: "￥" },
    "KC_JP_AT":   { text: "@" },
    "KC_JP_LBRC": { text: "[" },
    "KC_JP_EISU": { text: "英数" },
    "KC_JP_SCLN": { text: ";" },
    "KC_JP_COLN": { text: ":" },
    "KC_JP_RBRC": { text: "]" },
    "KC_JP_BSLS": { text: "\\" },
    "KC_JP_MHEN": { text: "無変換", fluent: "\uE114" },
    "KC_JP_HENK": { text: "変換", fluent: "\uF191" },
    "KC_JP_KANA": { text: "KANA", fluent: "\uE986" },
    "KC_JP_EXLM": { text: "!" },
    "KC_JP_DQUO": { text: "\"" },
    "KC_JP_HASH": { text: "#" },
    "KC_JP_DLR":  { text: "$" },
    "KC_JP_PERC": { text: "%" },
    "KC_JP_AMPR": { text: "&" },
    "KC_JP_QUOT": { text: "'" },
    "KC_JP_LPRN": { text: "(" },
    "KC_JP_RPRN": { text: ")" },
    "KC_JP_EQL":  { text: "=" },
    "KC_JP_TILD": { text: "~" },
    "KC_JP_PIPE": { text: "|" },
    "KC_JP_GRV":  { text: "`" },
    "KC_JP_LCBR": { text: "{" },
    "KC_JP_PLUS": { text: "+" },
    "KC_JP_ASTR": { text: "*" },
    "KC_JP_RCBR": { text: "}" },
    "KC_JP_LABK": { text: "<" },
    "KC_JP_RABK": { text: ">" },
    "KC_JP_QUES": { text: "?" },
    "KC_JP_UNDS": { text: "_" },

    // VIA / Raw Japanese Layout keycodes support
    "KC_ZKHK": { text: "E/J", fluent: "\uF45B" },
    "KC_RO":   { text: "\\" },
    "KC_INT1": { text: "\\" },
    "KC_JYEN": { text: "￥" },
    "KC_INT3": { text: "￥" },
    "KC_MHEN": { text: "無変換", fluent: "\uE114" },
    "KC_INT5": { text: "無変換", fluent: "\uE114" },
    "KC_HENK": { text: "変換", fluent: "\uF191" },
    "KC_INT4": { text: "変換", fluent: "\uF191" },
    "KC_KANA": { text: "KANA", fluent: "\uE986" },
    "KC_INT2": { text: "KANA", fluent: "\uE986" },

    // RGB Backlight Controls
    "KC_RGB_TOG": { text: "TOG", fluent: "\uF2F6" }, // color_24_regular
    "KC_RGB_MOD": { text: "MODE+", fluent: "\uF2F6" }, // color_24_regular
    "KC_RGB_RMOD": { text: "MODE-", fluent: "\uF2F6" }, // color_24_regular
    "KC_RGB_HUI": { text: "HUE+", fluent: "\uF2F6" }, // color_24_regular
    "KC_RGB_HUD": { text: "HUE-", fluent: "\uF2F6" }, // color_24_regular
    "KC_RGB_SAI": { text: "SAT+", fluent: "\uF2F6" }, // color_24_regular
    "KC_RGB_SAD": { text: "SAT-", fluent: "\uF2F6" }, // color_24_regular
    "KC_RGB_VAI": { text: "BRT+", fluent: "\uF2F6" }, // color_24_regular
    "KC_RGB_VAD": { text: "BRT-", fluent: "\uF2F6" }, // color_24_regular
    "KC_RGB_SPI": { text: "SPD+", fluent: "\uF2F6" }, // color_24_regular
    "KC_RGB_SPD": { text: "SPD-", fluent: "\uF2F6" }, // color_24_regular

    // Bluetooth & Wireless
    "KC_OUT_AUTO": { text: "AUTO", fluent: "\uF6AA" },
    "KC_OUT_USB": { text: "USB", fluent: "\uF0BA1" },
    "KC_OUT_BT": { text: "BT", fluent: "\uF1DF" },
    "KC_OUT_2G4": { text: "2.4G", fluent: "\uF6AA" },
    "KC_BT_SEL_0": { text: "BT 1", fluent: "\uF1DF" },
    "KC_BT_SEL_1": { text: "BT 2", fluent: "\uF1DF" },
    "KC_BT_SEL_2": { text: "BT 3", fluent: "\uF1DF" },
    "KC_BT_SEL_3": { text: "BT 4", fluent: "\uF1DF" },
    "KC_BT_SEL_4": { text: "BT 5", fluent: "\uF1DF" },
    "KC_BT_CLR": { text: "CLR", fluent: "\uF1E1" },
    "KC_BT_CLR_ALL": { text: "CLR A", fluent: "\uF1E1" },
    "KC_BT_TOGG": { text: "B-TOG", fluent: "\uF1E1" },
    "KC_BT_NXT": { text: "BT >", fluent: "\uF1DF" },
    "KC_BT_PRV": { text: "BT <", fluent: "\uF1DF" },
    "KC_BT_ON": { text: "BT ON", fluent: "\uF1DF" },
    "KC_BT_OFF": { text: "BT OFF", fluent: "\uF1DF" },

    // Mouse Keys
    "KC_MS_U": { text: "MS UP", fluent: "\uF19C" }, // arrow_circle_up_24_regular
    "KC_MS_D": { text: "MS DN", fluent: "\uF149" }, // arrow_circle_down_24_regular
    "KC_MS_L": { text: "MS LT", fluent: "\uF15C" }, // arrow_circle_left_24_regular
    "KC_MS_R": { text: "MS RT", fluent: "\uF182" }, // arrow_circle_right_24_regular
    "KC_BTN1": { text: "LCLK", fluent: "\uE446" }, // cursor_click_24_regular
    "KC_BTN2": { text: "RCLK", fluent: "\uE449" }, // cursor_click_24_regular
    "KC_BTN3": { text: "MCLK", fluent: "\uE444" }, // cursor_click_24_regular
    "KC_BTN4": { text: "BTN4", fluent: "\uE446" }, // cursor_click_24_regular
    "KC_BTN5": { text: "BTN5", fluent: "\uE446" }, // cursor_click_24_regular
    "KC_WH_U": { text: "WHL U", fluent: "\uF2CA" }, // chevron_double_up_24_regular
    "KC_WH_D": { text: "WHL D", fluent: "\uF2C7" }, // chevron_double_down_24_regular
    "KC_WH_L": { text: "WHL L", fluent: "\uF2C8" }, // chevron_double_left_24_regular
    "KC_WH_R": { text: "WHL R", fluent: "\uF2C9" }, // chevron_double_right_24_regular
    "KC_ACL0": { text: "ACL0", fluent: "\uF445" }, // gauge_24_regular
    "KC_ACL1": { text: "ACL1", fluent: "\uF445" }, // gauge_24_regular
    "KC_ACL2": { text: "ACL2", fluent: "\uF445" }, // gauge_24_regular

    // Bootloader & Utility
    "KC_RESET": { text: "BOOT", fluent: "\uF8C1" }, // rocket_24
    "KC_QK_BOOT": { text: "BOOT", fluent: "\uF8C1" }, // rocket_24
    "KC_EE_CLR": { text: "EE CLR", fluent: "\uF34D" }, // eraser_24
    "QK_CLEAR_EEPROM": { text: "EE CLR", fluent: "\uF34D" }, // eraser_24
    "KC_DEBUG": { text: "DEBUG", fluent: "\uE207" },

    // Advanced Logic & Macros
    "KC_AST_TOG": { text: "A-SFT", fluent: "\uF4C0" },
    "KC_DM_REC1": { text: "REC 1", fluent: "\uF662" },
    "KC_DM_REC2": { text: "REC 2", fluent: "\uF662" },
    "KC_DM_PLY1": { text: "PLAY 1", fluent: "\uF606" },
    "KC_DM_PLY2": { text: "PLAY 2", fluent: "\uF606" },
    "KC_DM_RSTP": { text: "STOP", fluent: "\uF75B" },

    // QMK Magic Keys (ハードウェアレベルのキー配置・機能入れ替え)
    "MAGIC_TOGGLE_CONTROL_CAPS_LOCK": { text: "CTL / CPS", fluent: "\uF18E" }, // arrow_swap_24
    "MAGIC_TOGGLE_ESCAPE_CAPS_LOCK":  { text: "ESC / CPS", fluent: "\uF18E" }, // arrow_swap_24
    "MAGIC_TOGGLE_CTL_GUI":           { text: "CTL / WIN", macText: "CTL / CMD", fluent: "\uF18E" }, // arrow_swap_24
    "MAGIC_TOGGLE_ALT_GUI":           { text: "ALT / WIN", macText: "ALT / CMD", fluent: "\uF18E" }, // arrow_swap_24
    "MAGIC_TOGGLE_BACKSLASH_BACKSPACE":{ text: "\\ / BS",    fluent: "\uF18E" }, // arrow_swap_24
    "MAGIC_TOGGLE_GRAVE_ESC":         { text: "GRV / ESC",  fluent: "\uF18E" }, // arrow_swap_24
    "MAGIC_TOGGLE_GUI":               { text: "W-LCK",   macText: "C-LCK",   fluent: "\uE788" }, // lock_closed_24
    "MAGIC_TOGGLE_NKRO":              { text: "NKRO",      fluent: "\uE6C6" }, // keyboard_24

    "ic_fluent_arrow_swap_24_regular": { text: "SWAP", fluent: "\uF18E" }, // arrow_swap_24_regular
    "ic_fluent_lock_closed_24_regular": { text: "LOCK", fluent: "\uE788" }, // lock_closed_24_regular
    "ic_fluent_keyboard_24_regular": { text: "KEYB", fluent: "\uE6C6" }, // keyboard_24_regular

    // 透過キー
    "KC_NO": { text: "NO" },
    "KC_NONE": { text: "NO" },
    "KC_TRNS": { text: "▽", fluent: "\u{F02F9}" } // triangle_down_24_regular
  }
};

const modifierAliasPairs = [
  ['KC_LEFT_CTRL', 'KC_LCTL'],
  ['KC_RIGHT_CTRL', 'KC_RCTL'],
  ['KC_LEFT_SHIFT', 'KC_LSFT'],
  ['KC_RIGHT_SHIFT', 'KC_RSFT'],
  ['KC_LEFT_ALT', 'KC_LALT'],
  ['KC_RIGHT_ALT', 'KC_RALT'],
  ['KC_LEFT_GUI', 'KC_LGUI'],
  ['KC_RIGHT_GUI', 'KC_RGUI'],
  ['KC_LCMD', 'KC_LGUI'],
  ['KC_RCMD', 'KC_RGUI'],
  ['KC_LWIN', 'KC_LGUI'],
  ['KC_RWIN', 'KC_RGUI'],
  ['KC_LOPT', 'KC_LALT'],
  ['KC_ROPT', 'KC_RALT'],
  ['KC_ALGR', 'KC_RALT']
];

// QMKのショートキーコード（エイリアス）を正規のキーコードからプログラムで複製
const aliasPairs = [
  // QMK basic-keycode official names <-> existing canonical entries
  ['KC_CAPS_LOCK',                     'KC_CAPS'],
  ['KC_SCROLL_LOCK',                   'KC_SLCK'],
  ['KC_SCRL',                          'KC_SLCK'],
  ['KC_BRMD',                          'KC_SLCK'],
  ['KC_PRINT_SCREEN',                  'KC_PSCR'],
  ['KC_PAUSE',                         'KC_PAUS'],
  ['KC_BRK',                           'KC_PAUS'],
  ['KC_BRMU',                          'KC_PAUS'],
  ['KC_INSERT',                        'KC_INS'],
  ['KC_PAGE_UP',                       'KC_PGUP'],
  ['KC_DELETE',                        'KC_DEL'],
  ['KC_PAGE_DOWN',                     'KC_PGDN'],
  ['KC_RIGHT',                         'KC_RGHT'],
  ['KC_APPLICATION',                   'KC_APP'],
  ['KC_EXECUTE',                       'KC_EXEC'],
  ['KC_MENU',                          'KC_MENU'],
  ['KC_SELECT',                        'KC_SELECT'],
  ['KC_SLCT',                          'KC_SELECT'],
  ['KC_AGIN',                          'KC_AGAIN'],
  ['KC_PSTE',                          'KC_PASTE'],
  ['KC_ALTERNATE_ERASE',               'KC_ERAS'],
  ['KC_SYSTEM_REQUEST',                'KC_SYRQ'],
  ['KC_CANCEL',                        'KC_CNCL'],
  ['KC_CLEAR',                         'KC_CLR'],
  ['KC_PRIOR',                         'KC_PRIR'],
  ['KC_RETURN',                        'KC_RETN'],
  ['KC_SEPARATOR',                     'KC_SEPR'],
  ['KC_CLEAR_AGAIN',                   'KC_CLAG'],
  ['KC_CRSL',                          'KC_CRSEL'],
  ['KC_EXSL',                          'KC_EXSEL'],
  ['KC_NUM_LOCK',                      'KC_NUM'],
  ['KC_KP_SLASH',                      'KC_PSLS'],
  ['KC_KP_ASTERISK',                   'KC_PAST'],
  ['KC_KP_MINUS',                      'KC_PMNS'],
  ['KC_KP_PLUS',                       'KC_PPLS'],
  ['KC_KP_ENTER',                      'KC_PENT'],
  ['KC_KP_0',                          'KC_P0'],
  ['KC_KP_1',                          'KC_P1'],
  ['KC_KP_2',                          'KC_P2'],
  ['KC_KP_3',                          'KC_P3'],
  ['KC_KP_4',                          'KC_P4'],
  ['KC_KP_5',                          'KC_P5'],
  ['KC_KP_6',                          'KC_P6'],
  ['KC_KP_7',                          'KC_P7'],
  ['KC_KP_8',                          'KC_P8'],
  ['KC_KP_9',                          'KC_P9'],

  // Transparent / No-op aliases
  ['KC_TRANSPARENT',                   'KC_TRNS'],
  ['_______',                          'KC_TRNS'],
  ['XXXXXXX',                          'KC_NO'],

  ['KC_MUTE', 'KC_AUDIO_MUTE'],
  ['KC_VOLU', 'KC_AUDIO_VOL_UP'],
  ['KC_VOLD', 'KC_AUDIO_VOL_DOWN'],
  ['KC_MNXT', 'KC_MEDIA_NEXT_TRACK'],
  ['KC_MPRV', 'KC_MEDIA_PREV_TRACK'],
  ['KC_MSTP', 'KC_MEDIA_STOP'],
  ['KC_MPLY', 'KC_MEDIA_PLAY_PAUSE'],
  ['KC_MSEL', 'KC_MEDIA_SELECT'],
  ['KC_EJCT', 'KC_MEDIA_EJECT'],
  ['KC_MFFD', 'KC_MEDIA_FAST_FORWARD'],
  ['KC_MRWD', 'KC_MEDIA_REWIND'],
  ['KC_MYCM', 'KC_MY_COMPUTER'],
  ['KC_WSCH', 'KC_WWW_SEARCH'],
  ['KC_WHOM', 'KC_WWW_HOME'],
  ['KC_WBAK', 'KC_WWW_BACK'],
  ['KC_WFWD', 'KC_WWW_FORWARD'],
  ['KC_WSTP', 'KC_WWW_STOP'],
  ['KC_WREF', 'KC_WWW_REFRESH'],
  ['KC_WFAV', 'KC_WWW_FAVORITES'],
  ['KC_PWR',  'KC_SYSTEM_POWER'],
  ['KC_SLEP', 'KC_SYSTEM_SLEEP'],
  ['KC_WAKE', 'KC_SYSTEM_WAKE'],
  ['KC_BRIU', 'KC_KB_BRIGHTNESS_UP'],
  ['KC_BRID', 'KC_KB_BRIGHTNESS_DOWN'],
  ['KC_CPNL', 'KC_CONTROL_PANEL'],
  ['KC_ASST', 'KC_ASSISTANT'],
  ['KC_MCTL', 'KC_MISSION_CONTROL'],
  ['KC_LPAD', 'KC_LAUNCHPAD'],
  ['KC_MAGIC_TOGGLE_CONTROL_CAPS_LOCK', 'MAGIC_TOGGLE_CONTROL_CAPS_LOCK'],
  ['KC_MAGIC_TOGGLE_ESCAPE_CAPS_LOCK',  'MAGIC_TOGGLE_ESCAPE_CAPS_LOCK'],
  ['KC_MAGIC_TOGGLE_CTL_GUI',           'MAGIC_TOGGLE_CTL_GUI'],
  ['KC_MAGIC_TOGGLE_ALT_GUI',           'MAGIC_TOGGLE_ALT_GUI'],
  ['KC_MAGIC_TOGGLE_BACKSLASH_BACKSPACE','MAGIC_TOGGLE_BACKSLASH_BACKSPACE'],
  ['KC_MAGIC_TOGGLE_GRAVE_ESC',         'MAGIC_TOGGLE_GRAVE_ESC'],
  ['KC_MAGIC_TOGGLE_GUI',               'MAGIC_TOGGLE_GUI'],
  ['KC_MAGIC_TOGGLE_NKRO',              'MAGIC_TOGGLE_NKRO'],
  ['CG_TOGG',                           'MAGIC_TOGGLE_CTL_GUI'],
  ['KC_CG_TOGG',                        'MAGIC_TOGGLE_CTL_GUI'],
  ['AG_TOGG',                           'MAGIC_TOGGLE_ALT_GUI'],
  ['KC_AG_TOGG',                        'MAGIC_TOGGLE_ALT_GUI'],

  // Quantum keycodes
  ['QK_BOOTLOADER',                     'KC_RESET'],
  ['QK_BOOT',                           'KC_RESET'],
  ['QK_CLEAR_EEPROM',                   'KC_EE_CLR'],
  ['EE_CLR',                            'KC_EE_CLR'],
  ['QK_DEBUG_TOGGLE',                   'KC_DEBUG'],
  ['DB_TOGG',                           'KC_DEBUG'],

  // Wireless standard aliases mapping
  ['OUT_AUTO',                          'KC_OUT_AUTO'],
  ['OUT_USB',                           'KC_OUT_USB'],
  ['OUT_BT',                            'KC_OUT_BT'],
  ['OUT_2G4',                           'KC_OUT_2G4'],
  ['BT_SEL_0',                          'KC_BT_SEL_0'],
  ['BT_SEL_1',                          'KC_BT_SEL_1'],
  ['BT_SEL_2',                          'KC_BT_SEL_2'],
  ['BT_SEL_3',                          'KC_BT_SEL_3'],
  ['BT_SEL_4',                          'KC_BT_SEL_4'],
  ['BT_CLR',                            'KC_BT_CLR'],
  ['BT_CLR_ALL',                        'KC_BT_CLR_ALL'],
  ['BT_TOGG',                           'KC_BT_TOGG'],
  ['BT_NXT',                            'KC_BT_NXT'],
  ['BT_PRV',                            'KC_BT_PRV'],
  ['BT_ON',                             'KC_BT_ON'],
  ['BT_OFF',                            'KC_BT_OFF'],
  // ZMK style wireless aliases fallback
  ['OUT_TOG',                           'KC_OUT_AUTO'],
  ['OUT_BLE',                           'KC_OUT_BT'],
  ['BT_SEL0',                           'KC_BT_SEL_0'],
  ['BT_SEL1',                           'KC_BT_SEL_1'],
  ['BT_SEL2',                           'KC_BT_SEL_2'],
  ['BT_SEL3',                           'KC_BT_SEL_3'],
  ['BT_SEL4',                           'KC_BT_SEL_4'],

  // Mouse aliases mapping (legacy / project-local)
  ['MS_U',                              'KC_MS_U'],
  ['MS_D',                              'KC_MS_D'],
  ['MS_L',                              'KC_MS_L'],
  ['MS_R',                              'KC_MS_R'],
  ['KC_MS_UP',                          'KC_MS_U'],
  ['KC_MS_DOWN',                        'KC_MS_D'],
  ['KC_MS_LEFT',                        'KC_MS_L'],
  ['KC_MS_RIGHT',                       'KC_MS_R'],
  ['KC_MS_RGHT',                        'KC_MS_R'],
  ['MS_UP',                             'KC_MS_U'],
  ['MS_DN',                             'KC_MS_D'],
  ['MS_LT',                             'KC_MS_L'],
  ['MS_RT',                             'KC_MS_R'],
  ['MOVE_UP',                           'KC_MS_U'],
  ['MOVE_DOWN',                         'KC_MS_D'],
  ['MOVE_LEFT',                         'KC_MS_L'],
  ['MOVE_RIGHT',                        'KC_MS_R'],
  ['BTN1',                              'KC_BTN1'],
  ['BTN2',                              'KC_BTN2'],
  ['BTN3',                              'KC_BTN3'],
  ['BTN4',                              'KC_BTN4'],
  ['BTN5',                              'KC_BTN5'],
  ['WH_U',                              'KC_WH_U'],
  ['WH_D',                              'KC_WH_D'],
  ['WH_L',                              'KC_WH_L'],
  ['WH_R',                              'KC_WH_R'],
  ['WHL_UP',                            'KC_WH_U'],
  ['WHL_DN',                            'KC_WH_D'],
  ['WHL_LT',                            'KC_WH_L'],
  ['WHL_RT',                            'KC_WH_R'],
  ['SCROLL_UP',                         'KC_WH_U'],
  ['SCROLL_DOWN',                       'KC_WH_D'],
  ['SCROLL_LEFT',                       'KC_WH_L'],
  ['SCROLL_RIGHT',                      'KC_WH_R'],
  ['ACL0',                              'KC_ACL0'],
  ['ACL1',                              'KC_ACL1'],
  ['ACL2',                              'KC_ACL2'],

  // Mouse aliases mapping (QMK official aliases)
  ['MS_DOWN',                           'KC_MS_D'],
  ['MS_LEFT',                           'KC_MS_L'],
  ['MS_RGHT',                           'KC_MS_R'],
  ['MS_BTN1',                           'KC_BTN1'],
  ['MS_BTN2',                           'KC_BTN2'],
  ['MS_BTN3',                           'KC_BTN3'],
  ['MS_BTN4',                           'KC_BTN4'],
  ['MS_BTN5',                           'KC_BTN5'],
  ['KC_MS_BTN1',                        'KC_BTN1'],
  ['KC_MS_BTN2',                        'KC_BTN2'],
  ['KC_MS_BTN3',                        'KC_BTN3'],
  ['KC_MS_BTN4',                        'KC_BTN4'],
  ['KC_MS_BTN5',                        'KC_BTN5'],
  ['MS_WHLU',                           'KC_WH_U'],
  ['MS_WHLD',                           'KC_WH_D'],
  ['MS_WHLL',                           'KC_WH_L'],
  ['MS_WHLR',                           'KC_WH_R'],
  ['KC_MS_WHLU',                        'KC_WH_U'],
  ['KC_MS_WHLD',                        'KC_WH_D'],
  ['KC_MS_WHLL',                        'KC_WH_L'],
  ['KC_MS_WHLR',                        'KC_WH_R'],
  ['MS_ACL0',                           'KC_ACL0'],
  ['MS_ACL1',                           'KC_ACL1'],
  ['MS_ACL2',                           'KC_ACL2'],
  ['KC_MS_ACL0',                        'KC_ACL0'],
  ['KC_MS_ACL1',                        'KC_ACL1'],
  ['KC_MS_ACL2',                        'KC_ACL2'],

  // Mouse formal keycode names from QMK docs
  ['QK_MOUSE_CURSOR_UP',                'KC_MS_U'],
  ['QK_MOUSE_CURSOR_DOWN',              'KC_MS_D'],
  ['QK_MOUSE_CURSOR_LEFT',              'KC_MS_L'],
  ['QK_MOUSE_CURSOR_RIGHT',             'KC_MS_R'],
  ['QK_MOUSE_BUTTON_1',                 'KC_BTN1'],
  ['QK_MOUSE_BUTTON_2',                 'KC_BTN2'],
  ['QK_MOUSE_BUTTON_3',                 'KC_BTN3'],
  ['QK_MOUSE_BUTTON_4',                 'KC_BTN4'],
  ['QK_MOUSE_BUTTON_5',                 'KC_BTN5'],
  ['QK_MOUSE_WHEEL_UP',                 'KC_WH_U'],
  ['QK_MOUSE_WHEEL_DOWN',               'KC_WH_D'],
  ['QK_MOUSE_WHEEL_LEFT',               'KC_WH_L'],
  ['QK_MOUSE_WHEEL_RIGHT',              'KC_WH_R'],
  ['QK_MOUSE_ACCELERATION_0',           'KC_ACL0'],
  ['QK_MOUSE_ACCELERATION_1',           'KC_ACL1'],
  ['QK_MOUSE_ACCELERATION_2',           'KC_ACL2']
];

function registerAliases(target, pairs) {
  pairs.forEach(([aliasKey, canonicalKey]) => {
    if (target[canonicalKey]) {
      target[aliasKey] = target[canonicalKey];
    }
  });
}

registerAliases(KeymapDictionary.keys, aliasPairs);
registerAliases(KeymapDictionary.modifiers, modifierAliasPairs);

const keyAliasLookup = new Map();
aliasPairs.forEach(([aliasKey, canonicalKey]) => {
  keyAliasLookup.set(normalizeKeycodeToken(aliasKey), canonicalKey);
});

const modifierAliasLookup = new Map();
modifierAliasPairs.forEach(([aliasKey, canonicalKey]) => {
  modifierAliasLookup.set(normalizeKeycodeToken(aliasKey), canonicalKey);
});

const keyTokenAbbreviations = {
  AUDIO: 'AUD',
  APPLICATION: 'APP',
  ASSISTANT: 'ASST',
  BACK: 'BACK',
  BACKLIGHT: 'BKL',
  BOOTLOADER: 'BOOT',
  BRIGHTNESS: 'BRT',
  BUTTON: 'BTN',
  CAPS: 'CAPS',
  CLEAR: 'CLR',
  COMPUTER: 'PC',
  CONTROL: 'CTRL',
  COPY: 'COPY',
  CURSOR: 'MS',
  DEBUG: 'DBG',
  DELETE: 'DEL',
  DOWN: 'DOWN',
  EEPROM: 'EE',
  EJECT: 'EJCT',
  ESCAPE: 'ESC',
  FAVORITES: 'FAV',
  FORWARD: 'FWD',
  GUI: 'GUI',
  HOME: 'HOME',
  HUE: 'HUE',
  INSERT: 'INS',
  KEYBOARD: 'KB',
  LANGUAGE: 'LNG',
  LAUNCHPAD: 'LNCH',
  LEFT: 'LEFT',
  MACRO: 'MAC',
  MEDIA: 'MED',
  MISSION: 'MISS',
  MODE: 'MODE',
  MOUSE: 'MS',
  NEXT: 'NEXT',
  NO: 'NO',
  PAGE: 'PG',
  PASTE: 'PSTE',
  PAUSE: 'PAUS',
  PLAY: 'PLAY',
  POINTING: 'POINT',
  POWER: 'PWR',
  PREVIOUS: 'PREV',
  PRINT: 'PSCR',
  PROGRAMMABLE: 'PB',
  REBOOT: 'RBT',
  RECORD: 'REC',
  REDO: 'REDO',
  REFRESH: 'RLOD',
  RESET: 'RST',
  REWIND: 'RWD',
  RIGHT: 'RGHT',
  SCROLL: 'WHL',
  SEARCH: 'SRCH',
  SELECT: 'SEL',
  SHIFT: 'SHFT',
  SLEEP: 'SLEP',
  SPACE: 'SPC',
  SPEED: 'SPD',
  STOP: 'STOP',
  SUPER: 'GUI',
  SYSTEM: 'SYS',
  TAP: 'TAP',
  TOGGLE: 'TOG',
  TRACK: 'TRK',
  TRANSPARENT: 'TRNS',
  UNDERGLOW: 'UG',
  UNDO: 'UNDO',
  UP: 'UP',
  VOLUME: 'VOL',
  WAKE: 'WAKE',
  WHEEL: 'WHL',
  WINDOWS: 'WIN',
  WIRELESS: 'WL'
};

const compactKeySymbols = {
  KC_MINS: '-',
  KC_EQL: '=',
  KC_LBRC: '[',
  KC_RBRC: ']',
  KC_BSLS: '\\',
  KC_NUHS: '#',
  KC_SCLN: ';',
  KC_QUOT: '\'',
  KC_GRV: '`',
  KC_COMM: ',',
  KC_DOT: '.',
  KC_SLSH: '/',
  KC_MINUS: '-',
  KC_EQUAL: '=',
  KC_LEFT_BRACKET: '[',
  KC_RIGHT_BRACKET: ']',
  KC_BACKSLASH: '\\',
  KC_NONUS_HASH: '#',
  KC_SEMICOLON: ';',
  KC_QUOTE: '\'',
  KC_GRAVE: '`',
  KC_COMMA: ',',
  KC_DOT: '.',
  KC_SLASH: '/',
  KC_KP_SLASH: '/',
  KC_KP_ASTERISK: '*',
  KC_KP_MINUS: '-',
  KC_KP_PLUS: '+',
  KC_KP_DOT: '.',
  KC_PSLS: '/',
  KC_PAST: '*',
  KC_PMNS: '-',
  KC_PPLS: '+',
  KC_PDOT: '.'
};

const phraseTextOverrides = {
  EE_CLR: 'EE CLR',
  QK_CLEAR_EEPROM: 'EE CLR',
  CAPS_LOCK: 'CAPS',
  SCROLL_LOCK: 'SLCK',
  NUM_LOCK: 'NUM',
  PRINT_SCREEN: 'PSCR',
  PAGE_UP: 'PGUP',
  PAGE_DOWN: 'PGDN',
  ALTERNATE_ERASE: 'ERAS',
  SYSTEM_REQUEST: 'SYRQ',
  CLEAR_AGAIN: 'CLAG',
  LEFT_CTRL: 'LCTL',
  RIGHT_CTRL: 'RCTL',
  LEFT_SHIFT: 'LSFT',
  RIGHT_SHIFT: 'RSFT',
  LEFT_ALT: 'LALT',
  RIGHT_ALT: 'RALT',
  LEFT_GUI: 'LGUI',
  RIGHT_GUI: 'RGUI',
  MOUSE_CURSOR_UP: 'MS UP',
  MOUSE_CURSOR_DOWN: 'MS DN',
  MOUSE_CURSOR_LEFT: 'MS LT',
  MOUSE_CURSOR_RIGHT: 'MS RT',
  MOUSE_WHEEL_UP: 'WHL U',
  MOUSE_WHEEL_DOWN: 'WHL D',
  MOUSE_WHEEL_LEFT: 'WHL L',
  MOUSE_WHEEL_RIGHT: 'WHL R',
  MOUSE_ACCELERATION_0: 'ACL0',
  MOUSE_ACCELERATION_1: 'ACL1',
  MOUSE_ACCELERATION_2: 'ACL2'
};

function deriveTextFromKeycode(code) {
  const normalized = normalizeKeycodeToken(code);
  if (!normalized) return '';
  if (compactKeySymbols[normalized]) return compactKeySymbols[normalized];

  const raw = normalized.replace(/^KC_/, '').replace(/^QK_/, '');
  if (phraseTextOverrides[raw]) return phraseTextOverrides[raw];
  if (/^[A-Z0-9]$/.test(raw)) return raw;
  if (/^F\d{1,2}$/.test(raw)) return raw;
  if (/^P\d$/.test(raw)) return raw.slice(1);

  const tokens = raw.split('_').filter(Boolean);
  if (tokens.length === 0) return raw;

  const mapped = tokens.map((token) => keyTokenAbbreviations[token] || token);
  const joined = mapped.join(' ').trim();
  if (joined.length <= 10) return joined;

  const compact = mapped.map((token) => token.length > 4 ? token.slice(0, 4) : token).join(' ').trim();
  return compact.length <= 10 ? compact : compact.slice(0, 10);
}

export function resolveModifierKeycode(code) {
  const normalized = normalizeKeycodeToken(code);
  if (!normalized) return '';
  return modifierAliasLookup.get(normalized) || normalized;
}

export function resolveKeycodeAlias(code) {
  const normalized = normalizeKeycodeToken(code);
  if (!normalized) return '';
  return keyAliasLookup.get(normalized) || normalized;
}

export function getModifierDefinition(code) {
  const canonical = resolveModifierKeycode(code);
  return KeymapDictionary.modifiers[canonical] || null;
}

export function getKeyDefinition(code) {
  const canonical = resolveKeycodeAlias(code);
  const explicit = KeymapDictionary.keys[canonical];
  if (explicit) return explicit;
  if (!canonical) return null;
  return { text: deriveTextFromKeycode(canonical) };
}

