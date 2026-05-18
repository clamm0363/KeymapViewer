// js/keymap-dictionary.js

// Microsoft Fluent System Icons (Open Source WebFont) に基づくマッピング
export const KeymapDictionary = {
  modifiers: {
    // 修飾キー
    "KC_LSFT": { win: "\uF4BF", mac: "\uF4BF", isFluent: true,  text: "Shift" },
    "KC_RSFT": { win: "\uF4BF", mac: "\uF4BF", isFluent: true,  text: "Shift" },
    "KC_LCTL": { win: "Ctrl",   mac: "\uF2B7", isFluent: "auto", text: "Ctrl" },
    "KC_RCTL": { win: "Ctrl",   mac: "\uF2B7", isFluent: "auto", text: "Ctrl" },
    "KC_LALT": { win: "Alt",    mac: "\u2325", isFluent: false, text: "Alt" },
    "KC_RALT": { win: "Alt",    mac: "\u2325", isFluent: false, text: "Alt" },
    "KC_LGUI": { win: "WIN",    mac: "\uE744", isFluent: "auto", text: "Win" },
    "KC_RGUI": { win: "WIN",    mac: "\uE744", isFluent: "auto", text: "Win" }, 
    "KC_APP":  { win: "MENU", mac: "\uF4EE", isFluent: "auto", text: "MENU" }, 
    "KC_FN":   { win: "Fn",     mac: "\uF3F6", isFluent: "auto", text: "Fn" },
    "JP_EISU": { win: "\uF4C0", mac: "英数",   isFluent: "auto", text: "Caps" },
    "KC_JP_EISU": { win: "\uF4C0", mac: "英数",   isFluent: "auto", text: "Caps" }
  },
  keys: {
    // 特殊キー (アイコン優先)
    "KC_ENT":  { text: "\u23CE", fluent: "\uE0C1" }, // arrow_enter_left
    "KC_PENT": { text: "\u23CE", fluent: "\uE0C1" }, 
    "KC_BSPC": { text: "Back",   fluent: "\uF1B2" },
    "KC_TAB":  { text: "\u21E5", fluent: "\uF4C1" }, // keyboard_tab
    "KC_CAPS": { text: "\u21EA", fluent: "\uF4C0" }, // keyboard_shift_uppercase
    "KC_ESC":  { text: "Esc" },                     
    "KC_SPC":  { text: "Space",  fluent: "\uF6F8" }, // keyboard_spacebar

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
    "KC_MEDIA_FAST_FORWARD": { text: "FF",   fluent: "\uF3FF" }, // fast_forward_24
    "KC_MEDIA_REWIND":     { text: "RW",   fluent: "\uF675" }, // rewind_24
    "KC_MEDIA_EJECT":      { text: "EJCT", fluent: "\uE0BE" }, // arrow_eject_20
    "KC_MEDIA_SELECT":     { text: "MEDA", fluent: "\uE852" }, // music_note_1_24

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
    "KC_RGB_TOG": { text: "RGB_TG", fluent: "\uF4D7" },
    "KC_RGB_MOD": { text: "RGB_MOD", fluent: "\uEB34" },
    "KC_RGB_RMOD": { text: "RGB_RMD", fluent: "\uF191" },
    "KC_RGB_HUI": { text: "HUE+", fluent: "\uF2F6" },
    "KC_RGB_HUD": { text: "HUE-", fluent: "\uF2F6" },
    "KC_RGB_SAI": { text: "SAT+", fluent: "\uF596" },
    "KC_RGB_SAD": { text: "SAT-", fluent: "\uF596" },
    "KC_RGB_VAI": { text: "BRT+", fluent: "\uE1F8" },
    "KC_RGB_VAD": { text: "BRT-", fluent: "\uE1FE" },
    "KC_RGB_SPI": { text: "SPD+", fluent: "\uF827" },
    "KC_RGB_SPD": { text: "SPD-", fluent: "\uF827" },

    // Bluetooth & Wireless
    "KC_OUT_AUTO": { text: "OUT_AUTO", fluent: "\uF6AA" },
    "KC_OUT_USB": { text: "OUT_USB", fluent: "\uF0BA1" },
    "KC_OUT_BT": { text: "OUT_BT", fluent: "\uF1DF" },
    "KC_BT_SEL_0": { text: "BT 1", fluent: "\uF1DF" },
    "KC_BT_SEL_1": { text: "BT 2", fluent: "\uF1DF" },
    "KC_BT_SEL_2": { text: "BT 3", fluent: "\uF1DF" },
    "KC_BT_CLR": { text: "BT_CLR", fluent: "\uF1E1" },

    // Mouse Keys
    "KC_MS_U": { text: "MS_UP", fluent: "\uF19C" },
    "KC_MS_D": { text: "MS_DN", fluent: "\uF149" },
    "KC_MS_L": { text: "MS_LT", fluent: "\uF15C" },
    "KC_MS_R": { text: "MS_RT", fluent: "\uF182" },
    "KC_BTN1": { text: "LCLK", fluent: "\uE446" },
    "KC_BTN2": { text: "RCLK", fluent: "\uE449" },
    "KC_BTN3": { text: "MCLK", fluent: "\uE444" },
    "KC_WH_U": { text: "WHL_UP", fluent: "\uF5F9" },
    "KC_WH_D": { text: "WHL_DN", fluent: "\uF5F9" },

    // Bootloader & Utility
    "KC_RESET": { text: "BOOT", fluent: "\uF8C1" },
    "KC_QK_BOOT": { text: "BOOT", fluent: "\uF8C1" },
    "KC_EE_CLR": { text: "EE_CLR", fluent: "\uF34D" },
    "KC_DEBUG": { text: "DEBUG", fluent: "\uE207" },

    // Advanced Logic & Macros
    "KC_AST_TOG": { text: "A-SFT", fluent: "\uF4C0" },
    "KC_DM_REC1": { text: "REC 1", fluent: "\uF662" },
    "KC_DM_REC2": { text: "REC 2", fluent: "\uF662" },
    "KC_DM_PLY1": { text: "PLAY 1", fluent: "\uF606" },
    "KC_DM_PLY2": { text: "PLAY 2", fluent: "\uF606" },
    "KC_DM_RSTP": { text: "STOP", fluent: "\uF75B" }
  }
};
