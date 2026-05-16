// js/keymap-dictionary.js

// グローバル定数として辞書を定義
// Microsoft Fluent System Icons (Open Source WebFont) に基づくマッピング
window.KeymapDictionary = {
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
    "KC_APP":  { win: "\uF124", mac: "Menu",   isFluent: true,  text: "Menu" }, 
    "KC_FN":   { win: "Fn",     mac: "\uF3F6", isFluent: "auto", text: "Fn" }
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
    "KC_PGDN": { text: "PGDN" }
  }
};
