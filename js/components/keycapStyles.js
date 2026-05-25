import { FLUENT_FONT_STACK } from '../constants.js';

const withAlpha = (hexColor, alpha) => {
    if (typeof hexColor !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(hexColor)) {
        return hexColor;
    }
    const normalized = Math.max(0, Math.min(255, alpha));
    return `${hexColor}${normalized.toString(16).padStart(2, '0')}`;
};

export const getKeycapFrameStyle = ({ k, isLayerKey, encoderStyles, isLight, isAppDark }) => {
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
        }

        if (currentStyle === 'HorizontalWheel') {
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
        }

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

export const getTopTagContainerStyle = () => ({
    position: 'absolute',
    top: '-6px',
    left: '3px',
    zIndex: 12,
    pointerEvents: 'none',
    userSelect: 'none'
});

export const getTopTagStyle = (isLight, accentColor) => ({
    display: 'inline-block',
    color: accentColor,
    fontSize: '11px',
    fontWeight: '600',
    fontFamily: '"Outfit", "Arial", "Helvetica", sans-serif',
    letterSpacing: '0.04em',
    lineHeight: '1',
    textTransform: 'uppercase',
    fontVariantLigatures: 'none',
    transform: 'scale(0.52)',
    transformOrigin: 'top left',
    whiteSpace: 'nowrap'
});

export const getBottomCaptionContainerStyle = () => ({
    position: 'absolute',
    right: '3px',
    bottom: '-4.5px',
    zIndex: 10,
    pointerEvents: 'none',
    userSelect: 'none'
});

export const getBottomCaptionStyle = (isLight, color = null) => ({
    fontSize: '15px',
    fontWeight: '500',
    color: color || (isLight ? '#64748b' : '#94a3b8'),
    opacity: 0.78,
    fontFamily: '"Outfit", "Arial", "Helvetica", sans-serif',
    letterSpacing: '0.05em',
    lineHeight: '1',
    textTransform: 'uppercase',
    transform: 'scale(0.52)',
    transformOrigin: 'bottom right',
    display: 'inline-block',
    whiteSpace: 'nowrap'
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
    width: '100%',
    height: '100%',
    transform: 'translate(1px, -3px)'
});

export const getOffsetPrimaryStyle = (isLight, isFluent = false, customFontSize = null) => {
    const baseFontSize = parseFloat(customFontSize || (isFluent ? '24' : '22'));
    const computedSize = Math.round(baseFontSize * (isFluent ? 0.78 : 0.66) * 100) / 100;
    return {
        fontSize: `${computedSize}px`,
        fontWeight: '400',
        fontFamily: isFluent
            ? FLUENT_FONT_STACK.primary
            : FLUENT_FONT_STACK.fallback,
        color: isLight ? '#1e293b' : '#fff',
        lineHeight: '1',
        textAlign: 'left',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        whiteSpace: 'nowrap',
        fontVariantLigatures: 'none'
    };
};

export const getOffsetPrimarySlotStyle = () => ({
    position: 'absolute',
    left: '7px',
    bottom: '5px',
    zIndex: 10,
    pointerEvents: 'none',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    maxWidth: 'calc(100% - 24px)',
    minHeight: '16px'
});

export const getOffsetPrimaryContentStyle = (isLight, isFluent = false, customFontSize = null) => ({
    ...getOffsetPrimaryStyle(isLight, isFluent, customFontSize),
    width: 'auto'
});

export const getOffsetSecondaryStyle = (isLight) => ({
    position: 'absolute',
    right: '5px',
    top: '13px',
    maxWidth: 'calc(100% - 24px)',
    fontSize: '10px',
    fontWeight: '500',
    fontFamily: '"Outfit", "Arial", "Helvetica", sans-serif',
    color: isLight ? '#64748b' : '#94a3b8',
    opacity: 0.68,
    lineHeight: '1',
    textAlign: 'right',
    textTransform: 'uppercase',
    transform: 'scale(0.68)',
    transformOrigin: 'top right',
    whiteSpace: 'nowrap',
    fontVariantLigatures: 'none'
});

export const getOffsetSecondarySlotStyle = () => ({
    position: 'absolute',
    right: '5px',
    top: '14px',
    zIndex: 10,
    pointerEvents: 'none',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    minWidth: '14px',
    minHeight: '10px'
});

export const getOffsetSecondaryContentStyle = (isLight, color, customFontSize = '10px') => ({
    fontSize: customFontSize,
    fontWeight: '500',
    fontFamily: '"Outfit", "Arial", "Helvetica", sans-serif',
    color: color || (isLight ? '#64748b' : '#94a3b8'),
    opacity: 0.82,
    lineHeight: '1',
    textAlign: 'right',
    textTransform: 'uppercase',
    display: 'inline-block',
    whiteSpace: 'nowrap',
    fontVariantLigatures: 'none',
    transform: 'scale(0.64)',
    transformOrigin: 'top right'
});

export const getOffsetSecondaryAccentStyle = (isLight, color, customFontSize = '10px') => ({
    ...getOffsetSecondaryStyle(isLight),
    top: '14px',
    fontSize: customFontSize,
    color,
    transform: 'scale(0.64)',
    opacity: 0.82
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
