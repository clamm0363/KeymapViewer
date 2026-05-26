const { createElement } = React;

import { parseKeyLabel } from '../utils/labelParser.js';
import {
    getKeycapFrameStyle,
    getModColor,
} from './keycapStyles.js';
import {
    buildDisplayRaw,
    getIconRenderState,
    narrowSlash,
    normalizeTargetIconKey,
    shortenLabel
} from './keycapIconUtils.js';
import { renderEncoderKeycap } from './keycapEncoder.js';
import {
    renderLayerKeycap,
    renderModKeycap,
    renderStandardKeycap
} from './keycapSections.js';

export function Keycap({
    k,
    val,
    i,
    displayMode,
    keyStyle,
    macroAliases,
    onMacroClick,
    encoderStyles,
    inputDeviceSettings,
    layer,
    design,
    externalMap,
    isLight,
    isAppDark
}) {
    const parsed = parseKeyLabel(val, k.id, displayMode, keyStyle, macroAliases);
    let {
        fullRaw, displayText, isFluentIcon, isLayerKey,
        layerType, layerNum, layerNum2, tapLabel, tapIsFluent, visualWeight,
        isModKey, modType, modLabel, modKeys, baseLabel, baseIsFluent
    } = parsed;

    displayText = narrowSlash(displayText);
    tapLabel = narrowSlash(tapLabel);
    baseLabel = narrowSlash(baseLabel);
    modLabel = narrowSlash(modLabel);

    const displayRawForRGB = buildDisplayRaw(fullRaw, val);
    const targetIconKey = normalizeTargetIconKey(displayRawForRGB);
    const {
        isFluentMode,
        isRGBKey,
        isRGBFluent,
        rgbLabel,
        actuallyShowingSvg,
        isMagicKey,
        isMagicFluent,
        isMacroKey,
        isMacroFluent,
        macroLabel,
        isWirelessKey,
        isWirelessFluent,
        wirelessLabel,
        isMouseKey,
        isMouseFluent,
        mouseLabel,
        isWebKey,
        isWebFluent,
        webLabel
    } = getIconRenderState({
        displayRaw: displayRawForRGB,
        targetIconKey,
        displayMode,
        keyStyle,
        isModKey,
        modType
    });

    const is1u = (k.w || 56) / 56 < 1.25;
    if (is1u) {
        displayText = shortenLabel(displayText);
        tapLabel = shortenLabel(tapLabel);
        baseLabel = shortenLabel(baseLabel);
    }

    const isFluentCenter = isFluentIcon || (isModKey && baseIsFluent);
    const centerText = (isModKey && modType !== 'base') ? baseLabel : displayText;
    const magicLabel = isMagicFluent
        ? narrowSlash(parseKeyLabel(val, k.id, 'Text', keyStyle, macroAliases).displayText)
        : '';

    if (k.isEncoder) {
        const encodersSource = (externalMap && externalMap.encoders) || (design && design.encoders);
        return renderEncoderKeycap({
            k,
            i,
            val,
            fullRaw,
            onMacroClick,
            encoderStyles,
            inputDeviceSettings,
            encodersSource,
            layer,
            keyStyle,
            macroAliases,
            isLight,
            isAppDark
        });
    }

    let finalDisplayText = centerText;
    let manualWrap = false;
    
    const hasSlash = /[\s\u2009\u200a]*\/[\s\u2009\u200a]*/.test(centerText);
    if (centerText.length > 5 && (centerText.includes('_') || centerText.includes('-') || hasSlash)) {
        if (hasSlash) {
            const parts = centerText.split(/[\s\u2009\u200a]*\/[\s\u2009\u200a]*/);
            finalDisplayText = parts[0] + '\n' + parts[1];
            manualWrap = true;
        } else {
            const splitIdx = Math.max(centerText.lastIndexOf('_'), centerText.lastIndexOf('-'));
            if (splitIdx > 1 && splitIdx < centerText.length - 2) {
                finalDisplayText = centerText.substring(0, splitIdx) + '\n' + centerText.substring(splitIdx);
                manualWrap = true;
            }
        }
    }

    const kWidth = (k.w - 12);
    const availableWidth = kWidth - 2;
    
    let visualWeightForScale = centerText.length;
    if (manualWrap) {
        const lines = finalDisplayText.split('\n');
        visualWeightForScale = Math.max(...lines.map(l => l.length));
    }
    if (isFluentCenter) {
        visualWeightForScale = 1.2;
    } else if (isModKey && modType !== 'base') {
        visualWeightForScale += 0.5;
    }

    const charWidthMultiplier = 10.5;
    const estimatedPxWidth = visualWeightForScale * charWidthMultiplier; 
    let targetScale = 1.0;
    let canWrap = manualWrap;

    if (estimatedPxWidth > availableWidth) {
        if (centerText.length <= 6) {
            targetScale = 1.0;
        } else {
            targetScale = availableWidth / estimatedPxWidth;
            if (!manualWrap && targetScale < 0.7 && centerText.length > 6) {
                canWrap = true;
                targetScale = Math.max(0.75, targetScale * 1.2); 
            }
        }
    }

    const minScaleLimit = centerText.length >= 7 ? 0.4 : (centerText.length >= 5 ? 0.5 : 0.6);
    targetScale = Math.max(minScaleLimit, Math.min(1.1, targetScale));
    if (manualWrap) targetScale = Math.min(0.9, targetScale);

    const cleanRaw = fullRaw ? fullRaw.toUpperCase() : '';
    const displayRaw = (val && typeof val === 'string' && val.toUpperCase().startsWith('KC_'))
        ? val.toUpperCase()
        : (cleanRaw.startsWith('KC_') ? cleanRaw : 'KC_' + cleanRaw);

    if (actuallyShowingSvg) {
        targetScale = 1.11;
    }

    const jisSvg = k.isJIS && (() => {
        const W = k.w - 6;
        const H = k.h - 6;
        const N = 14;
        const H2 = 50; 
        const R = 6;
        const O = 1.2;
        const pathD = `M ${R},${O} L ${W - R},${O} A ${R},${R} 0 0 1 ${W - O},${R} L ${W - O},${H - R} A ${R},${R} 0 0 1 ${W - R},${H - O} L ${N + R},${H - O} A ${R},${R} 0 0 1 ${N + O},${H - R} L ${N + O},${H2 + R} A ${R},${R} 0 0 0 ${N - R + O},${H2} L ${R},${H2} A ${R},${R} 0 0 1 ${O},${H2 - R} L ${O},${R} A ${R},${R} 0 0 1 ${R},${O} Z`;
        const strokeColor = isLight ? (isAppDark ? '#94a3b8' : '#cbd5e1') : (isAppDark ? '#475569' : '#334155');
        const fillColor = isLight ? '#ffffff' : (isAppDark ? 'rgba(15, 23, 42, 0.6)' : '#1e293b');
        const dropShadow = isLight ? 'drop-shadow(0 4px 6px rgb(0 0 0 / 0.08))' : 'drop-shadow(0 20px 25px rgb(0 0 0 / 0.15))';
        return createElement('svg', {
            key: 'jis-enter-svg',
            className: 'jis-enter-svg',
            style: {
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                filter: dropShadow,
                overflow: 'visible',
                zIndex: 1
            },
            shapeRendering: 'geometricPrecision'
        },
            createElement('path', {
                key: 'jis-enter-path',
                d: pathD,
                className: "jis-enter-path",
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: 2.4,
                style: { transition: 'all 0.075s ease' }
            })
        );
    })();

    return createElement('div', {
        key: i,
        className: `key-cap group${k.isJIS ? ' jis-key' : ''}`,
        title: val || fullRaw,
        'data-key-raw': displayRaw,
        onClick: (e) => {
            const macroMatch = fullRaw.match(/MACRO\((\d+)\)/);
            if (macroMatch && onMacroClick) {
                e.stopPropagation();
                onMacroClick(parseInt(macroMatch[1], 10));
            }
        },
        style: getKeycapFrameStyle({
            k,
            isLayerKey: isLayerKey || isModKey,
            encoderStyles,
            inputDeviceSettings,
            isLight,
            isAppDark
        })
    }, 
        jisSvg,
        isModKey && modType === 'base' && createElement('div', {
            className: "mod-accent-bar",
            style: {
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '3.5px',
                backgroundColor: getModColor(modKeys[0], isLight, isAppDark),
                zIndex: 20
            }
        }),

        isLayerKey ? (
            renderLayerKeycap({
                layerNum2,
                layerType,
                layerNum,
                tapIsFluent,
                tapLabel,
                isLight,
                isAppDark,
                kWidth: (k.w || 56) / 56,
                targetScale
            })
        ) : isModKey ? (
            renderModKeycap({
                modType,
                finalDisplayText,
                displayMode,
                kWidth: (k.w || 56) / 56,
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
                isAppDark,
                modLabel
            })
        ) : (
            renderStandardKeycap({
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
                targetIconKey,
                displayRaw,
                displayMode,
                canWrap,
                kWidth: (k.w || 56) / 56
            })
        )
    );
}
