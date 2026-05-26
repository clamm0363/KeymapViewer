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
    KC_RGB_SPD: 'SPD-'
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

export function narrowSlash(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/\s+\/\s+/g, '\u200a/\u200a');
}

export function buildDisplayRaw(fullRaw, val) {
    const cleanRaw = fullRaw ? fullRaw.toUpperCase() : '';
    return (val && typeof val === 'string' && val.toUpperCase().startsWith('KC_'))
        ? val.toUpperCase()
        : (cleanRaw.startsWith('KC_') ? cleanRaw : 'KC_' + cleanRaw);
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
    const upper = kCode.toUpperCase();
    if (upper.startsWith('KC_RGB_')) return 'RGB';

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

    return null;
}

export function getIconRenderState({ displayRaw, targetIconKey, displayMode, keyStyle, isModKey, modType }) {
    const isFluentMode = displayMode === 'Fluent';
    const normalizedDisplayRaw = resolveKeycodeAlias(displayRaw) || displayRaw;

    const isRGBKey = normalizedDisplayRaw.startsWith('KC_RGB_');
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
        webLabel
    };
}
