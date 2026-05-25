const { createElement } = React;

import { isSVGAvailable } from '../svg-icons.js';
import { parseKeyLabel } from '../utils/labelParser.js';
import {
    getFooterContainerStyle,
    getFooterTextStyle,
    getKeycapFrameStyle,
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
import { renderEncoderKeycap } from './keycapEncoder.js';

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
