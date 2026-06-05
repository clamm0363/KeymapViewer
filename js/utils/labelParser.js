import { SYMBOL_MAP, FLUENT_MAP } from '../constants.js';
import { getRawLabel } from './helpers.js';
import {
  getKeyDefinition,
  getModifierDefinition,
  getModifierLabel,
  normalizeModifierLabel,
  resolveKeycodeAlias,
} from '../keymap-dictionary.js';

export function parseKeyLabel(keycode, keyId, displayMode, keyStyle, macroAliases, isJIS = false) {
  if (keycode === null || keycode === undefined || keycode === '') {
    return {
      fullRaw: '',
      displayText: '',
      isFluentIcon: false,
      isLayerKey: false,
      layerType: null,
      layerNum: null,
      tapLabel: '',
      tapIsFluent: false,
      visualWeight: 0,
      layerNum2: null,
      isModKey: false,
      modType: null,
      modLabel: '',
      modKeys: [],
      baseLabel: '',
      baseIsFluent: false,
    };
  }

  const safeKeyId = keyId || '';
  const fullRaw = getRawLabel(
    keycode || (safeKeyId.includes('\n') ? safeKeyId.split('\n').pop() : safeKeyId)
  );

  // 1. Smart parsing for single-key Shift modifications: S(KC_X) or LSFT(KC_X)
  const shiftMatch = fullRaw.match(/^(S|LSFT)\((KC_)?([A-Z0-9_]+)\)$/);
  if (shiftMatch) {
    const rawKey = shiftMatch[3]; // 'MINS', '1', etc.
    const jisShiftMap = {
      1: '!',
      2: '"',
      3: '#',
      4: '$',
      5: '%',
      6: '&',
      7: "'",
      8: '(',
      9: ')',
      0: '',
      MINS: '=',
      EQL: '~',
      LBRC: '`',
      RBRC: '{',
      SCLN: '+',
      QUOT: '*',
      NUHS: '}',
      RO: '_',
      JYEN: '|',
    };
    const usShiftMap = {
      1: '!',
      2: '@',
      3: '#',
      4: '$',
      5: '%',
      6: '^',
      7: '&',
      8: '*',
      9: '(',
      0: ')',
      MINS: '_',
      EQL: '+',
      LBRC: '{',
      RBRC: '}',
      SCLN: ':',
      QUOT: '"',
      COMM: '<',
      DOT: '>',
      SLSH: '?',
      BSLS: '|',
      GRV: '~',
    };
    const shiftMap = isJIS ? jisShiftMap : usShiftMap;

    if (shiftMap[rawKey]) {
      const shiftedSymbol = shiftMap[rawKey];
      return {
        fullRaw,
        displayText: shiftedSymbol,
        isFluentIcon: false,
        isLayerKey: false,
        layerType: null,
        layerNum: null,
        tapLabel: '',
        tapIsFluent: false,
        visualWeight: shiftedSymbol.length,
        layerNum2: null,
        isModKey: false,
        modType: null,
        modLabel: '',
        modKeys: [],
        baseLabel: '',
        baseIsFluent: false,
      };
    }
  }

  let complexKeyDescriptor = null;
  let keycodeMatch = fullRaw.match(/^LT(\d+)\((L\d+),\s*(.+)\)$/);
  if (keycodeMatch) {
    complexKeyDescriptor = {
      type: 'lt',
      mod: keycodeMatch[2],
      base: keycodeMatch[3],
      symbol: '/',
    };
  }
  if (!complexKeyDescriptor) {
    keycodeMatch = fullRaw.match(/^MT\(MOD_(\w+),\s*(.+)\)$/);
    const modMap = {
      LCTL: 'CTRL',
      RCTL: 'CTRL',
      LSFT: 'SHFT',
      RSFT: 'SHFT',
      LALT: 'ALT',
      RALT: 'ALT',
      LGUI: 'GUI',
      RGUI: 'GUI',
    };
    if (keycodeMatch) {
      complexKeyDescriptor = {
        type: 'mt',
        mod: modMap[keycodeMatch[1]] || keycodeMatch[1],
        base: keycodeMatch[2],
        symbol: '/',
      };
    }
  }
  if (!complexKeyDescriptor) {
    keycodeMatch = fullRaw.match(
      /^(LCTL_T|LSFT_T|LALT_T|LGUI_T|RCTL_T|RSFT_T|RALT_T|RGUI_T)\((.+)\)$/
    );
    const modMap = {
      LCTL_T: 'CTRL',
      RCTL_T: 'CTRL',
      LSFT_T: 'SHFT',
      RSFT_T: 'SHFT',
      LALT_T: 'ALT',
      RALT_T: 'ALT',
      LGUI_T: 'GUI',
      RGUI_T: 'GUI',
    };
    if (keycodeMatch) {
      complexKeyDescriptor = {
        type: 'mt',
        mod: modMap[keycodeMatch[1]],
        base: keycodeMatch[2],
        symbol: '/',
      };
    }
  }
  if (!complexKeyDescriptor) {
    const activeModifierNames = [];
    let nestedRaw = fullRaw;
    let foundNestedModifier = true;
    const modWrapperMap = {
      LCTL: 'CTRL',
      RCTL: 'CTRL',
      LSFT: 'SHFT',
      RSFT: 'SHFT',
      LALT: 'ALT',
      RALT: 'ALT',
      LGUI: 'GUI',
      RGUI: 'GUI',
      A: 'ALT',
      C: 'CTRL',
      S: 'SHFT',
      G: 'GUI',
      LCA: 'CTRL+ALT',
      LSA: 'SHFT+ALT',
      RSA: 'SHFT+ALT',
      RCS: 'CTRL+SHFT',
      LCG: 'CTRL+GUI',
      RCG: 'CTRL+GUI',
      LSG: 'SHFT+GUI',
      RSG: 'SHFT+GUI',
      LAG: 'ALT+GUI',
      RAG: 'ALT+GUI',
      MEH: 'CTRL+ALT+SHFT',
      HYPR: 'CTRL+ALT+SHFT+GUI',
    };

    while (foundNestedModifier) {
      foundNestedModifier = false;
      const nestedModifierMatch = nestedRaw.match(
        /^(LCTL|LSFT|LALT|LGUI|RCTL|RSFT|RALT|RGUI|A|C|S|G|LCA|LSA|RSA|RCS|LCG|RCG|LSG|RSG|LAG|RAG|MEH|HYPR)\((.+)\)$/
      );
      if (nestedModifierMatch) {
        const nestedModifierName = modWrapperMap[nestedModifierMatch[1]];
        if (nestedModifierName) {
          const nestedModifierParts = nestedModifierName.split('+');
          activeModifierNames.push(...nestedModifierParts);
          nestedRaw = nestedModifierMatch[2];
          foundNestedModifier = true;
        }
      }
    }

    if (activeModifierNames.length > 0) {
      const uniqueModifierNames = [...new Set(activeModifierNames)];
      complexKeyDescriptor = {
        type: 'mod',
        mod: uniqueModifierNames.join('+'),
        base: nestedRaw,
        symbol: '+',
      };
    }
  }

  const raw = fullRaw
    .replace(/MACRO\((\d+)\)/g, (match, p1) =>
      macroAliases && macroAliases[p1] ? macroAliases[p1] : `M${p1}`
    )
    .replace(/CUSTOM\((\d+)\)/g, 'C$1');
  const canonicalRaw = resolveKeycodeAlias(raw);

  let displayText = raw;
  let isFluentIcon = false;

  const formatModifierLabel = (modifierName) => {
    return getModifierLabel(modifierName, {
      keyStyle,
      variant: 'default',
      preferSymbol: keyStyle === 'Mac' && displayMode === 'Fluent',
    });
  };

  // Pure dictionary lookup (no locale overrides)
  const getDictionaryLabel = (keyToken) => {
    const normalizedCode = keyToken.startsWith('KC_') ? keyToken : `KC_${keyToken}`;
    const unprefixedCode = keyToken.startsWith('KC_') ? keyToken.replace('KC_', '') : keyToken;

    const modifierEntry =
      getModifierDefinition(normalizedCode) || getModifierDefinition(unprefixedCode);
    if (modifierEntry) {
      return displayMode === 'Fluent'
        ? keyStyle === 'Mac'
          ? modifierEntry.mac
          : modifierEntry.win
        : (keyStyle === 'Mac'
            ? modifierEntry.macText || modifierEntry.text
            : modifierEntry.text) || keyToken.replace('KC_', '');
    }

    const keyEntry = getKeyDefinition(normalizedCode) || getKeyDefinition(unprefixedCode);
    if (keyEntry) {
      return displayMode === 'Fluent' && keyEntry.fluent
        ? keyEntry.fluent
        : (keyStyle === 'Mac' ? keyEntry.macText || keyEntry.text : keyEntry.text) ||
            keyToken.replace('KC_', '');
    }
    return null;
  };

  if (complexKeyDescriptor) {
    const modifierDisplayLabel = getDictionaryLabel(complexKeyDescriptor.mod);
    const baseDisplayLabel = getDictionaryLabel(complexKeyDescriptor.base);
    const hasFluentModifier =
      displayMode === 'Fluent' &&
      (modifierDisplayLabel || !!FLUENT_MAP[complexKeyDescriptor.mod]);
    const baseRawKey = complexKeyDescriptor.base.replace('KC_', '');
    const hasFluentBase =
      displayMode === 'Fluent' && (baseDisplayLabel || !!FLUENT_MAP[baseRawKey]);
    const resolvedModifierLabel =
      modifierDisplayLabel ||
      (hasFluentModifier
        ? FLUENT_MAP[complexKeyDescriptor.mod]
        : SYMBOL_MAP[complexKeyDescriptor.mod] || complexKeyDescriptor.mod);
    const resolvedBaseLabel =
      baseDisplayLabel ||
      (hasFluentBase ? FLUENT_MAP[baseRawKey] : SYMBOL_MAP[baseRawKey] || baseRawKey);
    displayText = `${resolvedModifierLabel}${complexKeyDescriptor.symbol}${resolvedBaseLabel}`;
    if (hasFluentModifier || hasFluentBase) isFluentIcon = true;
  } else {
    const cleanRawForNo = raw.startsWith('KC_') ? raw : `KC_${raw}`;
    if (canonicalRaw === 'KC_EE_CLR' || raw === 'QK_CLEAR_EEPROM' || raw === 'EE_CLR') {
      displayText = 'EE CLR';
      if (displayMode === 'Fluent') {
        isFluentIcon = true;
      }
    } else if (cleanRawForNo === 'KC_NO' || cleanRawForNo === 'KC_NONE' || raw === 'None') {
      displayText = '';
    } else {
      const dictionaryLabel = getDictionaryLabel(raw);
      if (dictionaryLabel) {
        displayText = dictionaryLabel;
        const cleanCode = raw.startsWith('KC_') ? raw : `KC_${raw}`;
        const rawCode = raw.startsWith('KC_') ? raw.replace('KC_', '') : raw;
        const entry =
          getModifierDefinition(cleanCode) ||
          getModifierDefinition(rawCode) ||
          getKeyDefinition(cleanCode) ||
          getKeyDefinition(rawCode);
        if (displayMode === 'Fluent' && entry) {
          if (entry.isFluent === true || entry.fluent) {
            isFluentIcon = true;
          } else if (entry.isFluent === 'auto') {
            // Unicode fallback detection: identifies Fluent icon code points by PUA range (0xE000+)
            // Note for SVG migration: This charCodeAt check should be replaced with explicit isFluent flags
            // or SVG ID references when migrating away from WebFont rendering
            isFluentIcon = displayText.length === 1 && displayText.charCodeAt(0) >= 0xe000;
          }
        }
      } else if (displayMode === 'Fluent' && FLUENT_MAP[raw]) {
        displayText = FLUENT_MAP[raw];
        isFluentIcon = true;
      } else if (/^\d+,\d+$/.test(displayText)) {
        displayText = '';
      } else {
        displayText = SYMBOL_MAP[raw] || raw;
      }
    }
  }

  const kpMatch = displayText.match(/^(P|KP_)([0-9])$/);
  if (kpMatch) {
    displayText = kpMatch[2];
  }

  const layerActionMatch = raw.match(/^(MO|TG|TT|OSL|TO|DF)\((\d+)\)$/);
  const layerTapMatch = raw.match(/^LT\((\d+),\s*(.+)\)$/);
  const fnLayerMatch = raw.match(/^FN_MO(\d)(\d)$/); // FN_MO13 などに対応
  const isLayerKey = !!(layerActionMatch || layerTapMatch || fnLayerMatch);
  const layerType = isLayerKey
    ? layerActionMatch
      ? layerActionMatch[1]
      : layerTapMatch
        ? 'LT'
        : 'FN'
    : null;
  const layerNum = isLayerKey
    ? layerActionMatch
      ? layerActionMatch[2]
      : layerTapMatch
        ? layerTapMatch[1]
        : fnLayerMatch
          ? fnLayerMatch[1]
          : null
    : null;
  const layerNum2 = fnLayerMatch && fnLayerMatch[2] ? fnLayerMatch[2] : null;

  let tapLabel = '';
  let tapIsFluent = false;
  if (layerTapMatch) {
    const tapRawKey = layerTapMatch[2];
    const tapDictionaryLabel = getDictionaryLabel(tapRawKey);
    tapLabel = tapDictionaryLabel || SYMBOL_MAP[tapRawKey] || tapRawKey.replace('KC_', '');
    const tapKeyWithoutPrefix = tapRawKey.replace('KC_', '');
    const entry =
      getKeyDefinition(`KC_${tapKeyWithoutPrefix}`) ||
      getModifierDefinition(`KC_${tapKeyWithoutPrefix}`);
    if (displayMode === 'Fluent') {
      if (entry && entry.fluent) {
        tapIsFluent = true;
        tapLabel = entry.fluent;
      } else if (FLUENT_MAP[tapKeyWithoutPrefix]) {
        tapIsFluent = true;
        tapLabel = FLUENT_MAP[tapKeyWithoutPrefix];
      } else if (tapLabel.length === 1 && tapLabel.charCodeAt(0) >= 0xe000) {
        // Unicode fallback detection for tap labels (see SVG migration note above)
        tapIsFluent = true;
      }
    }
  }

  // Modifier metadata extraction
  let isModKey = false;
  let modType = null; // 'base', 'tap', 'direct'
  let modLabel = '';
  let modKeys = [];
  let baseLabel = '';
  let baseIsFluent = false;

  const cleanRaw = raw.startsWith('KC_') ? raw : `KC_${raw}`;
  const baseMods = [
    'KC_LSFT',
    'KC_RSFT',
    'KC_LCTL',
    'KC_RCTL',
    'KC_LALT',
    'KC_RALT',
    'KC_LGUI',
    'KC_RGUI',
    'KC_LSHIFT',
    'KC_RSHIFT',
    'KC_LCTRL',
    'KC_RCTRL',
    'KC_LOPT',
    'KC_ROPT',
    'KC_LCMD',
    'KC_RCMD',
  ];
  const isBaseMod = baseMods.includes(cleanRaw);

  if (isBaseMod) {
    isModKey = true;
    modType = 'base';
    const baseModMap = {
      KC_LSFT: 'SHFT',
      KC_RSFT: 'SHFT',
      KC_LSHIFT: 'SHFT',
      KC_RSHIFT: 'SHFT',
      KC_LCTL: 'CTRL',
      KC_RCTL: 'CTRL',
      KC_LCTRL: 'CTRL',
      KC_RCTRL: 'CTRL',
      KC_LALT: 'ALT',
      KC_RALT: 'ALT',
      KC_LOPT: 'ALT',
      KC_ROPT: 'ALT',
      KC_LGUI: 'GUI',
      KC_RGUI: 'GUI',
      KC_LCMD: 'GUI',
      KC_RCMD: 'GUI',
    };
    const canonicalMod = normalizeModifierLabel(
      baseModMap[cleanRaw] || cleanRaw.replace('KC_', '')
    );
    modLabel = getModifierLabel(canonicalMod, {
      keyStyle,
      variant: 'default',
    });
    modKeys = [canonicalMod];
  } else if (
    complexKeyDescriptor &&
    (complexKeyDescriptor.type === 'mt' || complexKeyDescriptor.type === 'mod')
  ) {
    isModKey = true;
    modType = complexKeyDescriptor.type === 'mt' ? 'tap' : 'direct';

    if (complexKeyDescriptor.mod === 'CTRL+ALT+SHFT') {
      modKeys = ['CTRL', 'ALT', 'SHFT'];
    } else if (complexKeyDescriptor.mod === 'CTRL+ALT+SHFT+GUI') {
      modKeys = ['CTRL', 'ALT', 'SHFT', 'GUI'];
    } else {
      modKeys = complexKeyDescriptor.mod.split('+').map((modifierKey) => modifierKey.trim());
    }

    const normalizedModifierString = complexKeyDescriptor.mod.toUpperCase().replace(/\s+/g, '');
    if (normalizedModifierString === 'CTRL+ALT+SHFT') {
      modLabel = 'MEH';
    } else if (
      normalizedModifierString === 'CTRL+ALT+SHFT+GUI' ||
      normalizedModifierString === 'CTRL+ALT+SHIFT+GUI'
    ) {
      modLabel = 'HYPR';
    } else if (modKeys.length > 1) {
      modLabel =
        keyStyle === 'Mac' && displayMode === 'Fluent'
          ? modKeys
              .map((modifierKey) =>
                getModifierLabel(modifierKey, {
                  keyStyle,
                  variant: 'default',
                  preferSymbol: true,
                })
              )
              .join('+')
          : modKeys.map((modifierKey) => normalizeModifierLabel(modifierKey).charAt(0)).join('+');
    } else {
      modLabel = formatModifierLabel(complexKeyDescriptor.mod);
    }

    const baseRawKey = complexKeyDescriptor.base;
    const baseDictionaryLabel = getDictionaryLabel(baseRawKey);
    const baseKeyWithoutPrefix = baseRawKey.replace('KC_', '');
    baseLabel = baseDictionaryLabel || SYMBOL_MAP[baseKeyWithoutPrefix] || baseKeyWithoutPrefix;

    if (displayMode === 'Fluent') {
      const entry =
        getKeyDefinition(`KC_${baseKeyWithoutPrefix}`) ||
        getModifierDefinition(`KC_${baseKeyWithoutPrefix}`);
      if (entry && entry.fluent) {
        baseIsFluent = true;
        baseLabel = entry.fluent;
      } else if (FLUENT_MAP[baseKeyWithoutPrefix]) {
        baseIsFluent = true;
        baseLabel = FLUENT_MAP[baseKeyWithoutPrefix];
      } else if (baseLabel.length === 1 && baseLabel.charCodeAt(0) >= 0xe000) {
        // Unicode fallback detection for base labels (see SVG migration note above)
        baseIsFluent = true;
      }
    }
  }

  // 文字数・視覚的重みの計算
  let visualWeight = displayText.length;
  if (isFluentIcon) visualWeight = 1.2; // アイコンは少し大きめにカウント
  if (complexKeyDescriptor) visualWeight += 0.5; // 複合キーは密度が高い

  return {
    fullRaw,
    displayText,
    isFluentIcon,
    isLayerKey,
    layerType,
    layerNum,
    tapLabel,
    tapIsFluent,
    visualWeight,
    layerNum2,
    isModKey,
    modType,
    modLabel,
    modKeys,
    baseLabel,
    baseIsFluent,
  };
}
