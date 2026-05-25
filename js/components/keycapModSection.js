const { createElement } = React;

import {
    getFooterContainerStyle,
    getFooterTextStyle,
    getMainLegendStyle,
    getModColor,
    getModGradient,
    getTextScale
} from './keycapStyles.js';
import { renderInlineFluentIcon } from './keycapRenderers.js';

export function renderModKeycap({
    modType,
    finalDisplayText,
    kWidth,
    actuallyShowingSvg,
    isWirelessKey,
    isMouseKey,
    targetScale,
    targetIconKey,
    modKeys,
    isLight,
    canWrap,
    baseLabel,
    baseIsFluent,
    isAppDark,
    modLabel
}) {
    if (modType === 'base') {
        let textScale = getTextScale(finalDisplayText, kWidth, actuallyShowingSvg);
        if (isWirelessKey || isMouseKey) {
            textScale = 0.62;
        }
        const combinedScale = targetScale * textScale * 0.9;

        if (actuallyShowingSvg) {
            const effectiveSvgSize = Math.max(8, Math.round(24 * combinedScale));
            const iconElement = renderInlineFluentIcon({
                iconKey: targetIconKey,
                size: effectiveSvgSize,
                color: getModColor(modKeys[0], isLight)
            });
            if (iconElement) {
                return createElement('div', {
                    className: 'key-content flex-1 flex items-center justify-center w-full h-full',
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
                }, iconElement));
            }
        }

        const effectiveFontSize = 22 * combinedScale;
        const needsScaleBypass = effectiveFontSize < 14;
        return createElement('div', {
            className: 'key-content flex-1 flex items-center justify-center w-full h-full',
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
            className: 'legend-text',
            style: getMainLegendStyle(isLight, finalDisplayText, actuallyShowingSvg, kWidth, {
                color: getModColor(modKeys[0], isLight),
                transform: 'none',
                fontSize: needsScaleBypass ? '16px' : `${effectiveFontSize}px`,
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
        }, finalDisplayText) : null)));
    }

    return createElement('div', {
        className: 'key-mod-split-container',
        style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }
    },
    createElement('div', {
        className: 'key-mod-main',
        style: getMainLegendStyle(isLight, baseLabel, baseIsFluent, kWidth, {
            flex: 1,
            ...(baseIsFluent ? { fontSize: '20px' } : {}),
            marginTop: '6px'
        })
    }, baseLabel),
    createElement('div', {
        className: 'key-mod-footer',
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
        style: getFooterTextStyle(0.72, 0, '14px')
    }, modLabel))));
}
