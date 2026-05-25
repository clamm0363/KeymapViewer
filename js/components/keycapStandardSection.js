const { createElement } = React;

import { isSVGAvailable } from '../svg-icons.js';
import { getKeyCategory } from './keycapIconUtils.js';
import { getMainLegendStyle, getTextScale } from './keycapStyles.js';
import {
    renderFluentIconWithBottomLabel,
    renderInlineFluentIcon
} from './keycapRenderers.js';

export function renderStandardKeycap({
    k,
    isRGBFluent,
    displayRawForRGB,
    rgbLabel,
    isLight,
    isMagicFluent,
    magicLabel,
    isWirelessFluent,
    wirelessLabel,
    isWebFluent,
    webLabel,
    isMouseFluent,
    mouseLabel,
    isMacroFluent,
    macroLabel,
    manualWrap,
    finalDisplayText,
    isFluentIcon,
    isWirelessKey,
    isMouseKey,
    isWebKey,
    targetScale,
    displayRaw,
    displayMode,
    canWrap,
    kWidth
}) {
    const containerStyle = k.isJIS ? {
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
    };

    if (isRGBFluent) {
        return createElement('div', { className: 'key-content flex-1 flex items-center justify-center w-full h-full', style: containerStyle },
            renderFluentIconWithBottomLabel({ iconKey: displayRawForRGB, label: rgbLabel, labelKey: 'rgb', isLight }));
    }
    if (isMagicFluent) {
        return createElement('div', { className: 'key-content flex-1 flex items-center justify-center w-full h-full', style: containerStyle },
            renderFluentIconWithBottomLabel({ iconKey: displayRawForRGB, label: magicLabel, labelKey: 'magic', isLight }));
    }
    if (isWirelessFluent) {
        return createElement('div', { className: 'key-content flex-1 flex items-center justify-center w-full h-full', style: containerStyle },
            renderFluentIconWithBottomLabel({ iconKey: displayRawForRGB, label: wirelessLabel, labelKey: 'wireless', isLight }));
    }
    if (isWebFluent) {
        return createElement('div', { className: 'key-content flex-1 flex items-center justify-center w-full h-full', style: containerStyle },
            renderFluentIconWithBottomLabel({ iconKey: displayRawForRGB, label: webLabel, labelKey: 'web', isLight }));
    }
    if (isMouseFluent) {
        return createElement('div', { className: 'key-content flex-1 flex items-center justify-center w-full h-full', style: containerStyle },
            renderFluentIconWithBottomLabel({ iconKey: displayRawForRGB, label: mouseLabel, labelKey: 'mouse', isLight }));
    }
    if (isMacroFluent) {
        return createElement('div', { className: 'key-content flex-1 flex items-center justify-center w-full h-full', style: containerStyle },
            renderFluentIconWithBottomLabel({ iconKey: displayRawForRGB, label: macroLabel, labelKey: 'macro', isLight }));
    }

    let textScale = manualWrap ? 0.62 : getTextScale(finalDisplayText, kWidth, isFluentIcon);
    if (isWirelessKey || isMouseKey || isWebKey) {
        textScale = 0.62;
    }
    const combinedScale = targetScale * textScale * 0.9;
    const keyCategory = getKeyCategory(displayRaw);

    return createElement('div', {
        className: 'key-content flex-1 flex items-center justify-center w-full h-full',
        style: containerStyle
    },
    createElement('div', {
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
            if (displayMode === 'Fluent' && isSVGAvailable(displayRaw)) {
                const effectiveSvgSize = Math.max(8, Math.round(24 * combinedScale));
                const iconElement = renderInlineFluentIcon({
                    iconKey: displayRaw,
                    size: effectiveSvgSize,
                    color: isLight ? '#1e293b' : '#fff'
                });
                if (iconElement) {
                    return createElement('div', { key: 'svg-render' }, iconElement);
                }
            }

            const effectiveFontSize = 22 * combinedScale;
            const needsScaleBypass = effectiveFontSize < 14;
            return createElement('div', {
                key: 'legend-text',
                className: 'legend-text',
                style: getMainLegendStyle(isLight, finalDisplayText, isFluentIcon, kWidth, {
                    transform: 'none',
                    fontSize: needsScaleBypass ? '16px' : `${effectiveFontSize}px`,
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
            className: 'category-badge',
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
        }, keyCategory))
    ]));
}
