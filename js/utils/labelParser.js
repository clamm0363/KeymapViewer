import { SYMBOL_MAP, FLUENT_MAP } from '../constants.js';
import { getRawLabel } from './helpers.js';
import { KeymapDictionary } from '../keymap-dictionary.js';

export function parseKeyLabel(val, keyId, displayMode, keyStyle, macroAliases) {
    const fullRaw = getRawLabel(val || (keyId.includes('\n') ? keyId.split('\n').pop() : keyId));
    
    let complex = null;
    let m = fullRaw.match(/^LT(\d+)\((L\d+),\s*(.+)\)$/);
    if (m) complex = { type: 'lt', mod: m[2], base: m[3], symbol: '/' };
    if (!complex) {
        m = fullRaw.match(/^MT\(MOD_(\w+),\s*(.+)\)$/);
        const modMap = { 'LCTL': 'CTRL', 'RCTL': 'CTRL', 'LSFT': 'SHIFT', 'RSFT': 'SHIFT', 'LALT': 'ALT', 'RALT': 'ALT', 'LGUI': 'GUI', 'RGUI': 'GUI' };
        if (m) complex = { type: 'mt', mod: modMap[m[1]] || m[1], base: m[2], symbol: '/' };
    }
    if (!complex) {
        m = fullRaw.match(/^([ACSG])\((.+)\)$/);
        const modMap = { 'A': 'ALT', 'C': 'CTRL', 'S': 'SHIFT', 'G': 'GUI' };
        if (m) complex = { type: 'mod', mod: modMap[m[1]], base: m[2], symbol: '+' };
    }
    if (!complex) {
        m = fullRaw.match(/^(LCTL|LSFT|LALT|LGUI|RCTL|RSFT|RALT|RGUI)\((.+)\)$/);
        const modMap = { 'LCTL': 'CTRL', 'RCTL': 'CTRL', 'LSFT': 'SHIFT', 'RSFT': 'SHIFT', 'LALT': 'ALT', 'RALT': 'ALT', 'LGUI': 'GUI', 'RGUI': 'GUI' };
        if (m) complex = { type: 'mod', mod: modMap[m[1]], base: m[2], symbol: '+' };
    }
    if (!complex) {
        m = fullRaw.match(/^(LCA|LSA|RSA|RCS|LCG|RCG|LSG|RSG|LAG|RAG|MEH|HYPR)\((.+)\)$/);
        const multiMap = {
            'LCA': 'CTRL+ALT', 'LSA': 'SHIFT+ALT', 'RSA': 'SHIFT+ALT', 'RCS': 'CTRL+SHIFT',
            'LCG': 'CTRL+GUI', 'RCG': 'CTRL+GUI', 'LSG': 'SHIFT+GUI', 'RSG': 'SHIFT+GUI',
            'LAG': 'ALT+GUI', 'RAG': 'ALT+GUI', 'MEH': 'CTRL+ALT+SHFT', 'HYPR': 'CTRL+ALT+SHFT+GUI'
        };
        if (m) complex = { type: 'mod', mod: multiMap[m[1]], base: m[2], symbol: '+' };
    }

    const raw = fullRaw.replace(/MACRO\((\d+)\)/g, (match, p1) => (macroAliases && macroAliases[p1] ? macroAliases[p1] : `M${p1}`)).replace(/CUSTOM\((\d+)\)/g, 'C$1');

    let displayText = raw;
    let isFluentIcon = false;

    const dict = KeymapDictionary || { modifiers: {}, keys: {} };
    const getDictLabel = (kCode) => {
        const cleanCode = kCode.startsWith('KC_') ? kCode : `KC_${kCode}`;
        if (dict.modifiers[cleanCode]) {
            const entry = dict.modifiers[cleanCode];
            return displayMode === 'Fluent' ? (keyStyle === 'Mac' ? entry.mac : entry.win) : (entry.text || kCode.replace('KC_', ''));
        }
        if (dict.keys[cleanCode]) {
            const entry = dict.keys[cleanCode];
            return displayMode === 'Fluent' && entry.fluent ? entry.fluent : (entry.text || kCode.replace('KC_', ''));
        }
        return null;
    };

    if (complex) {
        const dictMod = getDictLabel(complex.mod);
        const dictBase = getDictLabel(complex.base);
        const hasFluentMod = displayMode === 'Fluent' && (dictMod || !!FLUENT_MAP[complex.mod]);
        const baseStrRaw = complex.base.replace('KC_', '');
        const hasFluentBase = displayMode === 'Fluent' && (dictBase || !!FLUENT_MAP[baseStrRaw]);
        const modStr = dictMod || (hasFluentMod ? FLUENT_MAP[complex.mod] : (SYMBOL_MAP[complex.mod] || complex.mod));
        const baseStr = dictBase || (hasFluentBase ? FLUENT_MAP[baseStrRaw] : (SYMBOL_MAP[baseStrRaw] || baseStrRaw));
        displayText = `${modStr}${complex.symbol}${baseStr}`;
        if (hasFluentMod || hasFluentBase) isFluentIcon = true;
    } else {
        const dictLabel = getDictLabel(raw);
        if (dictLabel) {
            displayText = dictLabel;
            const cleanCode = raw.startsWith('KC_') ? raw : `KC_${raw}`;
            const entry = dict.modifiers[cleanCode] || dict.keys[cleanCode];
            if (displayMode === 'Fluent' && entry) {
                if (entry.isFluent === true || (entry.fluent)) {
                    isFluentIcon = true;
                } else if (entry.isFluent === 'auto') {
                    isFluentIcon = (displayText.length === 1 && displayText.charCodeAt(0) >= 0xE000);
                }
            }
        } else if (displayMode === 'Fluent' && FLUENT_MAP[raw]) {
            displayText = FLUENT_MAP[raw];
            isFluentIcon = true;
        } else if (/^\d+,\d+$/.test(displayText)) {
            displayText = "";
        } else {
            displayText = SYMBOL_MAP[raw] || raw;
        }
    }

    const layerMatch = raw.match(/^(MO|TG|TT|OSL|TO|DF)\((\d+)\)$/);
    const ltMatch = raw.match(/^LT\((\d+),\s*(.+)\)$/);
    const fnMoMatch = raw.match(/^FN_MO(\d+)(\d*)$/);
    const isLayerKey = !!(layerMatch || ltMatch || fnMoMatch);
    const layerType = isLayerKey ? (layerMatch ? layerMatch[1] : (ltMatch ? 'LT' : 'FN')) : null;
    const layerNum = isLayerKey ? (layerMatch ? layerMatch[2] : (ltMatch ? ltMatch[1] : fnMoMatch[1])) : null;
    
    let tapLabel = '';
    let tapIsFluent = false;
    if (ltMatch) {
        const tKeyRaw = ltMatch[2];
        const dictLabel = getDictLabel(tKeyRaw);
        tapLabel = dictLabel || SYMBOL_MAP[tKeyRaw] || tKeyRaw.replace('KC_', '');
        const cleanTKey = tKeyRaw.replace('KC_', '');
        const entry = dict.keys[`KC_${cleanTKey}`] || dict.modifiers[`KC_${cleanTKey}`];
        if (displayMode === 'Fluent') {
            if (FLUENT_MAP[cleanTKey] || (entry && (entry.fluent || entry.isFluent))) {
                tapIsFluent = true;
                if (FLUENT_MAP[cleanTKey]) tapLabel = FLUENT_MAP[cleanTKey];
                else if (entry.fluent) tapLabel = entry.fluent;
            } else if (tapLabel.length === 1 && tapLabel.charCodeAt(0) >= 0xE000) {
                tapIsFluent = true;
            }
        }
    }

    return {
        fullRaw,
        displayText,
        isFluentIcon,
        isLayerKey,
        layerType,
        layerNum,
        tapLabel,
        tapIsFluent
    };
}
