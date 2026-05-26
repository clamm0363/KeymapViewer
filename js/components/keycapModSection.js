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
    model,
    isLight,
    isAppDark,
}) {
    const primaryModColor = getModColor(model.modKeys[0], isLight, isAppDark);
    const shouldCompactTapPrimary = !model.baseIsFluent && model.baseLabel && model.baseLabel.length >= 3;

    if (model.variant === 'base') {
        let textScale = getTextScale(model.centerText, model.kWidth, model.actuallyShowingSvg);
        if (model.textScalePreset) {
            textScale = model.textScalePreset;
        }
        const combinedScale = model.targetScale * textScale * 0.9;

        if (model.actuallyShowingSvg) {
            const effectiveSvgSize = Math.max(8, Math.round(24 * combinedScale));
            const iconElement = renderInlineFluentIcon({
                iconKey: model.iconKey,
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
            style: getMainLegendStyle(isLight, model.centerText, model.actuallyShowingSvg, model.kWidth, {
                color: primaryModColor,
                transform: 'none',
                fontSize: needsScaleBypass ? '16px' : `${effectiveFontSize}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                maxHeight: 'none',
                ...(model.canWrap ? { whiteSpace: 'pre-wrap', lineHeight: '1.1' } : {})
            })
        }, model.centerText ? createElement('span', {
            style: needsScaleBypass ? {
                transform: `scale(${effectiveFontSize / 16})`,
                transformOrigin: 'center center',
                display: 'inline-block',
                whiteSpace: 'nowrap'
            } : null
        }, model.centerText) : null)));
    }

    if (model.variant === 'tap') {
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
                            model.baseIsFluent,
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
                }, model.baseLabel)),
                renderModifierSupplement({
                    modKeys: model.modKeys,
                    label: model.modLabel,
                    isLight,
                    color: primaryModColor,
                    keyStyle: model.keyStyle,
                    displayMode: model.displayMode,
                    placement: 'offset'
                })
            ])
        ]);
    }

    return createElement('div', {
        className: 'key-mod-split-container',
        style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }
    }, [(() => {
        const textScale = getTextScale(model.baseLabel, model.kWidth, model.baseIsFluent);
        const combinedScale = model.targetScale * textScale * 0.9;
        const effectiveFontSize = 22 * combinedScale;
        const needsScaleBypass = effectiveFontSize < 14;

        return createElement('div', {
            key: 'mod-main',
            className: 'key-mod-main',
            style: getMainLegendStyle(isLight, model.baseLabel, model.baseIsFluent, model.kWidth, {
                flex: 1,
                transform: 'none',
                fontSize: needsScaleBypass ? '16px' : `${effectiveFontSize}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                maxHeight: 'none'
            })
        }, model.baseLabel ? createElement('span', {
            style: needsScaleBypass ? {
                transform: `scale(${effectiveFontSize / 16})`,
                transformOrigin: 'center center',
                display: 'inline-block',
                    whiteSpace: 'nowrap'
                } : null
        }, model.baseLabel) : null);
    })(),
        renderModifierSupplement({
            modKeys: model.modKeys,
            label: model.modLabel,
            isLight,
            color: primaryModColor,
            keyStyle: model.keyStyle,
            displayMode: model.displayMode
        })
    ]);
}
