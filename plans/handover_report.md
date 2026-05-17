# Session Handover Report: Dynamic Japanese (JIS) Keycode & Shift-modifier Translation Support

This document outlines the architectural implementation for robust, standard-compliant Japanese layout keymap rendering.

---

## 1. Core Architectural Strategy (Revised)

This visualizer's goal is to **reliably and beautifully render keyboard legends based purely on the loaded layout JSON configuration**, regardless of the user's OS or localized environment. 

Rather than hardcoding lookups based on browser slot context, we solved this universally by:
1. **Adding QMK Japanese Aliases to the Dictionary**: Integrated standard `JP_` keycodes (JIS mappings like `JP_CIRC` ➡ `^`, `JP_AT` ➡ `@`) directly into the global keycaps map.
2. **Upgrading Shift-modified Keycode Parsing**: Developed an elegant, dynamic translator for pseudo-JIS simulation keycodes (like `S(KC_MINS)` or `S(KC_1)`) inside `labelParser.js`. It utilizes the JSON's root `"isJIS": true` flag **only** to determine which shifted character mapping to output (JIS mapping gives `=`, US mapping gives `_`).
3. **Correcting the Sample JP JSON**: Fully updated `sample_tkl_jp.json`'s layer arrays to contain authentic QMK Japanese keycodes, creating a true-to-life testing environment.

---

## 2. Updated Project Files

```
c:\Git\KeymappingViewer\
├── index.html
├── index.css
├── SampleLayouts/
│   ├── sample_tkl_jp.json       # UPDATED: Authentically mapped standard QMK/VIA Japanese layout keycodes
│   ├── sample_100_win.json
│   ├── sample_hhkb_mac.json
│   └── sample_numpad.json
├── js/
│   ├── App.js                   # Bumped CURRENT_VERSION to '1.1.3' to instantly clear local database storage
│   ├── constants.js
│   ├── keymap-dictionary.js     # UPDATED: Contains official QMK JP_ and KC_JP_ alias mappings
│   ├── components/
│   │   └── Keyboard.js          # Renders SVG JIS Enter and stagings
│   └── utils/
│       └── labelParser.js       # UPDATED: Dynamic parsing for shifted keycodes (S(KC_X)) and standard JIS codes
```

---

## 3. Detailed Implementations

### A. Dictionary Registration of QMK/VIA Japanese Layout Codes
Added the complete set of JIS keycodes defined in QMK's `quantum/keymap_extras/keymap_japanese.h` directly to `js/keymap-dictionary.js`:
* `JP_ZKHK` (or `KC_JP_ZKHK`) ➡ `半角/全角`
* `JP_MINS` ➡ `-`
* `JP_CIRC` ➡ `^` (Caret)
* `JP_YEN` ➡ `￥` (Yen sign)
* `JP_AT` ➡ `@` (At-mark)
* `JP_LBRC` ➡ `[` (Left bracket)
* `JP_EISU` ➡ `英数` (Eisu toggle)
* `JP_SCLN` ➡ `;` (Semicolon)
* `JP_COLN` ➡ `:` (Colon)
* `JP_RBRC` ➡ `]` (Right bracket)
* `JP_BSLS` ➡ `ろ` (Backslash/Ro)
* `JP_MHEN` ➡ `無変換` (Muhenkan)
* `JP_HENK` ➡ `変換` (Henkan)
* `JP_KANA` ➡ `かな` (Kana)
* *Plus shifted aliases:* `JP_EXLM` (``!``), `JP_DQUO` (``"``), `JP_HASH` (``#``), `JP_DLR` (``$``), `JP_PERC` (``%``), `JP_AMPR` (``&``), `JP_QUOT` (``'``), `JP_LPRN` (``(``), `JP_RPRN` (``)``), `JP_EQL` (``=``), `JP_TILD` (``~``), `JP_PIPE` (``|``), `JP_GRV` (`` ` ``), `JP_LCBR` (``{``), `JP_PLUS` (``+``), `JP_ASTR` (``*``), `JP_RCBR` (``}``), `JP_LABK` (``<``), `JP_RABK` (``>``), `JP_QUES` (``?``), `JP_UNDS` (``_``).

When any JSON file maps these keycodes, the visualizer automatically displays their correct legends cleanly.

### B. Shift-modifier Smart Parser (`S(KC_X)` / `LSFT(KC_X)`)
When a JSON maps a Shift-modified code like `S(KC_MINS)` (often used to simulate a standard symbol in customized keymaps), `labelParser.js` parses the inner key dynamically:
* If the layout JSON root declares `"isJIS": true`, it applies the JIS shifted character map:
  * `S(KC_MINS)` or `S(MINS)` ➡ **`=`**
  * `S(KC_EQL)` or `S(EQL)` ➡ **`~`**
  * `S(KC_2)` or `S(2)` ➡ **`"`**
  * `S(KC_6)` or `S(6)` ➡ **`&`**
  * `S(KC_7)` or `S(7)` ➡ **`'`**
  * `S(KC_8)` or `S(8)` ➡ **`(`**
  * `S(KC_9)` or `S(9)` ➡ **`)`**
  * `S(KC_LBRC)` or `S(LBRC)` ➡ **`` ` ``**
  * `S(KC_SCLN)` or `S(SCLN)` ➡ **`+`**
  * `S(KC_QUOT)` or `S(QUOT)` ➡ **`*`**
  * `S(KC_NUHS)` or `S(NUHS)` ➡ **`}`**
  * `S(KC_RO)` or `S(RO)` ➡ **`_`**
* Otherwise, it uses the standard US shifted character map (e.g. `S(KC_MINS)` ➡ `_`, `S(KC_EQL)` ➡ `+`).

### C. Standardized JP Sample Layout Map
Updated [SampleLayouts/sample_tkl_jp.json](file:///c:/Git/KeymappingViewer/SampleLayouts/sample_tkl_jp.json) layer arrays to contain authentic standard QMK keys. Layer 0 now has `"JP_ZKHK"`, `"JP_CIRC"`, `"JP_AT"`, `"JP_LBRC"`, `"JP_EISU"`, `"JP_COLN"`, `"JP_RBRC"`, `"JP_BSLS"`, `"JP_MHEN"`, `"JP_HENK"`, `"JP_KANA"`. Layer 2 maps `"LT(1,JP_MHEN)"` and `"LT(1,JP_HENK)"`.

---

## 4. Result and Validation
When loading this corrected JSON layout:
* The keycaps render exactly standard JP legends: `^` next to `JP_MINS`, `@` next to `P`, `[` below `@`, `:` below `;`, `]` below `[`, `ろ` next to `/`.
* Special functions (`無変換`, `変換`, `かな`) render as expected.
* Loading ANSI layouts maps English symbols (`=`, `[`, `]`, `'`, `\`, `CapsLock`) natively without any collision.
