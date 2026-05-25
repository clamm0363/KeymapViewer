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
    layerNum2,
    layerType,
    layerNum,
    tapIsFluent,
    tapLabel,
    isLight,
    kWidth,
    targetScale
}) {
    const accentColor = getLayerFooterColor(Number(layerNum || 0), isLight);
    const bottomCaptionLabel = layerNum2
        ? `FN${layerNum}+${layerNum2}`
        : null;
    const singleLayerLabel = `L${layerNum}`;

    return createElement('div', {
        className: 'key-layer-container',
        style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }
    }, [
        renderTopTag({
            label: layerNum2 ? 'FN' : layerType,
            isLight,
            accentColor
        }),
        layerNum2 ? (
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
                }, `L${layerNum}`)),
                createElement('div', {
                    key: 'layer-secondary',
                    className: 'layer-secondary',
                    style: getOffsetSecondaryStyle(isLight)
                }, `L${layerNum2}`)
            ])
        ) : layerType === 'LT' ? (
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
                    style: getOffsetPrimaryContentStyle(isLight, tapIsFluent)
                }, tapLabel)),
                createElement('div', {
                    key: 'layer-secondary',
                    className: 'layer-secondary',
                    style: getOffsetSecondaryStyle(isLight)
                }, `L${layerNum}`)
            ])
        ) : (
            (() => {
                const textScale = getTextScale(singleLayerLabel, kWidth, false);
                const combinedScale = targetScale * textScale * 0.9;
                const effectiveFontSize = 22 * combinedScale;
                const needsScaleBypass = effectiveFontSize < 14;

                return createElement('div', {
                    key: 'layer-main-single',
                    className: 'key-layer-main',
                    style: getMainLegendStyle(isLight, singleLayerLabel, false, kWidth, {
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
                }, singleLayerLabel));
            })()
        ),
        layerNum2 ? renderBottomCaption({
            label: bottomCaptionLabel,
            isLight,
            color: accentColor
        }) : null
    ]);
}
