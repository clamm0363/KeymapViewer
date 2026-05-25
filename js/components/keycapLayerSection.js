const { createElement } = React;

import {
    getFooterContainerStyle,
    getFooterTextStyle,
    getLayerFooterColor,
    getMainLegendStyle,
    getOffsetContainerStyle,
    getOffsetPrimaryStyle,
    getOffsetSecondaryStyle
} from './keycapStyles.js';

export function renderLayerKeycap({
    layerNum2,
    layerType,
    layerNum,
    tapIsFluent,
    tapLabel,
    isLight,
    isAppDark,
    kWidth
}) {
    return createElement('div', {
        className: 'key-layer-container',
        style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }
    },
    layerNum2 ? (
        createElement('div', {
            className: 'key-layer-main relative',
            style: getOffsetContainerStyle()
        },
        createElement('div', {
            className: 'layer-primary',
            style: getOffsetPrimaryStyle(isLight, false, '24px')
        }, `L${layerNum}`),
        createElement('div', {
            className: 'layer-secondary',
            style: getOffsetSecondaryStyle(isLight)
        }, `L${layerNum2}`))
    ) : layerType === 'LT' ? (
        createElement('div', {
            className: 'key-layer-main relative',
            style: getOffsetContainerStyle()
        },
        createElement('div', {
            className: 'layer-primary',
            style: getOffsetPrimaryStyle(isLight, tapIsFluent)
        }, tapLabel),
        createElement('div', {
            className: 'layer-secondary',
            style: getOffsetSecondaryStyle(isLight)
        }, `L${layerNum}`))
    ) : (
        createElement('div', {
            className: 'key-layer-main',
            style: getMainLegendStyle(isLight, `L${layerNum}`, false, kWidth, {
                flex: 1,
                fontSize: '20px',
                marginTop: '6px'
            })
        }, `L${layerNum}`)
    ),
    createElement('div', {
        className: 'key-layer-footer',
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
        }, `FN${layerNum}+${layerNum2}`))
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
        }, layerType))
    )));
}
