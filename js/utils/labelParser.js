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
        const modMap = { 'LCTL': 'CTRL', 'RCTL': 'CTRL', 'LSFT': 'SHFT', 'RSFT': 'SHFT', 'LALT': 'ALT', 'RALT': 'ALT', 'LGUI': 'GUI', 'RGUI': 'GUI' };
        if (m) complex = { type: 'mt', mod: modMap[m[1]] || m[1], base: m[2], symbol: '/' };
    }
    if (!complex) {
        m = fullRaw.match(/^(LCTL_T|LSFT_T|LALT_T|LGUI_T|RCTL_T|RSFT_T|RALT_T|RGUI_T)\((.+)\)$/);
        const modMap = {
            'LCTL_T': 'CTRL', 'RCTL_T': 'CTRL',
            'LSFT_T': 'SHFT', 'RSFT_T': 'SHFT',
            'LALT_T': 'ALT', 'RALT_T': 'ALT',
            'LGUI_T': 'GUI', 'RGUI_T': 'GUI'
        };
        if (m) complex = { type: 'mt', mod: modMap[m[1]], base: m[2], symbol: '/' };
    }
    if (!complex) {
        let activeMods = [];
        let currentRaw = fullRaw;
        let matched = true;
        const modWrapperMap = {
            'LCTL': 'CTRL', 'RCTL': 'CTRL', 'LSFT': 'SHFT', 'RSFT': 'SHFT',
            'LALT': 'ALT', 'RALT': 'ALT', 'LGUI': 'GUI', 'RGUI': 'GUI',
            'A': 'ALT', 'C': 'CTRL', 'S': 'SHFT', 'G': 'GUI',
            'LCA': 'CTRL+ALT', 'LSA': 'SHFT+ALT', 'RSA': 'SHFT+ALT', 'RCS': 'CTRL+SHFT',
            'LCG': 'CTRL+GUI', 'RCG': 'CTRL+GUI', 'LSG': 'SHFT+GUI', 'RSG': 'SHFT+GUI',
            'LAG': 'ALT+GUI', 'RAG': 'ALT+GUI', 'MEH': 'CTRL+ALT+SHFT', 'HYPR': 'CTRL+ALT+SHFT+GUI'
        };
        
        while (matched) {
            matched = false;
            let mw = currentRaw.match(/^(LCTL|LSFT|LALT|LGUI|RCTL|RSFT|RALT|RGUI|A|C|S|G|LCA|LSA|RSA|RCS|LCG|RCG|LSG|RSG|LAG|RAG|MEH|HYPR)\((.+)\)$/);
            if (mw) {
                const modName = modWrapperMap[mw[1]];
                if (modName) {
                    const parts = modName.split('+');
                    activeMods.push(...parts);
                    currentRaw = mw[2];
                    matched = true;
                }
            }
        }
        
        if (activeMods.length > 0) {
            const uniqueMods = [...new Set(activeMods)];
            complex = {
                type: 'mod',
                mod: uniqueMods.join('+'),
                base: currentRaw,
                symbol: '+'
            };
        }
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
    const fnMoMatch = raw.match(/^FN_MO(\d)(\d)$/); // FN_MO13 などに対応
    const isLayerKey = !!(layerMatch || ltMatch || fnMoMatch);
    const layerType = isLayerKey ? (layerMatch ? layerMatch[1] : (ltMatch ? 'LT' : 'FN')) : null;
    const layerNum = isLayerKey ? (layerMatch ? layerMatch[2] : (ltMatch ? ltMatch[1] : (fnMoMatch ? fnMoMatch[1] : null))) : null;
    const layerNum2 = (fnMoMatch && fnMoMatch[2]) ? fnMoMatch[2] : null;
    
    let tapLabel = '';
    let tapIsFluent = false;
    if (ltMatch) {
        const tKeyRaw = ltMatch[2];
        const dictLabel = getDictLabel(tKeyRaw);
        tapLabel = dictLabel || SYMBOL_MAP[tKeyRaw] || tKeyRaw.replace('KC_', '');
        const cleanTKey = tKeyRaw.replace('KC_', '');
        const entry = dict.keys[`KC_${cleanTKey}`] || dict.modifiers[`KC_${cleanTKey}`];
        if (displayMode === 'Fluent') {
            if (entry && entry.fluent) {
                tapIsFluent = true;
                tapLabel = entry.fluent;
            } else if (FLUENT_MAP[cleanTKey]) {
                tapIsFluent = true;
                tapLabel = FLUENT_MAP[cleanTKey];
            } else if (tapLabel.length === 1 && tapLabel.charCodeAt(0) >= 0xE000) {
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
    const baseMods = ['KC_LSFT', 'KC_RSFT', 'KC_LCTL', 'KC_RCTL', 'KC_LALT', 'KC_RALT', 'KC_LGUI', 'KC_RGUI'];
    const isBaseMod = baseMods.includes(cleanRaw);

    if (isBaseMod) {
        isModKey = true;
        modType = 'base';
        const baseModMap = {
            'KC_LSFT': 'SHFT', 'KC_RSFT': 'SHFT',
            'KC_LCTL': 'CTRL', 'KC_RCTL': 'CTRL',
            'KC_LALT': 'ALT', 'KC_RALT': 'ALT',
            'KC_LGUI': 'GUI', 'KC_RGUI': 'GUI'
        };
        modLabel = baseModMap[cleanRaw] || cleanRaw.replace('KC_', '');
        modKeys = [modLabel];
    } else if (complex && (complex.type === 'mt' || complex.type === 'mod')) {
        isModKey = true;
        modType = complex.type === 'mt' ? 'tap' : 'direct';
        
        if (complex.mod === 'CTRL+ALT+SHFT') {
            modKeys = ['CTRL', 'ALT', 'SHFT'];
        } else if (complex.mod === 'CTRL+ALT+SHFT+GUI') {
            modKeys = ['CTRL', 'ALT', 'SHFT', 'GUI'];
        } else {
            modKeys = complex.mod.split('+').map(k => k.trim());
        }

        const cleanModStr = complex.mod.toUpperCase().replace(/\s+/g, '');
        if (cleanModStr === 'CTRL+ALT+SHFT') {
            modLabel = 'MEH';
        } else if (cleanModStr === 'CTRL+ALT+SHFT+GUI' || cleanModStr === 'CTRL+ALT+SHIFT+GUI') {
            modLabel = 'HYPR';
        } else if (modKeys.length > 1) {
            const shortMap = { 'CTRL': 'C', 'SHIFT': 'S', 'SHFT': 'S', 'ALT': 'A', 'GUI': 'G', 'WIN': 'G', 'CMD': 'G' };
            modLabel = modKeys.map(k => shortMap[k.toUpperCase()] || k).join('+');
        } else {
            modLabel = complex.mod;
        }

        const baseRaw = complex.base;
        const dictBase = getDictLabel(baseRaw);
        const baseClean = baseRaw.replace('KC_', '');
        baseLabel = dictBase || SYMBOL_MAP[baseClean] || baseClean;
        
        if (displayMode === 'Fluent') {
            const entry = dict.keys[`KC_${baseClean}`] || dict.modifiers[`KC_${baseClean}`];
            if (entry && entry.fluent) {
                baseIsFluent = true;
                baseLabel = entry.fluent;
            } else if (FLUENT_MAP[baseClean]) {
                baseIsFluent = true;
                baseLabel = FLUENT_MAP[baseClean];
            } else if (baseLabel.length === 1 && baseLabel.charCodeAt(0) >= 0xE000) {
                baseIsFluent = true;
            }
        }
    }

    // 文字数・視覚的重みの計算
    let visualWeight = displayText.length;
    if (isFluentIcon) visualWeight = 1.2; // アイコンは少し大きめにカウント
    if (complex) visualWeight += 0.5; // 複合キーは密度が高い

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
        baseIsFluent
    };
}
