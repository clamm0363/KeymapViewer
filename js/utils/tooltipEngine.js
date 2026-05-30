import { QMK_KEYCODE_METADATA } from '../qmk-keycode-metadata.js';
import { resolveKeycodeAlias } from '../keymap-dictionary.js';

const preferredOfficialKeycodeDisplay = new Map([
  ['KC_ENT', 'KC_ENTER'],
  ['KC_ESC', 'KC_ESCAPE'],
  ['KC_BSPC', 'KC_BACKSPACE'],
  ['KC_SPC', 'KC_SPACE'],
  ['KC_MINS', 'KC_MINUS'],
  ['KC_EQL', 'KC_EQUAL'],
  ['KC_LBRC', 'KC_LEFT_BRACKET'],
  ['KC_RBRC', 'KC_RIGHT_BRACKET'],
  ['KC_BSLS', 'KC_BACKSLASH'],
  ['KC_NUHS', 'KC_NONUS_HASH'],
  ['KC_SCLN', 'KC_SEMICOLON'],
  ['KC_QUOT', 'KC_QUOTE'],
  ['KC_GRV', 'KC_GRAVE'],
  ['KC_COMM', 'KC_COMMA'],
  ['KC_LCTL', 'KC_LEFT_CTRL'],
  ['KC_RCTL', 'KC_RIGHT_CTRL'],
  ['KC_LSFT', 'KC_LEFT_SHIFT'],
  ['KC_RSFT', 'KC_RIGHT_SHIFT'],
  ['KC_LALT', 'KC_LEFT_ALT'],
  ['KC_RALT', 'KC_RIGHT_ALT'],
  ['KC_LGUI', 'KC_LEFT_GUI'],
  ['KC_RGUI', 'KC_RIGHT_GUI'],
  ['KC_CAPS', 'KC_CAPS_LOCK'],
  ['KC_SLCK', 'KC_SCROLL_LOCK'],
  ['KC_PSCR', 'KC_PRINT_SCREEN'],
  ['KC_PAUS', 'KC_PAUSE'],
  ['KC_INS', 'KC_INSERT'],
  ['KC_PGUP', 'KC_PAGE_UP'],
  ['KC_DEL', 'KC_DELETE'],
  ['KC_PGDN', 'KC_PAGE_DOWN'],
  ['KC_RGHT', 'KC_RIGHT'],
  ['KC_APP', 'KC_APPLICATION'],
  ['KC_NUM', 'KC_NUM_LOCK'],
  ['KC_PSLS', 'KC_KP_SLASH'],
  ['KC_PAST', 'KC_KP_ASTERISK'],
  ['KC_PMNS', 'KC_KP_MINUS'],
  ['KC_PPLS', 'KC_KP_PLUS'],
  ['KC_PENT', 'KC_KP_ENTER'],
  ['KC_P0', 'KC_KP_0'],
  ['KC_P1', 'KC_KP_1'],
  ['KC_P2', 'KC_KP_2'],
  ['KC_P3', 'KC_KP_3'],
  ['KC_P4', 'KC_KP_4'],
  ['KC_P5', 'KC_KP_5'],
  ['KC_P6', 'KC_KP_6'],
  ['KC_P7', 'KC_KP_7'],
  ['KC_P8', 'KC_KP_8'],
  ['KC_P9', 'KC_KP_9'],
  ['KC_TRNS', 'KC_TRANSPARENT'],
  ['KC_RESET', 'QK_BOOTLOADER'],
  ['KC_EE_CLR', 'QK_CLEAR_EEPROM'],
  ['KC_DEBUG', 'QK_DEBUG_TOGGLE'],
  ['KC_MS_U', 'QK_MOUSE_CURSOR_UP'],
  ['KC_MS_D', 'QK_MOUSE_CURSOR_DOWN'],
  ['KC_MS_L', 'QK_MOUSE_CURSOR_LEFT'],
  ['KC_MS_R', 'QK_MOUSE_CURSOR_RIGHT'],
  ['KC_BTN1', 'QK_MOUSE_BUTTON_1'],
  ['KC_BTN2', 'QK_MOUSE_BUTTON_2'],
  ['KC_BTN3', 'QK_MOUSE_BUTTON_3'],
  ['KC_BTN4', 'QK_MOUSE_BUTTON_4'],
  ['KC_BTN5', 'QK_MOUSE_BUTTON_5'],
  ['KC_WH_U', 'QK_MOUSE_WHEEL_UP'],
  ['KC_WH_D', 'QK_MOUSE_WHEEL_DOWN'],
  ['KC_WH_L', 'QK_MOUSE_WHEEL_LEFT'],
  ['KC_WH_R', 'QK_MOUSE_WHEEL_RIGHT'],
  ['KC_ACL0', 'QK_MOUSE_ACCELERATION_0'],
  ['KC_ACL1', 'QK_MOUSE_ACCELERATION_1'],
  ['KC_ACL2', 'QK_MOUSE_ACCELERATION_2'],
]);

const tooltipWrapperTokens = new Set([
  'LT',
  'MT',
  'MO',
  'TG',
  'TT',
  'OSL',
  'TO',
  'DF',
  'LCTL',
  'LSFT',
  'LALT',
  'LGUI',
  'RCTL',
  'RSFT',
  'RALT',
  'RGUI',
  'A',
  'C',
  'S',
  'G',
  'LCA',
  'LSA',
  'RSA',
  'RCS',
  'LCG',
  'RCG',
  'LSG',
  'RSG',
  'LAG',
  'RAG',
  'MEH',
  'HYPR',
  'LCTL_T',
  'LSFT_T',
  'LALT_T',
  'LGUI_T',
  'LCS_T',
  'LCA_T',
  'LCG_T',
  'LSA_T',
  'LSG_T',
  'LAG_T',
  'LCSG_T',
  'LCAG_T',
  'LSAG_T',
  'RCTL_T',
  'RSFT_T',
  'RALT_T',
  'RGUI_T',
  'RCS_T',
  'RCA_T',
  'RCG_T',
  'RSA_T',
  'RSG_T',
  'RAG_T',
  'RCSG_T',
  'RCAG_T',
  'RSAG_T',
  'MEH_T',
  'HYPR_T',
  'MACRO',
  'CUSTOM',
  'MOD_LCTL',
  'MOD_RCTL',
  'MOD_LSFT',
  'MOD_RSFT',
  'MOD_LALT',
  'MOD_RALT',
  'MOD_LGUI',
  'MOD_RGUI',
]);

const tooltipWrapperAliasMap = new Map([
  ['C', ['LCTL']],
  ['S', ['LSFT']],
  ['A', ['LALT']],
  ['G', ['LGUI']],
  ['LCA', ['LCTL', 'LALT']],
  ['LSA', ['LSFT', 'LALT']],
  ['RSA', ['RSFT', 'LALT']],
  ['RCS', ['RCTL', 'LSFT']],
  ['LCG', ['LCTL', 'LGUI']],
  ['RCG', ['RCTL', 'RGUI']],
  ['LSG', ['LSFT', 'LGUI']],
  ['RSG', ['RSFT', 'RGUI']],
  ['LAG', ['LALT', 'LGUI']],
  ['RAG', ['RALT', 'RGUI']],
  ['MEH', ['LCTL', 'LALT', 'LSFT']],
  ['HYPR', ['LCTL', 'LALT', 'LSFT', 'LGUI']],
]);

const tooltipTemplateAliasMap = new Map([
  ['CTL_T', 'LCTL_T'],
  ['SFT_T', 'LSFT_T'],
  ['ALT_T', 'LALT_T'],
  ['LOPT_T', 'LALT_T'],
  ['OPT_T', 'LALT_T'],
  ['GUI_T', 'LGUI_T'],
  ['LCMD_T', 'LGUI_T'],
  ['LWIN_T', 'LGUI_T'],
  ['CMD_T', 'LGUI_T'],
  ['WIN_T', 'LGUI_T'],
  ['ROPT_T', 'RALT_T'],
  ['ALGR_T', 'RALT_T'],
  ['RCMD_T', 'RGUI_T'],
  ['RWIN_T', 'RGUI_T'],
]);

const tooltipModTapDescriptions = {
  LCTL_T: 'Left Control when held',
  LSFT_T: 'Left Shift when held',
  LALT_T: 'Left Alt when held',
  LGUI_T: 'Left GUI when held',
  LCS_T: 'Left Control and Left Shift when held',
  LCA_T: 'Left Control and Left Alt when held',
  LCG_T: 'Left Control and Left GUI when held',
  LSA_T: 'Left Shift and Left Alt when held',
  LSG_T: 'Left Shift and Left GUI when held',
  LAG_T: 'Left Alt and Left GUI when held',
  LCSG_T: 'Left Control, Left Shift and Left GUI when held',
  LCAG_T: 'Left Control, Left Alt and Left GUI when held',
  LSAG_T: 'Left Shift, Left Alt and Left GUI when held',
  RCTL_T: 'Right Control when held',
  RSFT_T: 'Right Shift when held',
  RALT_T: 'Right Alt when held',
  RGUI_T: 'Right GUI when held',
  RCS_T: 'Right Control and Right Shift when held',
  RCA_T: 'Right Control and Right Alt when held',
  RCG_T: 'Right Control and Right GUI when held',
  RSA_T: 'Right Shift and Right Alt when held',
  RSG_T: 'Right Shift and Right GUI when held',
  RAG_T: 'Right Alt and Right GUI when held',
  RCSG_T: 'Right Control, Right Shift and Right GUI when held',
  RCAG_T: 'Right Control, Right Alt and Right GUI when held',
  RSAG_T: 'Right Shift, Right Alt and Right GUI when held',
  MEH_T: 'Left Control, Left Shift and Left Alt when held',
  HYPR_T: 'Left Control, Left Shift, Left Alt and Left GUI when held',
};

const modifierWrapperExpansion = {
  LCTL: ['LCTL'],
  LSFT: ['LSFT'],
  LALT: ['LALT'],
  LGUI: ['LGUI'],
  RCTL: ['RCTL'],
  RSFT: ['RSFT'],
  RALT: ['RALT'],
  RGUI: ['RGUI'],
  C: ['LCTL'],
  S: ['LSFT'],
  A: ['LALT'],
  G: ['LGUI'],
  LCS: ['LCTL', 'LSFT'],
  LCA: ['LCTL', 'LALT'],
  LCG: ['LCTL', 'LGUI'],
  LSA: ['LSFT', 'LALT'],
  LSG: ['LSFT', 'LGUI'],
  LAG: ['LALT', 'LGUI'],
  LCSG: ['LCTL', 'LSFT', 'LGUI'],
  LCAG: ['LCTL', 'LALT', 'LGUI'],
  LSAG: ['LSFT', 'LALT', 'LGUI'],
  RCA: ['RCTL', 'RALT'],
  RCS: ['RCTL', 'RSFT'],
  RCG: ['RCTL', 'RGUI'],
  RSA: ['RSFT', 'RALT'],
  RSG: ['RSFT', 'RGUI'],
  RAG: ['RALT', 'RGUI'],
  RCSG: ['RCTL', 'RSFT', 'RGUI'],
  RCAG: ['RCTL', 'RALT', 'RGUI'],
  RSAG: ['RSFT', 'RALT', 'RGUI'],
  MEH: ['LCTL', 'LSFT', 'LALT'],
  HYPR: ['LCTL', 'LSFT', 'LALT', 'LGUI'],
};

const tooltipModifierNameByStyle = {
  Windows: {
    LCTL: 'Left Control',
    LSFT: 'Left Shift',
    LALT: 'Left Alt',
    LGUI: 'Left Win',
    RCTL: 'Right Control',
    RSFT: 'Right Shift',
    RALT: 'Right Alt',
    RGUI: 'Right Win',
    MEH: 'Left Control, Left Shift and Left Alt',
    HYPR: 'Left Control, Left Shift, Left Alt and Left Win',
  },
  Mac: {
    LCTL: 'Left Control',
    LSFT: 'Left Shift',
    LALT: 'Left Option',
    LGUI: 'Left Command',
    RCTL: 'Right Control',
    RSFT: 'Right Shift',
    RALT: 'Right Option',
    RGUI: 'Right Command',
    MEH: 'Left Control, Left Shift and Left Option',
    HYPR: 'Left Control, Left Shift, Left Option and Left Command',
  },
};

function splitTopLevelArgs(source) {
  const args = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) {
      args.push(source.slice(start, i).trim());
      start = i + 1;
    }
  }

  args.push(source.slice(start).trim());
  return args.filter((arg) => arg.length > 0);
}

function canonicalizeTooltipAtom(token) {
  const upper = token.toUpperCase();
  if (tooltipWrapperTokens.has(upper)) {
    return upper;
  }
  if (tooltipTemplateAliasMap.has(upper)) {
    return tooltipTemplateAliasMap.get(upper);
  }
  const canonical = resolveKeycodeAlias(upper) || upper;
  return preferredOfficialKeycodeDisplay.get(canonical) || canonical;
}

function normalizeKeyStyle(keyStyle = 'Windows') {
  return keyStyle === 'Mac' ? 'Mac' : 'Windows';
}

function getStyledModifierName(token, keyStyle = 'Windows') {
  const styleKey = normalizeKeyStyle(keyStyle);
  const normalizedToken = token.replace(/^MOD_/, '').replace(/^KC_/, '');
  return tooltipModifierNameByStyle[styleKey][normalizedToken] || normalizedToken;
}

function formatModifierList(modifiers) {
  if (modifiers.length === 0) return '';
  if (modifiers.length === 1) return modifiers[0];
  if (modifiers.length === 2) return `${modifiers[0]} and ${modifiers[1]}`;
  return `${modifiers.slice(0, -1).join(', ')} and ${modifiers[modifiers.length - 1]}`;
}

function collectModifierChain(source) {
  const wrapped = extractWrappedExpressionParts(String(source || '').trim());
  if (!wrapped || wrapped.args.length !== 1) return null;

  const token = wrapped.token.toUpperCase();
  const modifiers = modifierWrapperExpansion[token];
  if (!modifiers) return null;

  const child = collectModifierChain(wrapped.args[0]);
  if (child) {
    return {
      modifiers: [...modifiers, ...child.modifiers],
      leaf: child.leaf,
    };
  }

  return {
    modifiers: [...modifiers],
    leaf: wrapped.args[0],
  };
}

function formatDirectDescriptionForKeyStyle(officialCode, description, keyStyle = 'Windows') {
  if (!description) return '';
  const styleKey = normalizeKeyStyle(keyStyle);
  if (styleKey === 'Windows') {
    const windowsOverrides = {
      KC_LEFT_GUI: 'Left Win',
      KC_RIGHT_GUI: 'Right Win',
    };

    if (windowsOverrides[officialCode]) {
      return windowsOverrides[officialCode];
    }

    return description.replace(/\bLeft GUI\b/g, 'Left Win').replace(/\bRight GUI\b/g, 'Right Win');
  }

  const macOverrides = {
    KC_LEFT_ALT: 'Left Option',
    KC_RIGHT_ALT: 'Right Option',
    KC_LEFT_GUI: 'Left Command',
    KC_RIGHT_GUI: 'Right Command',
    KC_APPLICATION: 'Application (context menu key)',
    KC_MISSION_CONTROL: 'Open Mission Control',
    KC_LAUNCHPAD: 'Open Launchpad',
  };

  if (macOverrides[officialCode]) {
    return macOverrides[officialCode];
  }

  return description
    .replace(/\bLeft Alt\b/g, 'Left Option')
    .replace(/\bRight Alt\b/g, 'Right Option')
    .replace(/\bLeft GUI\b/g, 'Left Command')
    .replace(/\bRight GUI\b/g, 'Right Command');
}

function extractWrappedExpressionParts(source) {
  if (!isWrappedExpression(source)) return null;
  const openIndex = source.indexOf('(');
  return {
    token: source.slice(0, openIndex).trim().toUpperCase(),
    args: splitTopLevelArgs(source.slice(openIndex + 1, -1)),
  };
}

function getDirectKeycodeDescription(code, keyStyle = 'Windows') {
  const officialCode = toCanonicalKeycodeDisplay(code);
  const description = QMK_KEYCODE_METADATA[officialCode]?.description || '';
  return formatDirectDescriptionForKeyStyle(officialCode, description, keyStyle);
}

function getViaSpecificDescription(code) {
  const normalized = String(code || '')
    .trim()
    .toUpperCase();
  const fnMoMatch = normalized.match(/^FN_MO(\d)(\d)$/);
  if (!fnMoMatch) return '';

  const targetLayer = fnMoMatch[1];
  const triLayer = fnMoMatch[2];
  return `VIA custom Fn key: activates layer ${targetLayer} while held and updates tri-layer state for layers 1, 2, and ${triLayer}`;
}

function getCompositeKeycodeDescription(code, keyStyle = 'Windows') {
  const viaSpecificDescription = getViaSpecificDescription(code);
  if (viaSpecificDescription) {
    return viaSpecificDescription;
  }

  const modifierChain = collectModifierChain(code);
  if (modifierChain) {
    const modifierNames = modifierChain.modifiers.map((modifier) =>
      getStyledModifierName(modifier, keyStyle)
    );
    const leafDescription =
      getKeycodeDescription(modifierChain.leaf, keyStyle) ||
      toCanonicalKeycodeDisplay(modifierChain.leaf);
    return `Hold ${formatModifierList(modifierNames)} and press ${leafDescription}`;
  }

  const wrapped = extractWrappedExpressionParts(String(code || '').trim());
  if (!wrapped) return '';

  const { token, args } = wrapped;
  const canonicalToken = canonicalizeTooltipAtom(token);

  if (tooltipModTapDescriptions[canonicalToken] && args.length === 1) {
    const tapDescription =
      getKeycodeDescription(args[0], keyStyle) || toCanonicalKeycodeDisplay(args[0]);
    return `${getStyledModifierName(canonicalToken.replace(/_T$/, ''), keyStyle)} when held, ${tapDescription} when tapped`;
  }

  if (token === 'LT' && args.length === 2) {
    const tapDescription =
      getKeycodeDescription(args[1], keyStyle) || toCanonicalKeycodeDisplay(args[1]);
    return `Momentarily activates layer ${args[0]} when held, sends ${tapDescription} when tapped`;
  }

  if (token === 'MO' && args.length === 1) {
    return `Momentarily activates layer ${args[0]}`;
  }

  if (token === 'TG' && args.length === 1) {
    return `Toggles layer ${args[0]} on and off`;
  }

  if (token === 'TT' && args.length === 1) {
    return `Momentarily activates layer ${args[0]} when held, toggles it when tapped repeatedly`;
  }

  if (token === 'OSL' && args.length === 1) {
    return `Momentarily activates layer ${args[0]} until the next key is pressed`;
  }

  if (token === 'TO' && args.length === 1) {
    return `Activates layer ${args[0]} and deactivates all other layers`;
  }

  if (token === 'DF' && args.length === 1) {
    return `Sets the default layer to ${args[0]}`;
  }

  if (token === 'MT' && args.length === 2) {
    const holdPart = args[0]
      .split('|')
      .map((part) => getStyledModifierName(part.trim(), keyStyle))
      .join(' + ');
    const tapDescription =
      getKeycodeDescription(args[1], keyStyle) || toCanonicalKeycodeDisplay(args[1]);
    return `Mod-Tap: holds ${holdPart} when held, sends ${tapDescription} when tapped`;
  }

  if (token === 'MACRO' && args.length === 1) {
    return `Triggers macro ${args[0]}`;
  }

  if (token === 'CUSTOM' && args.length === 1) {
    return `Triggers custom keycode ${args[0]}`;
  }

  return '';
}

function isWrappedExpression(source) {
  const openIndex = source.indexOf('(');
  if (openIndex <= 0 || !source.endsWith(')')) return false;

  let depth = 0;
  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '(') depth += 1;
    if (ch === ')') {
      depth -= 1;
      if (depth === 0 && i !== source.length - 1) {
        return false;
      }
    }
  }

  return depth === 0;
}

export function toCanonicalKeycodeDisplay(code) {
  const source = String(code || '').trim();
  if (!source) return '';

  if (/^FN_MO\d{2}$/i.test(source)) {
    return source.toUpperCase();
  }

  if (/^[A-Z0-9_]+$/i.test(source)) {
    return canonicalizeTooltipAtom(source);
  }

  if (isWrappedExpression(source)) {
    const openIndex = source.indexOf('(');
    const token = source.slice(0, openIndex).trim().toUpperCase();
    const inner = source.slice(openIndex + 1, -1);
    const args = splitTopLevelArgs(inner).map((arg) => toCanonicalKeycodeDisplay(arg));

    if (tooltipWrapperAliasMap.has(token) && args.length === 1) {
      return tooltipWrapperAliasMap.get(token).reduceRight((acc, wrapperToken) => {
        return `${wrapperToken}(${acc})`;
      }, args[0]);
    }

    return `${canonicalizeTooltipAtom(token)}(${args.join(',')})`;
  }

  return source.replace(/\b[A-Z][A-Z0-9_]*\b/gi, (token) => canonicalizeTooltipAtom(token));
}

export function getKeycodeDescription(code, keyStyle = 'Windows') {
  const directDescription = getDirectKeycodeDescription(code, keyStyle);
  if (directDescription) return directDescription;

  const compositeDescription = getCompositeKeycodeDescription(code, keyStyle);
  if (compositeDescription) return compositeDescription;

  return '';
}

export function getKeycodeTooltipInfo(code, originalInput = code, keyStyle = 'Windows') {
  const officialCode = toCanonicalKeycodeDisplay(code);
  const description = getKeycodeDescription(code, keyStyle);
  const metadata = QMK_KEYCODE_METADATA[officialCode] || null;
  const normalizedInput = String(originalInput || '')
    .trim()
    .toUpperCase();
  const inputCode = normalizedInput || officialCode;

  return {
    officialCode,
    description,
    section: metadata?.section || '',
    aliases: metadata?.aliases || [],
    inputCode,
    isAliasInput: !!inputCode && inputCode !== officialCode,
  };
}
