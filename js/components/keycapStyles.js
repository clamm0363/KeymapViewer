import { FLUENT_FONT_STACK } from '../constants.js';

export const getFooterContainerStyle = (isLight, isAppDark) => ({
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

export const getFooterTextStyle = (scale = 0.72, translateY = 0, fontSize = '14px') => {
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

export const getOffsetContainerStyle = () => ({
    flex: 1,
    position: 'relative',
    width: '100%'
});

export const getOffsetPrimaryStyle = (isLight, isFluent = false, customFontSize = null) => {
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

export const getOffsetSecondaryStyle = (isLight) => ({
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

export const getTextScale = (displayText, keyWidth = 1, isFluentIcon = false) => {
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

export const getMainLegendStyle = (isLight, displayText, isFluentIcon = false, keyWidth = 1, customOverrides = {}) => {
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

export const getLayerFooterColor = (num, isLight) => {
    const lightColors = ['#64748b', '#2563eb', '#4f46e5', '#0891b2', '#10b981', '#f59e0b', '#ea580c', '#e11d48', '#9333ea', '#0284c7'];
    const darkColors = ['#475569', '#1e40af', '#3730a3', '#155e75', '#065f46', '#92400e', '#9a3412', '#9f1239', '#6b21a8', '#075985'];
    return (isLight ? lightColors : darkColors)[num % 10];
};

export const getModColor = (mod, isLight) => {
    if (!mod) return isLight ? '#475569' : '#334155';
    const cleanMod = mod.toUpperCase();
    const palettes = {
        SHIFT: { light: '#c2410c', dark: '#ea580c' },
        SHFT: { light: '#c2410c', dark: '#ea580c' },
        CTRL: { light: '#0369a1', dark: '#0284c7' },
        ALT: { light: '#6d28d9', dark: '#7c3aed' },
        GUI: { light: '#065f46', dark: '#059669' },
        WIN: { light: '#065f46', dark: '#059669' },
        CMD: { light: '#065f46', dark: '#059669' }
    };
    const entry = palettes[cleanMod] || { light: '#475569', dark: '#334155' };
    return isLight ? entry.light : entry.dark;
};

export const getModGradient = (mKeys, isLight) => {
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

export const getEncoderActions = (encodersSource, encoderIdx, layerIdx) => {
    if (!encodersSource || !encodersSource[encoderIdx]) return null;
    const encData = encodersSource[encoderIdx];
    if (encData && encData[layerIdx]) {
        return encData[layerIdx];
    }
    return null;
};
