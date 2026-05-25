const { createElement } = React;

import {
    getMainLegendStyle,
    getModColor,
    getOffsetContainerStyle,
    getOffsetPrimaryContentStyle,
    getOffsetPrimarySlotStyle,
    getTextScale
} from './keycapStyles.js';
import {
    renderInlineFluentIcon,
    renderModifierSupplement,
    renderTopTag
} from './keycapRenderers.js';

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
    keyStyle,
    modLabel
}) {
    const primaryModColor = getModColor(modKeys[0], isLight);
    const shouldCompactTapPrimary = !baseIsFluent && baseLabel && baseLabel.length >= 3;

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
                color: primaryModColor
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
                color: primaryModColor,
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

    if (modType === 'tap') {
        return createElement('div', {
            className: 'key-mod-split-container',
            style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }
        }, [
            renderTopTag({
                label: 'MT',
                isLight,
                accentColor: primaryModColor
            }),
            createElement('div', {
                key: 'mod-main',
                className: 'key-mod-main relative',
                style: getOffsetContainerStyle()
            }, [
                createElement('div', {
                    key: 'mod-primary',
                    className: 'mod-primary',
                    style: getOffsetPrimarySlotStyle()
                }, createElement('span', {
                    style: {
                        ...getOffsetPrimaryContentStyle(
                            isLight,
                            baseIsFluent,
                            shouldCompactTapPrimary ? '16px' : null
                        ),
                        ...(shouldCompactTapPrimary ? {
                            letterSpacing: '-0.01em'
                        } : {}),
                        ...(shouldCompactTapPrimary ? {
                            transform: 'scale(0.82)',
                            transformOrigin: 'left bottom'
                        } : {})
                    }
                }, baseLabel)),
                renderModifierSupplement({
                    modKeys,
                    label: modLabel,
                    isLight,
                    color: primaryModColor,
                    keyStyle,
                    placement: 'offset'
                })
            ])
        ]);
    }

    return createElement('div', {
        className: 'key-mod-split-container',
        style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }
    }, [(() => {
        const textScale = getTextScale(baseLabel, kWidth, baseIsFluent);
        const combinedScale = targetScale * textScale * 0.9;
        const effectiveFontSize = 22 * combinedScale;
        const needsScaleBypass = effectiveFontSize < 14;

        return createElement('div', {
            key: 'mod-main',
            className: 'key-mod-main',
            style: getMainLegendStyle(isLight, baseLabel, baseIsFluent, kWidth, {
                flex: 1,
                transform: 'none',
                fontSize: needsScaleBypass ? '16px' : `${effectiveFontSize}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                maxHeight: 'none'
            })
        }, baseLabel ? createElement('span', {
            style: needsScaleBypass ? {
                transform: `scale(${effectiveFontSize / 16})`,
                transformOrigin: 'center center',
                display: 'inline-block',
                whiteSpace: 'nowrap'
            } : null
        }, baseLabel) : null);
    })(),
        renderModifierSupplement({
            modKeys,
            label: modLabel,
            isLight,
            color: primaryModColor,
            keyStyle
        })
    ]);
}
