import { isSVGAvailable } from '../svg-icons.js';
import { resolveKeycodeAlias } from '../keymap-dictionary.js';

const RGB_LABELS = {
    KC_RGB_TOG: 'TOG',
    KC_RGB_MOD: 'MODE+',
    KC_RGB_RMOD: 'MODE-',
    KC_RGB_HUI: 'HUE+',
    KC_RGB_HUD: 'HUE-',
    KC_RGB_SAI: 'SAT+',
    KC_RGB_SAD: 'SAT-',
    KC_RGB_VAI: 'BRT+',
    KC_RGB_VAD: 'BRT-',
    KC_RGB_SPI: 'SPD+',
    KC_RGB_SPD: 'SPD-',
    KC_RGB_M_P: 'RGB M P',
    KC_RGB_M_B: 'RGB M B',
    KC_RGB_M_R: 'RGB M R',
    KC_RGB_M_SW: 'RGB M SW',
    KC_RGB_M_SN: 'RGB M SN',
    KC_RGB_M_K: 'RGB M K',
    KC_RGB_M_X: 'RGB M X',
    KC_RGB_M_G: 'RGB M G',
    KC_RGB_M_T: 'RGB M T',
    KC_RGB_M_TW: 'RGB M TW',
    KC_RM_ON: 'RM ON',
    KC_RM_OFF: 'RM OFF',
    KC_RM_TOGG: 'RM TOG',
    KC_RM_NEXT: 'RM NEXT',
    KC_RM_PREV: 'RM PREV',
    KC_RM_HUEU: 'HUE+',
    KC_RM_HUED: 'HUE-',
    KC_RM_SATU: 'SAT+',
    KC_RM_SATD: 'SAT-',
    KC_RM_VALU: 'BRT+',
    KC_RM_VALD: 'BRT-',
    KC_RM_SPDU: 'SPD+',
    KC_RM_SPDD: 'SPD-',
    KC_RM_FLGN: 'FLG+',
    KC_RM_FLGP: 'FLG-'
};

const MACRO_LABELS = {
    KC_DM_REC1: 'REC1',
    KC_DM_REC2: 'REC2',
    KC_DM_PLY1: 'PLY1',
    KC_DM_PLY2: 'PLY2',
    KC_DM_RSTP: 'RSTP'
};

const WIRELESS_LABELS = {
    KC_OUT_AUTO: 'AUTO',
    KC_OUT_USB: 'USB',
    KC_OUT_BT: 'BT',
    KC_OUT_2G4: '2.4G',
    KC_BT_SEL_0: 'BT 1',
    KC_BT_SEL_1: 'BT 2',
    KC_BT_SEL_2: 'BT 3',
    KC_BT_SEL_3: 'BT 4',
    KC_BT_SEL_4: 'BT 5',
    KC_BT_NXT: 'NEXT',
    KC_BT_PRV: 'PREV',
    KC_BT_CLR: 'CLR',
    KC_BT_CLR_ALL: 'CLR ALL',
    KC_BT_TOGG: 'TOGG',
    KC_BT_ON: 'ON',
    KC_BT_OFF: 'OFF',
    OUT_AUTO: 'AUTO',
    OUT_USB: 'USB',
    OUT_BT: 'BT',
    OUT_2G4: '2.4G',
    BT_SEL_0: 'BT 1',
    BT_SEL_1: 'BT 2',
    BT_SEL_2: 'BT 3',
    BT_SEL_3: 'BT 4',
    BT_SEL_4: 'BT 5',
    BT_CLR: 'CLR',
    BT_CLR_ALL: 'CLR ALL',
    BT_TOGG: 'TOGG',
    BT_NXT: 'NEXT',
    BT_PRV: 'PREV',
    BT_ON: 'ON',
    BT_OFF: 'OFF'
};

const MOUSE_LABELS = {
    KC_MS_U: 'MS UP',
    KC_MS_D: 'MS DN',
    KC_MS_L: 'MS LT',
    KC_MS_R: 'MS RT',
    KC_BTN1: 'LCLK',
    KC_BTN2: 'RCLK',
    KC_BTN3: 'MCLK',
    KC_BTN4: 'BTN4',
    KC_BTN5: 'BTN5',
    KC_WH_U: 'WHL U',
    KC_WH_D: 'WHL D',
    KC_WH_L: 'WHL L',
    KC_WH_R: 'WHL R',
    KC_ACL0: 'ACL0',
    KC_ACL1: 'ACL1',
    KC_ACL2: 'ACL2',
    MS_U: 'MS UP',
    MS_D: 'MS DN',
    MS_L: 'MS LT',
    MS_R: 'MS RT',
    BTN1: 'LCLK',
    BTN2: 'RCLK',
    BTN3: 'MCLK',
    BTN4: 'BTN4',
    BTN5: 'BTN5',
    WH_U: 'WHL U',
    WH_D: 'WHL D',
    WH_L: 'WHL L',
    WH_R: 'WHL R',
    ACL0: 'ACL0',
    ACL1: 'ACL1',
    ACL2: 'ACL2'
};

const WEB_LABELS = {
    KC_WWW_HOME: 'HOME',
    KC_WWW_SEARCH: 'SRCH',
    KC_WWW_FAVORITES: 'FAV',
    KC_WWW_REFRESH: 'RLOD',
    KC_WWW_BACK: 'BACK',
    KC_WWW_FORWARD: 'FWD',
    KC_WWW_STOP: 'STOP',
    WHOM: 'HOME',
    WSRC: 'SRCH',
    WFAV: 'FAV',
    WREF: 'RLOD',
    WBAK: 'BACK',
    WFWD: 'FWD',
    WSTP: 'STOP'
};

const UTILITY_LABELS = {
    KC_EE_CLR: 'EE CLR',
    QK_CLEAR_EEPROM: 'EE CLR',
    EE_CLR: 'EE CLR'
};

export function narrowSlash(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/\s+\/\s+/g, '\u200a/\u200a');
}

export function buildDisplayRaw(fullRaw, val) {
    if (typeof val === 'string' && val.trim()) {
        return val.trim().toUpperCase();
    }
    return fullRaw ? fullRaw.toUpperCase() : '';
}

export function normalizeTargetIconKey(displayRaw) {
    const normalizedAlias = resolveKeycodeAlias(displayRaw);
    if (['KC_LSHIFT', 'LSHIFT', 'LSFT'].includes(displayRaw)) {
        return 'KC_LSFT';
    }
    if (['KC_RSHIFT', 'RSHIFT', 'RSFT'].includes(displayRaw)) {
        return 'KC_RSFT';
    }
    return normalizedAlias || displayRaw;
}

export function shortenLabel(label) {
    if (!label) return label;
    const upper = label.toUpperCase();
    if (upper === 'SPACE') return 'SPC';
    if (upper === 'ENTER') return 'ENT';
    if (upper === 'ESCAPE') return 'ESC';
    return label;
}

export function getKeyCategory(kCode) {
    if (!kCode) return null;
    const upper = resolveKeycodeAlias(kCode) || kCode.toUpperCase();
    if (upper === 'QK_CLEAR_EEPROM' || upper === 'KC_EE_CLR' || upper === 'EE_CLR') return 'QK';
    if (upper.startsWith('KC_RGB_') || upper.startsWith('KC_RM_') || upper.startsWith('KC_LM_') || upper.startsWith('KC_BL_')) return 'RGB';

    if (
        upper.startsWith('KC_BT_') ||
        upper.startsWith('KC_OUT_') ||
        upper.startsWith('BT_') ||
        upper.startsWith('OUT_')
    ) {
        return 'WIRE';
    }

    if (
        upper.startsWith('KC_AUDIO_') ||
        upper.startsWith('KC_KB_VOLUME_') ||
        upper === 'KC_KB_MUTE' ||
        upper === 'KC_MUTE' ||
        upper === 'KC_VOLU' ||
        upper === 'KC_VOLD'
    ) {
        return 'SOUND';
    }

    if (
        upper.startsWith('KC_MEDIA_') ||
        ['KC_MNXT', 'KC_MPRV', 'KC_MSTP', 'KC_MPLY', 'KC_MSEL', 'KC_EJCT', 'KC_MFFD', 'KC_MRWD', 'KC_MEDIA_PLAY'].includes(upper)
    ) {
        return 'MEDIA';
    }

    if (
        upper.startsWith('KC_WWW_') ||
        ['KC_WBAK', 'KC_WFWD', 'KC_WREF', 'KC_WSTP', 'KC_WFAV', 'KC_WHOM', 'KC_WSRC'].some(prefix => upper.startsWith(prefix))
    ) {
        return 'WEB';
    }

    if (
        upper.startsWith('KC_MS_') ||
        upper.startsWith('KC_BTN') ||
        upper.startsWith('KC_WH_') ||
        upper.startsWith('KC_ACL') ||
        ['MS_U', 'MS_D', 'MS_L', 'MS_R', 'BTN1', 'BTN2', 'BTN3', 'BTN4', 'BTN5', 'WH_U', 'WH_D', 'WH_L', 'WH_R', 'ACL0', 'ACL1', 'ACL2'].some(prefix => upper.startsWith(prefix))
    ) {
        return 'MOUSE';
    }

    if (
        upper.includes('MAGIC_') ||
        ['KC_AG_TOGG', 'AG_TOGG', 'KC_CG_TOGG', 'CG_TOGG'].includes(upper)
    ) {
        return 'MAGIC';
    }

    if (
        upper.startsWith('KC_DM_') ||
        ['DM_REC', 'DM_PLY', 'DM_RSTP'].some(prefix => upper.includes(prefix))
    ) {
        return 'MACRO';
    }

    if (upper.startsWith('QK_')) {
        return 'QK';
    }

    return null;
}

export function getIconRenderState({ displayRaw, targetIconKey, displayMode, keyStyle, isModKey, modType }) {
    const isFluentMode = displayMode === 'Fluent';
    const normalizedDisplayRaw = resolveKeycodeAlias(displayRaw) || displayRaw;

    const isRGBKey = normalizedDisplayRaw.startsWith('KC_RGB_') ||
        normalizedDisplayRaw.startsWith('KC_RM_') ||
        normalizedDisplayRaw.startsWith('KC_LM_') ||
        normalizedDisplayRaw.startsWith('KC_BL_');
    const isRGBFluent = isRGBKey && isFluentMode && isSVGAvailable(targetIconKey);
    const rgbLabel = RGB_LABELS[targetIconKey] || RGB_LABELS[normalizedDisplayRaw] || '';

    const isShiftKey = ['KC_LSFT', 'KC_RSFT'].includes(targetIconKey);
    const isBottomMod = [
        'KC_LCTL', 'KC_RCTL', 'KC_LALT', 'KC_RALT', 'KC_LGUI', 'KC_RGUI', 'KC_APP', 'KC_FN',
        'KC_LCTRL', 'KC_RCTRL', 'KC_LOPTION', 'KC_ROPTION', 'KC_LCMD', 'KC_RCMD',
        'LCTL', 'RCTL', 'LALT', 'RALT', 'LGUI', 'RGUI', 'APP', 'FN'
    ].includes(targetIconKey);
    const isBaseModSvg = isModKey && modType === 'base' && (isShiftKey || (isBottomMod && keyStyle === 'Mac'));
    const actuallyShowingSvg = isFluentMode && isSVGAvailable(targetIconKey) && (
        (isModKey && modType === 'base') ? isBaseModSvg : true
    );

    const isMagicKey = targetIconKey.includes('MAGIC_TOGGLE_') || ['KC_AG_TOGG', 'AG_TOGG', 'KC_CG_TOGG', 'CG_TOGG'].includes(targetIconKey);
    const isMagicFluent = isMagicKey && isFluentMode && isSVGAvailable(targetIconKey);

    const isMacroKey = targetIconKey.startsWith('KC_DM_') || ['KC_DM_REC1', 'KC_DM_REC2', 'KC_DM_PLY1', 'KC_DM_PLY2', 'KC_DM_RSTP'].includes(targetIconKey);
    const isMacroFluent = isMacroKey && isFluentMode && isSVGAvailable(targetIconKey);
    const macroLabel = MACRO_LABELS[displayRaw] || MACRO_LABELS[normalizedDisplayRaw] || normalizedDisplayRaw.replace('KC_DM_', '').replace('KC_', '');

    const isWirelessKey = normalizedDisplayRaw.startsWith('KC_BT_') ||
        normalizedDisplayRaw.startsWith('KC_OUT_') ||
        normalizedDisplayRaw.startsWith('BT_') ||
        normalizedDisplayRaw.startsWith('OUT_') ||
        WIRELESS_LABELS[displayRaw] !== undefined ||
        WIRELESS_LABELS[normalizedDisplayRaw] !== undefined;
    const isWirelessFluent = isWirelessKey && isFluentMode && isSVGAvailable(targetIconKey);
    const wirelessLabel = WIRELESS_LABELS[displayRaw] || WIRELESS_LABELS[normalizedDisplayRaw] || '';

    const isMouseKey = normalizedDisplayRaw.startsWith('KC_MS_') ||
        normalizedDisplayRaw.startsWith('KC_BTN') ||
        normalizedDisplayRaw.startsWith('KC_WH_') ||
        normalizedDisplayRaw.startsWith('KC_ACL') ||
        ['MS_', 'BTN', 'WH_', 'ACL'].some(prefix => normalizedDisplayRaw.startsWith(prefix)) ||
        MOUSE_LABELS[displayRaw] !== undefined ||
        MOUSE_LABELS[normalizedDisplayRaw] !== undefined;
    const isMouseFluent = isMouseKey && isFluentMode && isSVGAvailable(targetIconKey);
    const mouseLabel = MOUSE_LABELS[displayRaw] || MOUSE_LABELS[normalizedDisplayRaw] || '';

    const isWebKey = normalizedDisplayRaw.startsWith('KC_WWW_') ||
        ['KC_WBAK', 'KC_WFWD', 'KC_WREF', 'KC_WSTP', 'KC_WFAV', 'KC_WHOM', 'KC_WSRC'].some(prefix => normalizedDisplayRaw.startsWith(prefix)) ||
        WEB_LABELS[displayRaw] !== undefined ||
        WEB_LABELS[normalizedDisplayRaw] !== undefined;
    const isWebFluent = isWebKey && isFluentMode && isSVGAvailable(targetIconKey);
    const webLabel = WEB_LABELS[displayRaw] || WEB_LABELS[normalizedDisplayRaw] || '';

    const isUtilityKey = UTILITY_LABELS[displayRaw] !== undefined || UTILITY_LABELS[normalizedDisplayRaw] !== undefined;
    const isUtilityFluent = isUtilityKey && isFluentMode && isSVGAvailable(targetIconKey);
    const utilityLabel = UTILITY_LABELS[displayRaw] || UTILITY_LABELS[normalizedDisplayRaw] || '';

    return {
        isFluentMode,
        isRGBKey,
        isRGBFluent,
        rgbLabel,
        actuallyShowingSvg,
        isMagicKey,
        isMagicFluent,
        isMacroKey,
        isMacroFluent,
        macroLabel,
        isWirelessKey,
        isWirelessFluent,
        wirelessLabel,
        isMouseKey,
        isMouseFluent,
        mouseLabel,
        isWebKey,
        isWebFluent,
        webLabel,
        isUtilityKey,
        isUtilityFluent,
        utilityLabel
    };
}

export function buildStandardDisplayModel({
    displayMode,
    displayRaw,
    displayRawForRGB,
    targetIconKey,
    finalDisplayText,
    isFluentIcon,
    manualWrap,
    canWrap,
    targetScale,
    kWidth,
    iconState
}) {
    const resolvedIconKey = targetIconKey || displayRawForRGB || displayRaw;
    const bottomLabelDescriptor = [
        { matches: iconState.isRGBFluent, label: iconState.rgbLabel, labelKey: 'rgb' },
        { matches: iconState.isMagicFluent, label: iconState.magicLabel, labelKey: 'magic' },
        { matches: iconState.isWirelessFluent, label: iconState.wirelessLabel, labelKey: 'wireless' },
        { matches: iconState.isWebFluent, label: iconState.webLabel, labelKey: 'web' },
        { matches: iconState.isMouseFluent, label: iconState.mouseLabel, labelKey: 'mouse' },
        { matches: iconState.isMacroFluent, label: iconState.macroLabel, labelKey: 'macro' },
        { matches: iconState.isUtilityFluent, label: iconState.utilityLabel, labelKey: 'utility' }
    ].find((entry) => entry.matches) || null;

    const categoryCaption = displayMode === 'Text'
        ? getKeyCategory(displayRaw)
        : null;

    return {
        route: 'standard',
        variant: bottomLabelDescriptor
            ? 'icon-bottom-label'
            : (displayMode === 'Fluent' && isSVGAvailable(targetIconKey || displayRaw) ? 'center-svg' : 'text'),
        resolvedIconKey,
        centerText: finalDisplayText,
        isFluentCenter: isFluentIcon,
        manualWrap,
        canWrap,
        targetScale,
        kWidth,
        textScalePreset: (iconState.isWirelessKey || iconState.isMouseKey || iconState.isWebKey) ? 0.62 : null,
        bottomLabel: bottomLabelDescriptor ? bottomLabelDescriptor.label : null,
        bottomLabelKind: bottomLabelDescriptor ? bottomLabelDescriptor.labelKey : null,
        bottomCaption: categoryCaption
    };
}

export function buildModDisplayModel({
    modType,
    finalDisplayText,
    displayMode,
    kWidth,
    targetScale,
    targetIconKey,
    modKeys,
    canWrap,
    baseLabel,
    baseIsFluent,
    keyStyle,
    modLabel,
    iconState
}) {
    return {
        route: 'mod',
        variant: modType,
        centerText: finalDisplayText,
        displayMode,
        kWidth,
        targetScale,
        iconKey: targetIconKey,
        modKeys,
        canWrap,
        baseLabel,
        baseIsFluent,
        keyStyle,
        modLabel,
        actuallyShowingSvg: iconState.actuallyShowingSvg,
        textScalePreset: (iconState.isWirelessKey || iconState.isMouseKey) ? 0.62 : null
    };
}

export function buildLayerDisplayModel({
    layerNum2,
    layerType,
    layerNum,
    tapIsFluent,
    tapLabel,
    kWidth,
    targetScale
}) {
    return {
        route: 'layer',
        variant: layerNum2 ? 'fn-offset' : (layerType === 'LT' ? 'lt-offset' : 'single'),
        topTag: layerNum2 ? 'FN' : layerType,
        primaryText: layerNum2 ? `L${layerNum}` : (layerType === 'LT' ? tapLabel : `L${layerNum}`),
        secondaryText: layerNum2 ? `L${layerNum2}` : (layerType === 'LT' ? `L${layerNum}` : null),
        primaryIsFluent: layerNum2 ? false : tapIsFluent,
        bottomCaption: layerNum2 ? `FN${layerNum}+${layerNum2}` : null,
        layerNum,
        kWidth,
        targetScale
    };
}
