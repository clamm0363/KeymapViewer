const { createElement } = React;

import { isSVGAvailable } from '../svg-icons.js';
import { parseKeyLabel } from '../utils/labelParser.js';
import {
    getEncoderActions,
    getFooterContainerStyle,
    getFooterTextStyle,
    getLayerFooterColor,
    getMainLegendStyle,
    getModColor,
    getModGradient,
    getOffsetContainerStyle,
    getOffsetPrimaryStyle,
    getOffsetSecondaryStyle,
    getTextScale
} from './keycapStyles.js';
import {
    buildDisplayRaw,
    getIconRenderState,
    getKeyCategory,
    narrowSlash,
    normalizeTargetIconKey,
    shortenLabel
} from './keycapIconUtils.js';
import {
    renderFluentIconWithBottomLabel,
    renderInlineFluentIcon
} from './keycapRenderers.js';

export function Keycap({
    k,
    val,
    i,
    displayMode,
    keyStyle,
    macroAliases,
    onMacroClick,
    encoderStyles,
    layer,
    design,
    externalMap,
    isLight,
    isAppDark
}) {
    const getKeycapFrameStyle = (k, isLayerKey) => {
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
            } else if (currentStyle === 'HorizontalWheel') {
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
            } else {
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
        const currentStyle = (encoderStyles && encoderStyles[k.encoderIndex]) || 'Dial';
        const encodersSource = (externalMap && externalMap.encoders) || (design && design.encoders);
        const ccwActions = getEncoderActions(encodersSource, k.encoderIndex, layer);
        let ccwLabel = '';
        let cwLabel = '';
        let ccwCode = 'KC_NO';
        let cwCode = 'KC_NO';
        if (ccwActions) {
            ccwCode = ccwActions[0] || 'KC_NO';
            cwCode = ccwActions[1] || 'KC_NO';
            const parsedCcw = parseKeyLabel(ccwCode, ccwCode, 'Text', keyStyle, macroAliases);
            const parsedCw = parseKeyLabel(cwCode, cwCode, 'Text', keyStyle, macroAliases);
            ccwLabel = parsedCcw.displayText;
            cwLabel = parsedCw.displayText;
        }

        const parsedPush = parseKeyLabel(val, k.id, 'Text', keyStyle, macroAliases);
        const pushText = parsedPush.displayText;

        let tooltipText = `Encoder e${k.encoderIndex}\n`;
        tooltipText += `Push: ${pushText || 'None'} (${val || 'KC_NO'})`;
        if (ccwActions) {
            if (currentStyle === 'VerticalWheel') {
                tooltipText += `\nUP: ${cwLabel || 'None'} (${cwCode})`;
                tooltipText += `\nDOWN: ${ccwLabel || 'None'} (${ccwCode})`;
            } else if (currentStyle === 'HorizontalWheel') {
                tooltipText += `\nRIGHT: ${cwLabel || 'None'} (${cwCode})`;
                tooltipText += `\nLEFT: ${ccwLabel || 'None'} (${ccwCode})`;
            } else {
                tooltipText += `\nCW (Clockwise): ${cwLabel || 'None'} (${cwCode})`;
                tooltipText += `\nCCW (Counter-Clockwise): ${ccwLabel || 'None'} (${ccwCode})`;
            }
        }

        const cleanRaw = fullRaw ? fullRaw.toUpperCase() : '';
        const displayRaw = (val && typeof val === 'string' && val.toUpperCase().startsWith('KC_'))
            ? val.toUpperCase()
            : (cleanRaw.startsWith('KC_') ? cleanRaw : 'KC_' + cleanRaw);

        const containerClass = (currentStyle === 'VerticalWheel' || currentStyle === 'HorizontalWheel')
            ? 'encoder-wheel-container group'
            : 'key-cap encoder-knob group';

        let childElements = null;
        if (currentStyle === 'VerticalWheel') {
            const wheelBg = isLight
                ? `linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.45) 100%),
                   repeating-linear-gradient(to right, transparent, transparent 1px, rgba(0,0,0,0.18) 1px, rgba(0,0,0,0.18) 2px),
                   #94a3b8`
                : `linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(255,255,255,0.18) 15%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.7) 100%),
                   repeating-linear-gradient(to right, transparent, transparent 1px, rgba(0,0,0,0.38) 1px, rgba(0,0,0,0.38) 2px),
                   #334155`;
            childElements = [
                createElement('div', {
                    key: 'wheel-vertical',
                    className: 'w-[22px] h-[36px] rounded-[3px] transition-all duration-200 group-hover:scale-x-105 group-hover:brightness-110 shadow-md shadow-black/30 group-hover:shadow-blue-500/25',
                    style: {
                        background: wheelBg,
                        boxShadow: isLight
                            ? '0 2px 4px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.4)'
                            : '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
                    }
                })
            ];
        } else if (currentStyle === 'HorizontalWheel') {
            const wheelBg = isLight
                ? `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.45) 100%),
                   repeating-linear-gradient(to bottom, transparent, transparent 1px, rgba(0,0,0,0.18) 1px, rgba(0,0,0,0.18) 2px),
                   #94a3b8`
                : `linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(255,255,255,0.18) 15%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.7) 100%),
                   repeating-linear-gradient(to bottom, transparent, transparent 1px, rgba(0,0,0,0.38) 1px, rgba(0,0,0,0.38) 2px),
                   #334155`;
            childElements = [
                createElement('div', {
                    key: 'wheel-horizontal',
                    className: 'w-[36px] h-[22px] rounded-[3px] transition-all duration-200 group-hover:scale-y-105 group-hover:brightness-110 shadow-md shadow-black/30 group-hover:shadow-blue-500/25',
                    style: {
                        background: wheelBg,
                        boxShadow: isLight
                            ? '0 2px 4px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.4)'
                            : '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
                    }
                })
            ];
        } else {
            childElements = [
                createElement('div', {
                    key: 'knob-indicator',
                    className: 'knob-indicator',
                    style: {
                        position: 'absolute',
                        top: '4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '3.5px',
                        height: '8px',
                        borderRadius: '1.5px',
                        backgroundColor: isLight ? '#94a3b8' : '#64748b',
                        opacity: 0.8
                    }
                })
            ];
        }

        return createElement('div', {
            key: i,
            className: containerClass,
            title: tooltipText,
            'data-key-raw': displayRaw,
            onClick: (e) => {
                const macroMatch = fullRaw.match(/MACRO\((\d+)\)/);
                if (macroMatch && onMacroClick) {
                    e.stopPropagation();
                    onMacroClick(parseInt(macroMatch[1], 10));
                }
            },
            style: getKeycapFrameStyle(k, false)
        }, childElements);
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
        style: getKeycapFrameStyle(k, isLayerKey || isModKey)
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
                backgroundColor: getModColor(modKeys[0], isLight),
                zIndex: 20
            }
        }),

        isLayerKey ? (
            createElement('div', { className: "key-layer-container", style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' } },
                layerNum2 ? (
                    createElement('div', { 
                        className: "key-layer-main relative",
                        style: getOffsetContainerStyle()
                    }, 
                        createElement('div', {
                            className: "layer-primary",
                            style: getOffsetPrimaryStyle(isLight, false, '24px')
                        }, `L${layerNum}`),
                        createElement('div', {
                            className: "layer-secondary",
                            style: getOffsetSecondaryStyle(isLight)
                        }, `L${layerNum2}`)
                    )
                ) : layerType === 'LT' ? (
                    createElement('div', { 
                        className: "key-layer-main relative",
                        style: getOffsetContainerStyle()
                    }, 
                        createElement('div', {
                            className: "layer-primary",
                            style: getOffsetPrimaryStyle(isLight, tapIsFluent)
                        }, tapLabel),
                        createElement('div', {
                            className: "layer-secondary",
                            style: getOffsetSecondaryStyle(isLight)
                        }, `L${layerNum}`)
                    )
                ) : (
                    createElement('div', { 
                        className: "key-layer-main",
                        style: getMainLegendStyle(isLight, `L${layerNum}`, false, (k.w || 56) / 56, {
                            flex: 1,
                            fontSize: '20px',
                            marginTop: '6px'
                        })
                    }, `L${layerNum}`)
                ),
                createElement('div', {
                    className: "key-layer-footer",
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
                            }, `FN${layerNum}+${layerNum2}`)
                        )
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
                            }, 
                                layerType
                            )
                        )
                    )
                )
            )
        ) : isModKey ? (
            createElement('div', {
                className: "key-mod-container",
                style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }
            },
                modType === 'base' ? (
                    (() => {
                        let textScale = getTextScale(finalDisplayText, (k.w || 56) / 56, actuallyShowingSvg);
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
                                    className: "key-content flex-1 flex items-center justify-center w-full h-full",
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
                                    },
                                        iconElement
                                    )
                                );
                            }
                        }

                        const effectiveFontSize = 22 * combinedScale;
                        const needsScaleBypass = effectiveFontSize < 14;
                        return createElement('div', {
                            className: "key-content flex-1 flex items-center justify-center w-full h-full",
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
                                    className: "legend-text",
                                    style: getMainLegendStyle(isLight, finalDisplayText, actuallyShowingSvg, (k.w || 56) / 56, {
                                        color: getModColor(modKeys[0], isLight),
                                        transform: 'none',
                                        fontSize: needsScaleBypass ? '16px' : (effectiveFontSize + 'px'),
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
                                }, finalDisplayText) : null)
                            )
                        );
                    })()
                ) : (
                    (() => {
                        const footerScale = 0.72;

                        return createElement('div', {
                            className: "key-mod-split-container",
                            style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }
                        },
                            createElement('div', {
                                className: "key-mod-main",
                                style: getMainLegendStyle(isLight, baseLabel, baseIsFluent, (k.w || 56) / 56, {
                                    flex: 1,
                                    ...(baseIsFluent ? { fontSize: '20px' } : {}),
                                    marginTop: '6px'
                                })
                            }, baseLabel),
                            createElement('div', {
                                className: "key-mod-footer",
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
                                        style: getFooterTextStyle(footerScale, 0, '14px')
                                    }, modLabel)
                                )
                            )
                        );
                    })()
                )
            )
        ) : (
            createElement('div', {
                className: "key-content flex-1 flex items-center justify-center w-full h-full",
                style: k.isJIS ? {
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
                }
            },
                isRGBFluent ? (
                    renderFluentIconWithBottomLabel({
                        iconKey: displayRawForRGB,
                        label: rgbLabel,
                        labelKey: 'rgb',
                        isLight
                    })
                ) : isMagicFluent ? (
                    renderFluentIconWithBottomLabel({
                        iconKey: displayRawForRGB,
                        label: magicLabel,
                        labelKey: 'magic',
                        isLight
                    })
                ) : isWirelessFluent ? (
                    renderFluentIconWithBottomLabel({
                        iconKey: displayRawForRGB,
                        label: wirelessLabel,
                        labelKey: 'wireless',
                        isLight
                    })
                ) : isWebFluent ? (
                    renderFluentIconWithBottomLabel({
                        iconKey: displayRawForRGB,
                        label: webLabel,
                        labelKey: 'web',
                        isLight
                    })
                ) : isMouseFluent ? (
                    renderFluentIconWithBottomLabel({
                        iconKey: displayRawForRGB,
                        label: mouseLabel,
                        labelKey: 'mouse',
                        isLight
                    })
                ) : isMacroFluent ? (
                    renderFluentIconWithBottomLabel({
                        iconKey: displayRawForRGB,
                        label: macroLabel,
                        labelKey: 'macro',
                        isLight
                    })
                ) : (
                    (() => {
                        let textScale = manualWrap 
                             ? 0.62 
                             : getTextScale(finalDisplayText, (k.w || 56) / 56, isFluentIcon);
                        if (isWirelessKey || isMouseKey || isWebKey) {
                            textScale = 0.62;
                        }
                        const combinedScale = targetScale * textScale * 0.9;
                        
                        const keyCategory = getKeyCategory(displayRaw);
                        
                        return createElement('div', {
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
                                    className: "legend-text",
                                    style: getMainLegendStyle(isLight, finalDisplayText, isFluentIcon, (k.w || 56) / 56, {
                                        transform: 'none',
                                        fontSize: needsScaleBypass ? '16px' : (effectiveFontSize + 'px'),
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
                                className: "category-badge",
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
                                }, keyCategory)
                            )
                        ]);
                    })()
                )
            )
        )
    );
}
