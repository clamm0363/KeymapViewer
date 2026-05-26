const { createElement } = React;

import { getMainLegendStyle, getTextScale } from './keycapStyles.js';
import {
    renderFluentIconWithBottomLabel,
    renderBottomCaption,
    renderInlineFluentIcon
} from './keycapRenderers.js';

export function renderStandardKeycap({
    k,
    model,
    isLight,
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

    if (model.variant === 'icon-bottom-label') {
        return createElement('div', { className: 'key-content flex-1 flex items-center justify-center w-full h-full', style: containerStyle },
            renderFluentIconWithBottomLabel({
                iconKey: model.resolvedIconKey,
                label: model.bottomLabel,
                labelKey: model.bottomLabelKind,
                isLight
            }));
    }

    let textScale = model.manualWrap ? 0.62 : getTextScale(model.centerText, model.kWidth, model.isFluentCenter);
    if (model.textScalePreset) {
        textScale = model.textScalePreset;
    }
    const combinedScale = model.targetScale * textScale * 0.9;

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
            if (model.variant === 'center-svg') {
                const effectiveSvgSize = Math.max(8, Math.round(24 * combinedScale));
                const iconElement = renderInlineFluentIcon({
                    iconKey: model.resolvedIconKey,
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
                style: getMainLegendStyle(isLight, model.centerText, model.isFluentCenter, model.kWidth, {
                    transform: 'none',
                    fontSize: needsScaleBypass ? '16px' : `${effectiveFontSize}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    maxHeight: 'none',
                    ...(model.canWrap ? { whiteSpace: 'pre-wrap', lineHeight: '1.1' } : {})
                })
            }, model.centerText ? (
                model.centerText.includes('\n') ? (
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
                    }, model.centerText.split('\n').map((line, lineIdx) => createElement('span', {
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
                    }, model.centerText)
                )
            ) : null);
        })(),
        model.bottomCaption ? renderBottomCaption({
            label: model.bottomCaption,
            isLight
        }) : null
    ]));
}
