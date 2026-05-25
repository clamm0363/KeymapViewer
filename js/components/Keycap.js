const { createElement } = React;

import { FLUENT_FONT_STACK } from '../constants.js';
import { createSVGElement, isSVGAvailable } from '../svg-icons.js';
import { parseKeyLabel } from '../utils/labelParser.js';

// Shared footer skeleton and text styling utilities for visual consistency across all keytypes
const getFooterContainerStyle = (isLight, isAppDark) => ({
    marginTop: 'auto',
    width: '100%',
    height: '18px',
    display: 'flex',
    zIndex: 10,
    overflow: 'hidden',
    borderBottomLeftRadius: '3px',
    borderBottomRightRadius: '3px',
    borderTop: `2px solid ${isLight ? (isAppDark ? '#94a3b8' : '#cbd5e1') : (isAppDark ? '#475569' : '#334155')}`
});

const getFooterTextStyle = (scale = 0.72, translateY = 0, fontSize = '14px') => {
    const baseFontSize = parseFloat(fontSize);
    const computedSize = Math.round(baseFontSize * scale * 100) / 100;
    return {
        fontSize: `${computedSize}px`,
        fontWeight: '500',
        fontFamily: '"Outfit", "Arial", "Helvetica", sans-serif',
        letterSpacing: '0.05em',
        lineHeight: '1',
        transform: translateY !== 0 ? `translateY(${translateY}px)` : 'none',
        whiteSpace: 'nowrap'
    };
};

// Shared layout and offset styling utilities for offset-legend keycaps (e.g., LT, FN_MO13)
const getOffsetContainerStyle = () => ({
    flex: 1,
    position: 'relative',
    width: '100%'
});

const getOffsetPrimaryStyle = (isLight, isFluent = false, customFontSize = null) => {
    const baseFontSize = parseFloat(customFontSize || (isFluent ? '26' : '22'));
    const computedSize = Math.round(baseFontSize * 0.75 * 100) / 100;
    return {
        position: 'absolute',
        left: '6px',
        bottom: '3.5px',
        fontSize: `${computedSize}px`,
        fontWeight: '400',
        fontFamily: isFluent 
            ? FLUENT_FONT_STACK.primary
            : FLUENT_FONT_STACK.fallback,
        color: isLight ? '#1e293b' : '#fff',
        lineHeight: '1'
    };
};

const getOffsetSecondaryStyle = (isLight) => ({
    position: 'absolute',
    right: '6px',
    top: '3px',
    fontSize: '12px',
    fontWeight: '400',
    fontFamily: '"Outfit", "Arial", "Helvetica", sans-serif',
    color: isLight ? '#64748b' : '#94a3b8',
    opacity: 0.8,
    lineHeight: '1'
});

// Calculate text category for bottom-right badges in Text mode
const getKeyCategory = (kCode) => {
    if (!kCode) return null;
    const upper = kCode.toUpperCase();
    if (upper.startsWith('KC_RGB_')) return 'RGB';
    
    // WIRELESS category
    if (
        upper.startsWith('KC_BT_') || 
        upper.startsWith('KC_OUT_') ||
        upper.startsWith('BT_') ||
        upper.startsWith('OUT_')
    ) {
        return 'WIRE';
    }
    
    // SOUND category
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
    
    // MEDIA category
    if (
        upper.startsWith('KC_MEDIA_') ||
        ['KC_MNXT', 'KC_MPRV', 'KC_MSTP', 'KC_MPLY', 'KC_MSEL', 'KC_EJCT', 'KC_MFFD', 'KC_MRWD', 'KC_MEDIA_PLAY'].includes(upper)
    ) {
        return 'MEDIA';
    }

    // WEB category
    if (
        upper.startsWith('KC_WWW_') ||
        ['KC_WBAK', 'KC_WFWD', 'KC_WREF', 'KC_WSTP', 'KC_WFAV', 'KC_WHOM', 'KC_WSRC'].some(prefix => upper.startsWith(prefix))
    ) {
        return 'WEB';
    }
    
    // MOUSE category
    if (
        upper.startsWith('KC_MS_') || 
        upper.startsWith('KC_BTN') || 
        upper.startsWith('KC_WH_') ||
        upper.startsWith('KC_ACL') ||
        ['MS_U', 'MS_D', 'MS_L', 'MS_R', 'BTN1', 'BTN2', 'BTN3', 'BTN4', 'BTN5', 'WH_U', 'WH_D', 'WH_L', 'WH_R', 'ACL0', 'ACL1', 'ACL2'].some(prefix => upper.startsWith(prefix))
    ) {
        return 'MOUSE';
    }

    // MAGIC category
    if (
        upper.includes('MAGIC_') || 
        ['KC_AG_TOGG', 'AG_TOGG', 'KC_CG_TOGG', 'CG_TOGG'].includes(upper)
    ) {
        return 'MAGIC';
    }

    // MACRO category
    if (
        upper.startsWith('KC_DM_') ||
        ['DM_REC', 'DM_PLY', 'DM_RSTP'].some(prefix => upper.includes(prefix))
    ) {
        return 'MACRO';
    }
    
    return null;
};

// Calculate text scale based on character length and key width to maintain physical harmony
const getTextScale = (displayText, keyWidth = 1, isFluentIcon = false) => {
    let textScale = 1.0;
    if (!isFluentIcon && displayText) {
        const isFunctionKey = /^F\d+$/.test(displayText);
        if (isFunctionKey) {
            textScale = 1.0;
        } else {
            const len = displayText.length;
            if (len === 3) {
                textScale = keyWidth >= 1.25 ? 0.85 : 0.62;
            }
            else if (len === 4) {
                textScale = keyWidth >= 1.25 ? 0.85 : 0.62;
            }
            else if (len >= 5) {
                if (keyWidth >= 2.0) {
                    textScale = 0.85;
                } else if (keyWidth >= 1.25) {
                    textScale = 0.70;
                } else {
                    // 1uキーキャップでの文字数ごとの微細な最適化
                    if (len === 5) {
                        textScale = 0.62;
                    } else if (len === 6) {
                        textScale = 0.58;
                    } else {
                        textScale = 0.50;
                    }
                }
            }
        }
    }
    return textScale;
};

// Shared main legend styling utility for standard/modifier/layer text keycaps to enforce strict size harmony
const getMainLegendStyle = (isLight, displayText, isFluentIcon = false, keyWidth = 1, customOverrides = {}) => {
    const textScale = getTextScale(displayText, keyWidth, isFluentIcon);
    const baseFontSize = 22;
    const computedFontSize = isFluentIcon ? baseFontSize : Math.round(baseFontSize * textScale * 100) / 100;

    const baseStyle = {
        color: isLight ? '#1e293b' : '#fff',
        fontWeight: '400',
        fontFamily: isFluentIcon 
            ? (displayText === '\uE986' ? FLUENT_FONT_STACK.jpKana : FLUENT_FONT_STACK.primary)
            : FLUENT_FONT_STACK.fallback,
        fontSize: `${computedFontSize}px`,
        lineHeight: '1',
        transform: isFluentIcon ? 'translateY(1.5px)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        width: '100%',
        overflow: 'visible',
        whiteSpace: 'nowrap'
    };

    return {
        ...baseStyle,
        ...customOverrides
    };
};

const getLayerFooterColor = (num, isLight) => {
    const lightColors = ['#64748b', '#2563eb', '#4f46e5', '#0891b2', '#10b981', '#f59e0b', '#ea580c', '#e11d48', '#9333ea', '#0284c7'];
    const darkColors = ['#475569', '#1e40af', '#3730a3', '#155e75', '#065f46', '#92400e', '#9a3412', '#9f1239', '#6b21a8', '#075985'];
    return (isLight ? lightColors : darkColors)[num % 10];
};

const getModColor = (mod, isLight) => {
    if (!mod) return isLight ? '#475569' : '#334155';
    const cleanMod = mod.toUpperCase();
    const palettes = {
        SHIFT: { light: '#c2410c', dark: '#ea580c' },
        SHFT:  { light: '#c2410c', dark: '#ea580c' },
        CTRL:  { light: '#0369a1', dark: '#0284c7' },
        ALT:   { light: '#6d28d9', dark: '#7c3aed' },
        GUI:   { light: '#065f46', dark: '#059669' },
        WIN:   { light: '#065f46', dark: '#059669' },
        CMD:   { light: '#065f46', dark: '#059669' }
    };
    const entry = palettes[cleanMod] || { light: '#475569', dark: '#334155' };
    return isLight ? entry.light : entry.dark;
};

const getModGradient = (mKeys, isLight) => {
    if (!mKeys || mKeys.length === 0) return isLight ? '#64748b' : '#475569';
    if (mKeys.length === 1) return getModColor(mKeys[0], isLight);
    
    const colorStops = mKeys.map((m, idx) => {
        const color = getModColor(m, isLight);
        const startPerc = (idx / mKeys.length) * 100;
        const endPerc = ((idx + 1) / mKeys.length) * 100;
        return `${color} ${startPerc}%, ${color} ${endPerc}%`;
    });
    return `linear-gradient(to right, ${colorStops.join(', ')})`;
};

const getEncoderActions = (encodersSource, encoderIdx, layerIdx) => {
    if (!encodersSource || !encodersSource[encoderIdx]) return null;
    const encData = encodersSource[encoderIdx];
    if (encData && encData[layerIdx]) {
        return encData[layerIdx];
    }
    return null;
};

export function Keycap({
    k,
    val,
    i,
    displayMode,
    keyStyle,
    macroAliases,
    onMacroClick,
    encoderStyles,
    layer,
    design,
    externalMap,
    isLight,
    isAppDark
}) {
    const getKeycapFrameStyle = (k, isLayerKey) => {
        const paddingOffset = 20;
        const lightBorder = isAppDark ? '#94a3b8' : '#cbd5e1';
        const darkBorder = isAppDark ? '#475569' : '#334155';
        
        if (k.isEncoder) {
            const currentStyle = (encoderStyles && encoderStyles[k.encoderIndex]) || 'Dial';
            if (currentStyle === 'VerticalWheel') {
                const wellW = 33;
                const wellH = 44;
                const leftOffset = (k.w - 6) / 2 - wellW / 2;
                const topOffset = (k.h - 6) / 2 - wellH / 2;
                return {
                    left: `${k.x + paddingOffset + leftOffset}px`,
                    top: `${k.y + paddingOffset + topOffset}px`,
                    width: `${wellW}px`,
                    height: `${wellH}px`,
                    position: 'absolute',
                    borderRadius: '6px',
                    border: `1.5px solid ${isLight ? (isAppDark ? '#94a3b8' : '#cbd5e1') : (isAppDark ? '#1e293b' : '#334155')}`,
                    background: isLight 
                        ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)' 
                        : 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
                    boxShadow: isLight
                        ? 'inset 0 3px 6px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.05)'
                        : 'inset 0 4px 8px rgba(0,0,0,0.65), 0 1px 2px rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 40
                };
            } else if (currentStyle === 'HorizontalWheel') {
                const wellW = 44;
                const wellH = 33;
                const leftOffset = (k.w - 6) / 2 - wellW / 2;
                const topOffset = (k.h - 6) / 2 - wellH / 2;
                return {
                    left: `${k.x + paddingOffset + leftOffset}px`,
                    top: `${k.y + paddingOffset + topOffset}px`,
                    width: `${wellW}px`,
                    height: `${wellH}px`,
                    position: 'absolute',
                    borderRadius: '6px',
                    border: `1.5px solid ${isLight ? (isAppDark ? '#94a3b8' : '#cbd5e1') : (isAppDark ? '#1e293b' : '#334155')}`,
                    background: isLight 
                        ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)' 
                        : 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
                    boxShadow: isLight
                        ? 'inset 0 3px 6px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.05)'
                        : 'inset 0 4px 8px rgba(0,0,0,0.65), 0 1px 2px rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 40
                };
            } else {
                const knobSize = 44;
                const leftOffset = (k.w - 6) / 2 - knobSize / 2;
                const topOffset = (k.h - 6) / 2 - knobSize / 2;
                return {
                    left: `${k.x + paddingOffset + leftOffset}px`,
                    top: `${k.y + paddingOffset + topOffset}px`,
                    width: `${knobSize}px`,
                    height: `${knobSize}px`,
                    position: 'absolute',
                    borderRadius: '50%',
                    borderWidth: '3px',
                    borderStyle: 'solid',
                    borderColor: isLight ? lightBorder : darkBorder,
                    background: isLight 
                        ? 'radial-gradient(circle at 35% 35%, #ffffff 0%, #f1f5f9 50%, #cbd5e1 100%)' 
                        : 'radial-gradient(circle at 35% 35%, #334155 0%, #1e293b 50%, #0f172a 100%)',
                    boxShadow: isLight 
                        ? '0 6px 10px -1px rgb(0 0 0 / 0.15), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.1)' 
                        : '0 10px 15px -3px rgb(0 0 0 / 0.3), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -4px 6px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    transition: 'all 0.075s ease',
                    cursor: 'pointer',
                    zIndex: 40
                };
            }
        }
        
        if (k.isJIS) {
            return {
                left: `${k.x + paddingOffset}px`,
                top: `${k.y + paddingOffset}px`,
                width: `${k.w - 6}px`,
                height: `${k.h - 6}px`,
                position: 'absolute',
                border: 'none',
                background: 'transparent',
                boxShadow: 'none',
                overflow: 'visible',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.075s ease'
            };
        }
        
        return {
            left: `${k.x + paddingOffset}px`,
            top: `${k.y + paddingOffset}px`,
            width: `${k.w - 6}px`,
            height: `${k.h - 6}px`,
            position: 'absolute',
            borderRadius: '6px',
            borderWidth: '3px',
            borderStyle: 'solid',
            borderColor: isLight ? lightBorder : darkBorder,
            backgroundColor: isLight ? '#ffffff' : (isAppDark ? 'rgba(15, 23, 42, 0.6)' : '#1e293b'),
            boxShadow: isLight ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : '0 20px 25px -5px rgb(0 0 0 / 0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.075s ease'
        };
    };

    const parsed = parseKeyLabel(val, k.id, displayMode, keyStyle, macroAliases);
    let {
        fullRaw, displayText, isFluentIcon, isLayerKey,
        layerType, layerNum, layerNum2, tapLabel, tapIsFluent, visualWeight,
        isModKey, modType, modLabel, modKeys, baseLabel, baseIsFluent
    } = parsed;

    const narrowSlash = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/\s+\/\s+/g, '\u200a/\u200a');
    };

    displayText = narrowSlash(displayText);
    tapLabel = narrowSlash(tapLabel);
    baseLabel = narrowSlash(baseLabel);
    modLabel = narrowSlash(modLabel);

    const cleanRawForRGB = fullRaw ? fullRaw.toUpperCase() : '';
    const displayRawForRGB = (val && typeof val === 'string' && val.toUpperCase().startsWith('KC_'))
        ? val.toUpperCase()
        : (cleanRawForRGB.startsWith('KC_') ? cleanRawForRGB : 'KC_' + cleanRawForRGB);
    const isRGBKey = displayRawForRGB.startsWith('KC_RGB_');
    const rgbLabels = {
        "KC_RGB_TOG": "TOG",
        "KC_RGB_MOD": "MODE+",
        "KC_RGB_RMOD": "MODE-",
        "KC_RGB_HUI": "HUE+",
        "KC_RGB_HUD": "HUE-",
        "KC_RGB_SAI": "SAT+",
        "KC_RGB_SAD": "SAT-",
        "KC_RGB_VAI": "BRT+",
        "KC_RGB_VAD": "BRT-",
        "KC_RGB_SPI": "SPD+",
        "KC_RGB_SPD": "SPD-"
    };
    const isFluentMode = (displayMode === 'Fluent');
    const isRGBFluent = isRGBKey && isFluentMode && isSVGAvailable(displayRawForRGB);
    const rgbLabel = rgbLabels[displayRawForRGB] || '';

    const isShiftKey = ['KC_LSFT', 'KC_RSFT', 'KC_LSHIFT', 'KC_RSHIFT', 'LSFT', 'RSFT', 'LSHIFT', 'RSHIFT'].includes(displayRawForRGB);
    const isBottomMod = [
        'KC_LCTL', 'KC_RCTL', 'KC_LALT', 'KC_RALT', 'KC_LGUI', 'KC_RGUI', 'KC_APP', 'KC_FN',
        'KC_LCTRL', 'KC_RCTRL', 'KC_LOPTION', 'KC_ROPTION', 'KC_LCMD', 'KC_RCMD',
        'LCTL', 'RCTL', 'LALT', 'RALT', 'LGUI', 'RGUI', 'APP', 'FN'
    ].includes(displayRawForRGB);
    const isBaseModSvg = isModKey && modType === 'base' && (
        isShiftKey || (isBottomMod && keyStyle === 'Mac')
    );
    const actuallyShowingSvg = isFluentMode && isSVGAvailable(displayRawForRGB) && (
        (isModKey && modType === 'base') ? isBaseModSvg : true
    );

    const isMagicKey = displayRawForRGB.includes('MAGIC_TOGGLE_') || ['KC_AG_TOGG', 'AG_TOGG', 'KC_CG_TOGG', 'CG_TOGG'].includes(displayRawForRGB);
    const isMagicFluent = isMagicKey && isFluentMode && isSVGAvailable(displayRawForRGB);

    const isMacroKey = displayRawForRGB.startsWith('KC_DM_') || ['KC_DM_REC1', 'KC_DM_REC2', 'KC_DM_PLY1', 'KC_DM_PLY2', 'KC_DM_RSTP'].includes(displayRawForRGB);
    const isMacroFluent = isMacroKey && isFluentMode && isSVGAvailable(displayRawForRGB);
    
    const macroLabels = {
        "KC_DM_REC1": "REC1",
        "KC_DM_REC2": "REC2",
        "KC_DM_PLY1": "PLY1",
        "KC_DM_PLY2": "PLY2",
        "KC_DM_RSTP": "RSTP"
    };
    const macroLabel = macroLabels[displayRawForRGB] || displayRawForRGB.replace('KC_DM_', '').replace('KC_', '');

    const wirelessLabels = {
        "KC_OUT_AUTO": "AUTO",
        "KC_OUT_USB": "USB",
        "KC_OUT_BT": "BT",
        "KC_OUT_2G4": "2.4G",
        "KC_BT_SEL_0": "BT 1",
        "KC_BT_SEL_1": "BT 2",
        "KC_BT_SEL_2": "BT 3",
        "KC_BT_SEL_3": "BT 4",
        "KC_BT_SEL_4": "BT 5",
        "KC_BT_NXT": "NEXT",
        "KC_BT_PRV": "PREV",
        "KC_BT_CLR": "CLR",
        "KC_BT_CLR_ALL": "CLR ALL",
        "KC_BT_TOGG": "TOGG",
        "KC_BT_ON": "ON",
        "KC_BT_OFF": "OFF",
        "OUT_AUTO": "AUTO",
        "OUT_USB": "USB",
        "OUT_BT": "BT",
        "OUT_2G4": "2.4G",
        "BT_SEL_0": "BT 1",
        "BT_SEL_1": "BT 2",
        "BT_SEL_2": "BT 3",
        "BT_SEL_3": "BT 4",
        "BT_SEL_4": "BT 5",
        "BT_CLR": "CLR",
        "BT_CLR_ALL": "CLR ALL",
        "BT_TOGG": "TOGG",
        "BT_NXT": "NEXT",
        "BT_PRV": "PREV",
        "BT_ON": "ON",
        "BT_OFF": "OFF"
    };
    const isWirelessKey = displayRawForRGB.startsWith('KC_BT_') || 
                          displayRawForRGB.startsWith('KC_OUT_') ||
                          displayRawForRGB.startsWith('BT_') ||
                          displayRawForRGB.startsWith('OUT_') ||
                          wirelessLabels[displayRawForRGB] !== undefined;
    const isWirelessFluent = isWirelessKey && isFluentMode && isSVGAvailable(displayRawForRGB);
    const wirelessLabel = wirelessLabels[displayRawForRGB] || '';

    const mouseLabels = {
        "KC_MS_U": "MS UP",
        "KC_MS_D": "MS DN",
        "KC_MS_L": "MS LT",
        "KC_MS_R": "MS RT",
        "KC_BTN1": "LCLK",
        "KC_BTN2": "RCLK",
        "KC_BTN3": "MCLK",
        "KC_BTN4": "BTN4",
        "KC_BTN5": "BTN5",
        "KC_WH_U": "WHL U",
        "KC_WH_D": "WHL D",
        "KC_WH_L": "WHL L",
        "KC_WH_R": "WHL R",
        "KC_ACL0": "ACL0",
        "KC_ACL1": "ACL1",
        "KC_ACL2": "ACL2",
        "MS_U": "MS UP",
        "MS_D": "MS DN",
        "MS_L": "MS LT",
        "MS_R": "MS RT",
        "BTN1": "LCLK",
        "BTN2": "RCLK",
        "BTN3": "MCLK",
        "BTN4": "BTN4",
        "BTN5": "BTN5",
        "WH_U": "WHL U",
        "WH_D": "WHL D",
        "WH_L": "WHL L",
        "WH_R": "WHL R",
        "ACL0": "ACL0",
        "ACL1": "ACL1",
        "ACL2": "ACL2"
    };
    const isMouseKey = displayRawForRGB.startsWith('KC_MS_') || 
                       displayRawForRGB.startsWith('KC_BTN') ||
                       displayRawForRGB.startsWith('KC_WH_') ||
                       displayRawForRGB.startsWith('KC_ACL') ||
                       ['MS_', 'BTN', 'WH_', 'ACL'].some(prefix => displayRawForRGB.startsWith(prefix)) ||
                       mouseLabels[displayRawForRGB] !== undefined;
    const isMouseFluent = isMouseKey && isFluentMode && isSVGAvailable(displayRawForRGB);
    const mouseLabel = mouseLabels[displayRawForRGB] || '';

    const webLabels = {
        "KC_WWW_HOME": "HOME",
        "KC_WWW_SEARCH": "SRCH",
        "KC_WWW_FAVORITES": "FAV",
        "KC_WWW_REFRESH": "RLOD",
        "KC_WWW_BACK": "BACK",
        "KC_WWW_FORWARD": "FWD",
        "KC_WWW_STOP": "STOP",
        "WHOM": "HOME",
        "WSRC": "SRCH",
        "WFAV": "FAV",
        "WREF": "RLOD",
        "WBAK": "BACK",
        "WFWD": "FWD",
        "WSTP": "STOP"
    };
    const isWebKey = displayRawForRGB.startsWith('KC_WWW_') ||
                      ['KC_WBAK', 'KC_WFWD', 'KC_WREF', 'KC_WSTP', 'KC_WFAV', 'KC_WHOM', 'KC_WSRC'].some(prefix => displayRawForRGB.startsWith(prefix)) ||
                      webLabels[displayRawForRGB] !== undefined;
    const isWebFluent = isWebKey && isFluentMode && isSVGAvailable(displayRawForRGB);
    const webLabel = webLabels[displayRawForRGB] || '';

    const is1u = (k.w || 56) / 56 < 1.25;
    const shortenLabel = (label) => {
        if (!label) return label;
        const upper = label.toUpperCase();
        if (upper === 'SPACE') return 'SPC';
        if (upper === 'ENTER') return 'ENT';
        if (upper === 'ESCAPE') return 'ESC';
        return label;
    };

    if (is1u) {
        displayText = shortenLabel(displayText);
        tapLabel = shortenLabel(tapLabel);
        baseLabel = shortenLabel(baseLabel);
    }

    const isFluentCenter = isFluentIcon || (isModKey && baseIsFluent);
    const centerText = (isModKey && modType !== 'base') ? baseLabel : displayText;

    if (k.isEncoder) {
        const currentStyle = (encoderStyles && encoderStyles[k.encoderIndex]) || 'Dial';
        const encodersSource = (externalMap && externalMap.encoders) || (design && design.encoders);
        const ccwActions = getEncoderActions(encodersSource, k.encoderIndex, layer);
        let ccwLabel = '';
        let cwLabel = '';
        let ccwCode = 'KC_NO';
        let cwCode = 'KC_NO';
        if (ccwActions) {
            ccwCode = ccwActions[0] || 'KC_NO';
            cwCode = ccwActions[1] || 'KC_NO';
            const parsedCcw = parseKeyLabel(ccwCode, ccwCode, 'Text', keyStyle, macroAliases);
            const parsedCw = parseKeyLabel(cwCode, cwCode, 'Text', keyStyle, macroAliases);
            ccwLabel = parsedCcw.displayText;
            cwLabel = parsedCw.displayText;
        }

        const parsedPush = parseKeyLabel(val, k.id, 'Text', keyStyle, macroAliases);
        const pushText = parsedPush.displayText;

        let tooltipText = `Encoder e${k.encoderIndex}\n`;
        tooltipText += `Push: ${pushText || 'None'} (${val || 'KC_NO'})`;
        if (ccwActions) {
            if (currentStyle === 'VerticalWheel') {
                tooltipText += `\nUP: ${cwLabel || 'None'} (${cwCode})`;
                tooltipText += `\nDOWN: ${ccwLabel || 'None'} (${ccwCode})`;
            } else if (currentStyle === 'HorizontalWheel') {
                tooltipText += `\nRIGHT: ${cwLabel || 'None'} (${cwCode})`;
                tooltipText += `\nLEFT: ${ccwLabel || 'None'} (${ccwCode})`;
            } else {
                tooltipText += `\nCW (Clockwise): ${cwLabel || 'None'} (${cwCode})`;
                tooltipText += `\nCCW (Counter-Clockwise): ${ccwLabel || 'None'} (${ccwCode})`;
            }
        }

        const cleanRaw = fullRaw ? fullRaw.toUpperCase() : '';
        const displayRaw = (val && typeof val === 'string' && val.toUpperCase().startsWith('KC_'))
            ? val.toUpperCase()
            : (cleanRaw.startsWith('KC_') ? cleanRaw : 'KC_' + cleanRaw);

        const containerClass = (currentStyle === 'VerticalWheel' || currentStyle === 'HorizontalWheel')
            ? 'encoder-wheel-container group'
            : 'key-cap encoder-knob group';

        let childElements = null;
        if (currentStyle === 'VerticalWheel') {
            const wheelBg = isLight
                ? `linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.45) 100%),
                   repeating-linear-gradient(to right, transparent, transparent 1px, rgba(0,0,0,0.18) 1px, rgba(0,0,0,0.18) 2px),
                   #94a3b8`
                : `linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(255,255,255,0.18) 15%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.7) 100%),
                   repeating-linear-gradient(to right, transparent, transparent 1px, rgba(0,0,0,0.38) 1px, rgba(0,0,0,0.38) 2px),
                   #334155`;
            childElements = [
                createElement('div', {
                    key: 'wheel-vertical',
                    className: 'w-[22px] h-[36px] rounded-[3px] transition-all duration-200 group-hover:scale-x-105 group-hover:brightness-110 shadow-md shadow-black/30 group-hover:shadow-blue-500/25',
                    style: {
                        background: wheelBg,
                        boxShadow: isLight
                            ? '0 2px 4px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.4)'
                            : '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
                    }
                })
            ];
        } else if (currentStyle === 'HorizontalWheel') {
            const wheelBg = isLight
                ? `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.45) 100%),
                   repeating-linear-gradient(to bottom, transparent, transparent 1px, rgba(0,0,0,0.18) 1px, rgba(0,0,0,0.18) 2px),
                   #94a3b8`
                : `linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(255,255,255,0.18) 15%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.7) 100%),
                   repeating-linear-gradient(to bottom, transparent, transparent 1px, rgba(0,0,0,0.38) 1px, rgba(0,0,0,0.38) 2px),
                   #334155`;
            childElements = [
                createElement('div', {
                    key: 'wheel-horizontal',
                    className: 'w-[36px] h-[22px] rounded-[3px] transition-all duration-200 group-hover:scale-y-105 group-hover:brightness-110 shadow-md shadow-black/30 group-hover:shadow-blue-500/25',
                    style: {
                        background: wheelBg,
                        boxShadow: isLight
                            ? '0 2px 4px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.4)'
                            : '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
                    }
                })
            ];
        } else {
            childElements = [
                createElement('div', {
                    key: 'knob-indicator',
                    className: 'knob-indicator',
                    style: {
                        position: 'absolute',
                        top: '4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '3.5px',
                        height: '8px',
                        borderRadius: '1.5px',
                        backgroundColor: isLight ? '#94a3b8' : '#64748b',
                        opacity: 0.8
                    }
                })
            ];
        }

        return createElement('div', {
            key: i,
            className: containerClass,
            title: tooltipText,
            'data-key-raw': displayRaw,
            onClick: (e) => {
                const macroMatch = fullRaw.match(/MACRO\((\d+)\)/);
                if (macroMatch && onMacroClick) {
                    e.stopPropagation();
                    onMacroClick(parseInt(macroMatch[1], 10));
                }
            },
            style: getKeycapFrameStyle(k, false)
        }, childElements);
    }

    let finalDisplayText = centerText;
    let manualWrap = false;
    
    const hasSlash = /[\s\u2009\u200a]*\/[\s\u2009\u200a]*/.test(centerText);
    if (centerText.length > 5 && (centerText.includes('_') || centerText.includes('-') || hasSlash)) {
        if (hasSlash) {
            const parts = centerText.split(/[\s\u2009\u200a]*\/[\s\u2009\u200a]*/);
            finalDisplayText = parts[0] + '\n' + parts[1];
            manualWrap = true;
        } else {
            const splitIdx = Math.max(centerText.lastIndexOf('_'), centerText.lastIndexOf('-'));
            if (splitIdx > 1 && splitIdx < centerText.length - 2) {
                finalDisplayText = centerText.substring(0, splitIdx) + '\n' + centerText.substring(splitIdx);
                manualWrap = true;
            }
        }
    }

    const kWidth = (k.w - 12);
    const availableWidth = kWidth - 2;
    
    let visualWeightForScale = centerText.length;
    if (manualWrap) {
        const lines = finalDisplayText.split('\n');
        visualWeightForScale = Math.max(...lines.map(l => l.length));
    }
    if (isFluentCenter) {
        visualWeightForScale = 1.2;
    } else if (isModKey && modType !== 'base') {
        visualWeightForScale += 0.5;
    }

    const charWidthMultiplier = 10.5;
    const estimatedPxWidth = visualWeightForScale * charWidthMultiplier; 
    let targetScale = 1.0;
    let canWrap = manualWrap;

    if (estimatedPxWidth > availableWidth) {
        if (centerText.length <= 6) {
            targetScale = 1.0;
        } else {
            targetScale = availableWidth / estimatedPxWidth;
            if (!manualWrap && targetScale < 0.7 && centerText.length > 6) {
                canWrap = true;
                targetScale = Math.max(0.75, targetScale * 1.2); 
            }
        }
    }

    const minScaleLimit = centerText.length >= 7 ? 0.4 : (centerText.length >= 5 ? 0.5 : 0.6);
    targetScale = Math.max(minScaleLimit, Math.min(1.1, targetScale));
    if (manualWrap) targetScale = Math.min(0.9, targetScale);

    const cleanRaw = fullRaw ? fullRaw.toUpperCase() : '';
    const displayRaw = (val && typeof val === 'string' && val.toUpperCase().startsWith('KC_'))
        ? val.toUpperCase()
        : (cleanRaw.startsWith('KC_') ? cleanRaw : 'KC_' + cleanRaw);

    if (actuallyShowingSvg) {
        targetScale = 1.11;
    }

    const jisSvg = k.isJIS && (() => {
        const W = k.w - 6;
        const H = k.h - 6;
        const N = 14;
        const H2 = 50; 
        const R = 6;
        const O = 1.2;
        const pathD = `M ${R},${O} L ${W - R},${O} A ${R},${R} 0 0 1 ${W - O},${R} L ${W - O},${H - R} A ${R},${R} 0 0 1 ${W - R},${H - O} L ${N + R},${H - O} A ${R},${R} 0 0 1 ${N + O},${H - R} L ${N + O},${H2 + R} A ${R},${R} 0 0 0 ${N - R + O},${H2} L ${R},${H2} A ${R},${R} 0 0 1 ${O},${H2 - R} L ${O},${R} A ${R},${R} 0 0 1 ${R},${O} Z`;
        const strokeColor = isLight ? (isAppDark ? '#94a3b8' : '#cbd5e1') : (isAppDark ? '#475569' : '#334155');
        const fillColor = isLight ? '#ffffff' : (isAppDark ? 'rgba(15, 23, 42, 0.6)' : '#1e293b');
        const dropShadow = isLight ? 'drop-shadow(0 4px 6px rgb(0 0 0 / 0.08))' : 'drop-shadow(0 20px 25px rgb(0 0 0 / 0.15))';
        return createElement('svg', {
            key: 'jis-enter-svg',
            className: 'jis-enter-svg',
            style: {
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                filter: dropShadow,
                overflow: 'visible',
                zIndex: 1
            },
            shapeRendering: 'geometricPrecision'
        },
            createElement('path', {
                d: pathD,
                className: "jis-enter-path",
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: 2.4,
                style: { transition: 'all 0.075s ease' }
            })
        );
    })();

    return createElement('div', {
        key: i,
        className: `key-cap group${k.isJIS ? ' jis-key' : ''}`,
        title: val || fullRaw,
        'data-key-raw': displayRaw,
        onClick: (e) => {
            const macroMatch = fullRaw.match(/MACRO\((\d+)\)/);
            if (macroMatch && onMacroClick) {
                e.stopPropagation();
                onMacroClick(parseInt(macroMatch[1], 10));
            }
        },
        style: getKeycapFrameStyle(k, isLayerKey || isModKey)
    }, 
        jisSvg,
        isModKey && modType === 'base' && createElement('div', {
            className: "mod-accent-bar",
            style: {
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '3.5px',
                backgroundColor: getModColor(modKeys[0], isLight),
                zIndex: 20
            }
        }),

        isLayerKey ? (
            createElement('div', { className: "key-layer-container", style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' } },
                layerNum2 ? (
                    createElement('div', { 
                        className: "key-layer-main relative",
                        style: getOffsetContainerStyle()
                    }, 
                        createElement('div', {
                            className: "layer-primary",
                            style: getOffsetPrimaryStyle(isLight, false, '24px')
                        }, `L${layerNum}`),
                        createElement('div', {
                            className: "layer-secondary",
                            style: getOffsetSecondaryStyle(isLight)
                        }, `L${layerNum2}`)
                    )
                ) : layerType === 'LT' ? (
                    createElement('div', { 
                        className: "key-layer-main relative",
                        style: getOffsetContainerStyle()
                    }, 
                        createElement('div', {
                            className: "layer-primary",
                            style: getOffsetPrimaryStyle(isLight, tapIsFluent)
                        }, tapLabel),
                        createElement('div', {
                            className: "layer-secondary",
                            style: getOffsetSecondaryStyle(isLight)
                        }, `L${layerNum}`)
                    )
                ) : (
                    createElement('div', { 
                        className: "key-layer-main",
                        style: getMainLegendStyle(isLight, `L${layerNum}`, false, (k.w || 56) / 56, {
                            flex: 1,
                            fontSize: '20px',
                            marginTop: '6px'
                        })
                    }, `L${layerNum}`)
                ),
                createElement('div', {
                    className: "key-layer-footer",
                    style: getFooterContainerStyle(isLight, isAppDark)
                }, 
                    layerNum2 ? (
                        createElement('div', {
                            style: {
                                flex: 1,
                                background: `linear-gradient(to right, ${getLayerFooterColor(layerNum, isLight)} 66.6%, ${getLayerFooterColor(layerNum2, isLight)} 66.6%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#f8fafc',
                                overflow: 'hidden'
                            }
                        }, 
                            createElement('span', {
                                style: getFooterTextStyle(0.55, 0, '18px')
                            }, `FN${layerNum}+${layerNum2}`)
                        )
                    ) : (
                        createElement('div', {
                            style: {
                                flex: 1,
                                backgroundColor: getLayerFooterColor(layerNum, isLight),
                                color: (isLight && [5].includes(layerNum % 10)) ? '#020617' : '#f8fafc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }
                        }, 
                            createElement('span', { 
                                style: getFooterTextStyle(0.72, 0, '14px')
                            }, 
                                layerType
                            )
                        )
                    )
                )
            )
        ) : isModKey ? (
            createElement('div', {
                className: "key-mod-container",
                style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }
            },
                modType === 'base' ? (
                    (() => {
                        let textScale = getTextScale(finalDisplayText, (k.w || 56) / 56, actuallyShowingSvg);
                        if (isWirelessKey || isMouseKey) {
                            textScale = 0.62;
                        }
                        const combinedScale = targetScale * textScale * 0.9;

                        if (actuallyShowingSvg) {
                            const effectiveSvgSize = Math.max(8, Math.round(24 * combinedScale));
                            const svgEl = createSVGElement(displayRawForRGB, { size: effectiveSvgSize, color: getModColor(modKeys[0], isLight) });
                            if (svgEl) {
                                return createElement('div', {
                                    className: "key-content flex-1 flex items-center justify-center w-full h-full",
                                    style: {
                                        paddingLeft: '6px',
                                        overflow: 'visible',
                                        position: 'relative'
                                    }
                                },
                                    createElement('div', {
                                        style: {
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '2px',
                                            boxSizing: 'border-box'
                                        }
                                    },
                                        createElement('div', {
                                            style: {
                                                width: effectiveSvgSize + 'px',
                                                height: effectiveSvgSize + 'px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            },
                                            dangerouslySetInnerHTML: { __html: svgEl.outerHTML }
                                        })
                                    )
                                );
                            }
                        }

                        const effectiveFontSize = 22 * combinedScale;
                        const needsScaleBypass = effectiveFontSize < 14;
                        return createElement('div', {
                            className: "key-content flex-1 flex items-center justify-center w-full h-full",
                            style: {
                                paddingLeft: '6px',
                                overflow: 'visible',
                                position: 'relative'
                            }
                        },
                            createElement('div', {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    height: '100%',
                                    padding: '2px',
                                    boxSizing: 'border-box'
                                }
                            },
                                createElement('div', {
                                    className: "legend-text",
                                    style: getMainLegendStyle(isLight, finalDisplayText, actuallyShowingSvg, (k.w || 56) / 56, {
                                        color: getModColor(modKeys[0], isLight),
                                        transform: 'none',
                                        fontSize: needsScaleBypass ? '16px' : (effectiveFontSize + 'px'),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        maxHeight: 'none',
                                        ...(canWrap ? { whiteSpace: 'pre-wrap', lineHeight: '1.1' } : {})
                                    })
                                }, finalDisplayText ? createElement('span', {
                                    style: needsScaleBypass ? {
                                        transform: `scale(${effectiveFontSize / 16})`,
                                        transformOrigin: 'center center',
                                        display: 'inline-block',
                                        whiteSpace: 'nowrap'
                                     } : null
                                }, finalDisplayText) : null)
                            )
                        );
                    })()
                ) : (
                    (() => {
                        const footerScale = 0.72;

                        return createElement('div', {
                            className: "key-mod-split-container",
                            style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }
                        },
                            createElement('div', {
                                className: "key-mod-main",
                                style: getMainLegendStyle(isLight, baseLabel, baseIsFluent, (k.w || 56) / 56, {
                                    flex: 1,
                                    ...(baseIsFluent ? { fontSize: '20px' } : {}),
                                    marginTop: '6px'
                                })
                            }, baseLabel),
                            createElement('div', {
                                className: "key-mod-footer",
                                style: getFooterContainerStyle(isLight, isAppDark)
                            },
                                createElement('div', {
                                    style: {
                                        flex: 1,
                                        background: getModGradient(modKeys, isLight),
                                        color: '#f8fafc',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }
                                },
                                    createElement('span', {
                                        style: getFooterTextStyle(footerScale, 0, '14px')
                                    }, modLabel)
                                )
                            )
                        );
                    })()
                )
            )
        ) : (
            createElement('div', {
                className: "key-content flex-1 flex items-center justify-center w-full h-full",
                style: k.isJIS ? {
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: `${k.w - 6}px`,
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'visible',
                    zIndex: 2
                } : {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    overflow: 'visible',
                    zIndex: 2
                }
            },
                isRGBFluent ? (
                    (() => {
                        const effectiveSvgSize = 20;
                        const svgEl = createSVGElement(displayRawForRGB, { size: effectiveSvgSize, color: isLight ? '#1e293b' : '#fff' });
                        
                        return createElement('div', {
                            style: {
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                boxSizing: 'border-box'
                            }
                        }, [
                            svgEl && createElement('div', {
                                key: 'rgb-svg-render',
                                style: {
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1
                                },
                                dangerouslySetInnerHTML: { __html: svgEl.outerHTML }
                            }),
                            createElement('div', {
                                key: 'rgb-text-label',
                                style: {
                                    position: 'absolute',
                                    bottom: '1.5px',
                                    left: 0,
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    zIndex: 2,
                                    pointerEvents: 'none',
                                    userSelect: 'none'
                                }
                            }, 
                                createElement('span', {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: '500', 
                                        color: isLight ? '#1e293b' : '#ffffff',
                                        fontFamily: '"Outfit", sans-serif',
                                        letterSpacing: '0.06em', 
                                        lineHeight: '1',
                                        textTransform: 'uppercase',
                                        transform: 'scale(0.55)',
                                        transformOrigin: 'bottom center',
                                        display: 'inline-block',
                                        whiteSpace: 'nowrap'
                                    }
                                }, rgbLabel)
                            )
                        ]);
                    })()
                ) : isMagicFluent ? (
                    (() => {
                        const effectiveSvgSize = 20;
                        const svgEl = createSVGElement(displayRawForRGB, { size: effectiveSvgSize, color: isLight ? '#1e293b' : '#fff' });
                        const parsedText = parseKeyLabel(val, k.id, 'Text', keyStyle, macroAliases);
                        const magicLabel = narrowSlash(parsedText.displayText);
                        
                        return createElement('div', {
                            style: {
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                boxSizing: 'border-box'
                            }
                        }, [
                            svgEl && createElement('div', {
                                key: 'magic-svg-render',
                                style: {
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1
                                },
                                dangerouslySetInnerHTML: { __html: svgEl.outerHTML }
                            }),
                            createElement('div', {
                                key: 'magic-text-label',
                                style: {
                                    position: 'absolute',
                                    bottom: '1.5px',
                                    left: 0,
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    zIndex: 2,
                                    pointerEvents: 'none',
                                    userSelect: 'none'
                                }
                            }, 
                                createElement('span', {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: '500', 
                                        color: isLight ? '#1e293b' : '#ffffff',
                                        fontFamily: '"Outfit", sans-serif',
                                        letterSpacing: '0.06em', 
                                        lineHeight: '1',
                                        textTransform: 'uppercase',
                                        transform: 'scale(0.55)',
                                        transformOrigin: 'bottom center',
                                        display: 'inline-block',
                                        whiteSpace: 'nowrap'
                                    }
                                }, magicLabel)
                            )
                        ]);
                    })()
                ) : isWirelessFluent ? (
                    (() => {
                        const effectiveSvgSize = 20;
                        const svgEl = createSVGElement(displayRawForRGB, { size: effectiveSvgSize, color: isLight ? '#1e293b' : '#fff' });
                        
                        return createElement('div', {
                            style: {
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                boxSizing: 'border-box'
                            }
                        }, [
                            svgEl && createElement('div', {
                                key: 'wireless-svg-render',
                                style: {
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1
                                },
                                dangerouslySetInnerHTML: { __html: svgEl.outerHTML }
                            }),
                            createElement('div', {
                                key: 'wireless-text-label',
                                style: {
                                    position: 'absolute',
                                    bottom: '1.5px',
                                    left: 0,
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    zIndex: 2,
                                    pointerEvents: 'none',
                                    userSelect: 'none'
                                }
                            }, 
                                createElement('span', {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: '500', 
                                        color: isLight ? '#1e293b' : '#ffffff',
                                        fontFamily: '"Outfit", sans-serif',
                                        letterSpacing: '0.06em', 
                                        lineHeight: '1',
                                        textTransform: 'uppercase',
                                        transform: 'scale(0.55)',
                                        transformOrigin: 'bottom center',
                                        display: 'inline-block',
                                        whiteSpace: 'nowrap'
                                    }
                                }, wirelessLabel)
                            )
                        ]);
                    })()
                ) : isWebFluent ? (
                    (() => {
                        const effectiveSvgSize = 20;
                        const svgEl = createSVGElement(displayRawForRGB, { size: effectiveSvgSize, color: isLight ? '#1e293b' : '#fff' });
                        
                        return createElement('div', {
                            style: {
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                boxSizing: 'border-box'
                            }
                        }, [
                            svgEl && createElement('div', {
                                key: 'web-svg-render',
                                style: {
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1
                                },
                                dangerouslySetInnerHTML: { __html: svgEl.outerHTML }
                            }),
                            createElement('div', {
                                key: 'web-text-label',
                                style: {
                                    position: 'absolute',
                                    bottom: '1.5px',
                                    left: 0,
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    zIndex: 2,
                                    pointerEvents: 'none',
                                    userSelect: 'none'
                                }
                            }, 
                                createElement('span', {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: '500', 
                                        color: isLight ? '#1e293b' : '#ffffff',
                                        fontFamily: '"Outfit", sans-serif',
                                        letterSpacing: '0.06em', 
                                        lineHeight: '1',
                                        textTransform: 'uppercase',
                                        transform: 'scale(0.55)',
                                        transformOrigin: 'bottom center',
                                        display: 'inline-block',
                                        whiteSpace: 'nowrap'
                                    }
                                }, webLabel)
                            )
                        ]);
                    })()
                ) : isMouseFluent ? (
                    (() => {
                        const effectiveSvgSize = 20;
                        const svgEl = createSVGElement(displayRawForRGB, { size: effectiveSvgSize, color: isLight ? '#1e293b' : '#fff' });
                        
                        return createElement('div', {
                            style: {
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                boxSizing: 'border-box'
                            }
                        }, [
                            svgEl && createElement('div', {
                                key: 'mouse-svg-render',
                                style: {
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1
                                },
                                dangerouslySetInnerHTML: { __html: svgEl.outerHTML }
                            }),
                            createElement('div', {
                                key: 'mouse-text-label',
                                style: {
                                    position: 'absolute',
                                    bottom: '1.5px',
                                    left: 0,
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    zIndex: 2,
                                    pointerEvents: 'none',
                                    userSelect: 'none'
                                }
                            }, 
                                createElement('span', {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: '500', 
                                        color: isLight ? '#1e293b' : '#ffffff',
                                        fontFamily: '"Outfit", sans-serif',
                                        letterSpacing: '0.06em', 
                                        lineHeight: '1',
                                        textTransform: 'uppercase',
                                        transform: 'scale(0.55)',
                                        transformOrigin: 'bottom center',
                                        display: 'inline-block',
                                        whiteSpace: 'nowrap'
                                    }
                                }, mouseLabel)
                            )
                        ]);
                    })()
                ) : isMacroFluent ? (
                    (() => {
                        const effectiveSvgSize = 20;
                        const svgEl = createSVGElement(displayRawForRGB, { size: effectiveSvgSize, color: isLight ? '#1e293b' : '#fff' });
                        
                        return createElement('div', {
                            style: {
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                boxSizing: 'border-box'
                            }
                        }, [
                            svgEl && createElement('div', {
                                key: 'macro-svg-render',
                                style: {
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1
                                },
                                dangerouslySetInnerHTML: { __html: svgEl.outerHTML }
                            }),
                            createElement('div', {
                                key: 'macro-text-label',
                                style: {
                                    position: 'absolute',
                                    bottom: '1.5px',
                                    left: 0,
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    zIndex: 2,
                                    pointerEvents: 'none',
                                    userSelect: 'none'
                                }
                            }, 
                                createElement('span', {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: '500', 
                                        color: isLight ? '#1e293b' : '#ffffff',
                                        fontFamily: '"Outfit", sans-serif',
                                        letterSpacing: '0.06em', 
                                        lineHeight: '1',
                                        textTransform: 'uppercase',
                                        transform: 'scale(0.55)',
                                        transformOrigin: 'bottom center',
                                        display: 'inline-block',
                                        whiteSpace: 'nowrap'
                                    }
                                }, macroLabel)
                            )
                        ]);
                    })()
                ) : (
                    (() => {
                        let textScale = manualWrap 
                             ? 0.62 
                             : getTextScale(finalDisplayText, (k.w || 56) / 56, isFluentIcon);
                        if (isWirelessKey || isMouseKey || isWebKey) {
                            textScale = 0.62;
                        }
                        const combinedScale = targetScale * textScale * 0.9;
                        
                        const keyCategory = getKeyCategory(displayRaw);
                        
                        return createElement('div', {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%',
                                padding: '2px',
                                boxSizing: 'border-box',
                                position: 'relative'
                            }
                        }, [
                            (() => {
                                const modeCheck = (displayMode === 'Fluent');
                                const svgCheck = isSVGAvailable(displayRaw);

                                if (modeCheck && svgCheck) {
                                    const effectiveSvgSize = Math.max(8, Math.round(24 * combinedScale));
                                    const svgEl = createSVGElement(displayRaw, { size: effectiveSvgSize, color: isLight ? '#1e293b' : '#fff' });
                                    if (svgEl) {
                                        return createElement('div', {
                                            key: 'svg-render',
                                            style: {
                                                width: effectiveSvgSize + 'px',
                                                height: effectiveSvgSize + 'px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            },
                                            dangerouslySetInnerHTML: { __html: svgEl.outerHTML }
                                        });
                                    }
                                }
                                
                                const effectiveFontSize = 22 * combinedScale;
                                const needsScaleBypass = effectiveFontSize < 14;
                                return createElement('div', {
                                    className: "legend-text",
                                    style: getMainLegendStyle(isLight, finalDisplayText, isFluentIcon, (k.w || 56) / 56, {
                                        transform: 'none',
                                        fontSize: needsScaleBypass ? '16px' : (effectiveFontSize + 'px'),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        maxHeight: 'none',
                                        ...(canWrap ? { whiteSpace: 'pre-wrap', lineHeight: '1.1' } : {})
                                    })
                                }, finalDisplayText ? (
                                    finalDisplayText.includes('\n') ? (
                                        createElement('div', {
                                            style: {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                lineHeight: '0.95',
                                                width: '100%',
                                                height: '100%',
                                                transform: needsScaleBypass ? `scale(${effectiveFontSize / 16})` : 'none',
                                                transformOrigin: 'center center'
                                            }
                                        }, finalDisplayText.split('\n').map((line, lineIdx) => createElement('span', {
                                            key: lineIdx,
                                            style: {
                                                display: 'inline-block',
                                                whiteSpace: 'nowrap'
                                            }
                                        }, line)))
                                    ) : (
                                        createElement('span', {
                                            style: needsScaleBypass ? {
                                                transform: `scale(${effectiveFontSize / 16})`,
                                                transformOrigin: 'center center',
                                                display: 'inline-block',
                                                whiteSpace: 'nowrap'
                                            } : null
                                        }, finalDisplayText)
                                    )
                                ) : null);
                            })(),
                            
                            displayMode === 'Text' && keyCategory && createElement('div', {
                                key: 'cat-badge',
                                className: "category-badge",
                                style: {
                                    position: 'absolute',
                                    right: '3px',
                                    bottom: '-4.5px',
                                    zIndex: 10,
                                    pointerEvents: 'none',
                                    userSelect: 'none'
                                }
                            }, 
                                createElement('span', {
                                    style: {
                                        fontSize: '15px',
                                        fontWeight: '500', 
                                        color: isLight ? '#64748b' : '#94a3b8',
                                        opacity: 0.7,
                                        fontFamily: '"Outfit", "Arial", "Helvetica", sans-serif',
                                        letterSpacing: '0.05em', 
                                        lineHeight: '1',
                                        textTransform: 'uppercase',
                                        transform: 'scale(0.5)',
                                        transformOrigin: 'bottom right',
                                        display: 'inline-block',
                                        whiteSpace: 'nowrap'
                                    }
                                }, keyCategory)
                            )
                        ]);
                    })()
                )
            )
        )
    );
}
