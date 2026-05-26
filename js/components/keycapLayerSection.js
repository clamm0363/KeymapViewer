const { createElement } = React;

import {
    getLayerFooterColor,
    getMainLegendStyle,
    getOffsetContainerStyle,
    getOffsetPrimaryContentStyle,
    getOffsetPrimarySlotStyle,
    getOffsetSecondaryStyle,
    getTextScale
} from './keycapStyles.js';
import {
    renderBottomCaption,
    renderTopTag
} from './keycapRenderers.js';

export function renderLayerKeycap({
    model,
    isLight,
    isAppDark,
}) {
    const accentColor = getLayerFooterColor(Number(model.layerNum || 0), isLight, isAppDark);

    return createElement('div', {
        className: 'key-layer-container',
        style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }
    }, [
        renderTopTag({
            label: model.topTag,
            isLight,
            accentColor
        }),
        model.variant === 'fn-offset' ? (
            createElement('div', {
                key: 'layer-main-fn',
                className: 'key-layer-main relative',
                style: getOffsetContainerStyle()
            }, [
                createElement('div', {
                    key: 'layer-primary',
                    className: 'layer-primary',
                    style: getOffsetPrimarySlotStyle()
                }, createElement('span', {
                    style: getOffsetPrimaryContentStyle(isLight, false, '24px')
                }, model.primaryText)),
                createElement('div', {
                    key: 'layer-secondary',
                    className: 'layer-secondary',
                    style: getOffsetSecondaryStyle(isLight)
                }, model.secondaryText)
            ])
        ) : model.variant === 'lt-offset' ? (
            createElement('div', {
                key: 'layer-main-lt',
                className: 'key-layer-main relative',
                style: getOffsetContainerStyle()
            }, [
                createElement('div', {
                    key: 'layer-primary',
                    className: 'layer-primary',
                    style: getOffsetPrimarySlotStyle()
                }, createElement('span', {
                    style: getOffsetPrimaryContentStyle(isLight, model.primaryIsFluent)
                }, model.primaryText)),
                createElement('div', {
                    key: 'layer-secondary',
                    className: 'layer-secondary',
                    style: getOffsetSecondaryStyle(isLight)
                }, model.secondaryText)
            ])
        ) : (
            (() => {
                const textScale = getTextScale(model.primaryText, model.kWidth, false);
                const combinedScale = model.targetScale * textScale * 0.9;
                const effectiveFontSize = 22 * combinedScale;
                const needsScaleBypass = effectiveFontSize < 14;

                return createElement('div', {
                    key: 'layer-main-single',
                    className: 'key-layer-main',
                    style: getMainLegendStyle(isLight, model.primaryText, false, model.kWidth, {
                        flex: 1,
                        transform: 'none',
                        fontSize: needsScaleBypass ? '16px' : `${effectiveFontSize}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        maxHeight: 'none'
                    })
                }, createElement('span', {
                    style: needsScaleBypass ? {
                        transform: `scale(${effectiveFontSize / 16})`,
                        transformOrigin: 'center center',
                        display: 'inline-block',
                        whiteSpace: 'nowrap'
                    } : null
                }, model.primaryText));
            })()
        ),
        model.bottomCaption ? renderBottomCaption({
            label: model.bottomCaption,
            isLight,
            color: accentColor
        }) : null
    ]);
}
