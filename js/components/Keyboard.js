const { createElement, useState, useEffect, useMemo, useRef } = React;
const html = htm.bind(createElement);

import { FLUENT_FONT_STACK } from '../constants.js';

// Shared footer skeleton and text styling utilities for visual consistency across all keytypes
const getFooterContainerStyle = (isLight, isAppDark) => ({
    marginTop: 'auto',
    width: 'calc(100% + 8px)',
    marginLeft: '-4px',
    marginRight: '-4px',
    marginBottom: '-4px',
    height: '18px',
    display: 'flex',
    zIndex: 10,
    overflow: 'hidden',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
    borderTop: `2px solid ${isLight ? (isAppDark ? '#94a3b8' : '#cbd5e1') : (isAppDark ? '#475569' : '#334155')}`
});

const getFooterTextStyle = (scale = 0.72, translateY = 0, fontSize = '14px') => ({
    fontSize,
    fontWeight: '500',
    fontFamily: '"Outfit", sans-serif',
    letterSpacing: '0.05em',
    lineHeight: '1',
    transform: `scale(${scale}) translateY(${translateY}px)`,
    transformOrigin: 'center center',
    whiteSpace: 'nowrap'
});

// Shared layout and offset styling utilities for offset-legend keycaps (e.g., LT, FN_MO13)
const getOffsetContainerStyle = () => ({
    flex: 1,
    position: 'relative',
    width: '100%'
});

const getOffsetPrimaryStyle = (isLight, isFluent = false, customFontSize = null) => ({
    position: 'absolute',
    left: '6px',
    bottom: '3.5px',
    fontSize: customFontSize || (isFluent ? '26px' : '22px'),
    fontWeight: '400',
    fontFamily: isFluent 
        ? FLUENT_FONT_STACK.primary
        : FLUENT_FONT_STACK.fallback,
    color: isLight ? '#1e293b' : '#fff',
    transform: 'scale(0.75)',
    transformOrigin: 'left bottom',
    lineHeight: '1'
});

const getOffsetSecondaryStyle = (isLight) => ({
    position: 'absolute',
    right: '6px',
    top: '3px',
    fontSize: '16px',
    fontWeight: '400',
    fontFamily: '"Outfit", sans-serif',
    color: isLight ? '#64748b' : '#94a3b8',
    opacity: 0.8,
    transform: 'scale(0.75)',
    transformOrigin: 'right top',
    lineHeight: '1'
});

// Shared main legend styling utility for standard/modifier/layer text keycaps to enforce strict size harmony
const getMainLegendStyle = (isLight, displayText, isFluentIcon = false, keyWidth = 1, customOverrides = {}) => {
    // 1uキーキャップ基準で、文字数（長さ）に応じて完全に均一な縮小率を適用し、表示崩れを防ぐ
    let textScale = 1.0;
    if (!isFluentIcon && displayText) {
        const isFunctionKey = /^F\d+$/.test(displayText);
        if (isFunctionKey) {
            textScale = 1.0;                   // F1-F12はすべて2文字サイズ（等倍）に統一
        } else {
            const len = displayText.length;
            if (len === 3) {
                textScale = keyWidth >= 1.25 ? 0.85 : 0.70; // 1.25u以上の3文字キーは0.85、1uキーは0.70(PSCR等とサイズを統一)
            }
            else if (len === 4) {
                textScale = keyWidth >= 1.25 ? 0.85 : 0.70;  // 1.25u以上の4文字キーは0.85、1uキーは0.70
            }
            else if (len >= 5) {
                // SHIFTやENTER、SPACE、BACKSPACEなど、大きなキーにある5文字以上の文字サイズを調和させる
                if (keyWidth >= 2.0) {
                    textScale = 0.85;  // 2u以上の大きなキーは0.85 (SHIFT, ENTER, BACKSPACE等)
                } else if (keyWidth >= 1.25) {
                    textScale = 0.70;  // 1.25u〜2u未満のキーは0.70
                } else {
                    textScale = 0.55;  // 1uなどの狭いキーは0.55
                }
            }
        }
    }

    const baseStyle = {
        color: isLight ? '#1e293b' : '#fff',
        fontWeight: isFluentIcon ? '400' : '400',
        fontFamily: isFluentIcon 
            ? (displayText === '\uE986' ? FLUENT_FONT_STACK.jpKana : FLUENT_FONT_STACK.primary)
            : FLUENT_FONT_STACK.fallback,
        fontSize: '22px',
        lineHeight: '1',
        transform: isFluentIcon ? 'translateY(1.5px)' : `scale(${textScale})`,
        transformOrigin: 'center center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        width: '100%',
        overflow: 'visible',
        whiteSpace: 'nowrap'
    };

    return {
        ...baseStyle,
        ...customOverrides
    };
};

import { parseKeyLabel } from '../utils/labelParser.js';

export function Keyboard({ design, layer = 0, externalMap = null, displayMode = 'Fluent', theme = 'System', appTheme = 'dark', macroAliases = {}, onMacroClick = null, forcedScale = null, isExportMode = false, keyStyle = 'Windows' }) {
    const [codes, setCodes] = useState({});
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    
    const isLight = theme === 'Light' || (theme === 'System' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
    const isAppDark = (appTheme === 'dark' || (appTheme === 'System' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));

    const keys = useMemo(() => {
        if (!design || !design.layouts || !design.layouts.keymap) return [];
        const list = [];
        const UNIT = 56;
        let x = 0, y = 0, w = 1, h = 1;
        let isJISKey = false;
        design.layouts.keymap.forEach(row => {
            x = 0;
            row.forEach(item => {
                if (typeof item === 'string') {
                    const m = item.split('\n')[0].match(/(\d+),(\d+)/);
                    list.push({ 
                        id: item, 
                        matrix: m ? [parseInt(m[1]), parseInt(m[2])] : null, 
                        x: x * UNIT, 
                        y: y * UNIT, 
                        w: w * UNIT, 
                        h: h * UNIT,
                        isJIS: isJISKey
                    });
                    x += w; w = 1; h = 1;
                    isJISKey = false;
                } else {
                    if (item.x !== undefined) x += item.x; 
                    if (item.y !== undefined) y += item.y;
                    if (item.w !== undefined) w = item.w; 
                    if (item.h !== undefined) h = item.h;
                    if (item.isJIS !== undefined) isJISKey = item.isJIS;
                }
            });
            y++;
        });
        return list;
    }, [design]);

    const maxWidth = useMemo(() => keys.length ? Math.max(...keys.map(k => k.x + k.w), 0) + 40 : 0, [keys]);
    const maxHeight = useMemo(() => keys.length ? Math.max(...keys.map(k => k.y + k.h), 0) + 40 : 0, [keys]);

    useEffect(() => {
        if (forcedScale !== null) {
            setScale(forcedScale);
            return;
        }

        if (!containerRef.current || maxWidth === 0) return;
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                const containerWidth = entry.contentRect.width;
                const available = Math.max(0, containerWidth - 48);
                let nextScale = available / maxWidth;
                if (nextScale > 1.4) nextScale = 1.4;
                setScale(nextScale);
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [maxWidth, forcedScale]);

    useEffect(() => {
        const layerSource = (externalMap && externalMap.layers && externalMap.layers[layer]) || (design && design.layers && design.layers[layer]);
        if (layerSource) {
            const next = {}; 
            const cols = (design && design.matrix && design.matrix.cols) || 16;
            layerSource.forEach((v, i) => next[`${Math.floor(i / cols)},${i % cols}`] = v);
            setCodes(next);
        } else {
            setCodes({});
        }
    }, [design, layer, externalMap]);

    const finalScale = forcedScale !== null ? forcedScale : scale;

    if (keys.length === 0) return null;

    // --- Styling Constants & Helpers ---
    
    const getKbdContainerClass = () => {
        const base = "kbd-container relative transition-all duration-200 border-2";
        const lightTheme = "bg-slate-200/80 border-slate-300/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]";
        const darkTheme = isAppDark
            ? "bg-gradient-to-br from-slate-400/40 to-slate-600/40 border-slate-500/40 shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)]"
            : "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 border-slate-400/80 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.18),_inset_0_2px_4px_rgba(255,255,255,0.55),_inset_0_-2px_4px_rgba(0,0,0,0.15)]";
        return `${base} ${isLight ? lightTheme : darkTheme}`;
    };

    /**
     * キートップの外枠（Frame）スタイル
     */
    const getKeycapFrameStyle = (k, isLayerKey) => {
        const paddingOffset = 20;
        const lightBorder = isAppDark ? '#94a3b8' : '#cbd5e1';
        const darkBorder = isAppDark ? '#475569' : '#334155';
        
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

    const getLayerFooterColor = (num) => {
        const lightColors = ['#64748b', '#2563eb', '#4f46e5', '#0891b2', '#10b981', '#f59e0b', '#ea580c', '#e11d48', '#9333ea', '#0284c7'];
        const darkColors = ['#475569', '#1e40af', '#3730a3', '#155e75', '#065f46', '#92400e', '#9a3412', '#9f1239', '#6b21a8', '#075985'];
        return (isLight ? lightColors : darkColors)[num % 10];
    };

    const getModColor = (mod, isLight) => {
        if (!mod) return isLight ? '#475569' : '#334155';
        const cleanMod = mod.toUpperCase();
        const palettes = {
            // High-contrast hardware-grade palettes:
            // Light theme uses deeper ocean/forest shades, Dark theme uses rich vibrant solid shades.
            SHIFT: { light: '#c2410c', dark: '#ea580c' }, // Terracotta / Energy Sunset Orange
            SHFT:  { light: '#c2410c', dark: '#ea580c' },
            CTRL:  { light: '#0369a1', dark: '#0284c7' }, // Deep Tech Blue / Cobalt Blue
            ALT:   { light: '#6d28d9', dark: '#7c3aed' }, // Royal Purple / Mystic Violet
            GUI:   { light: '#065f46', dark: '#059669' }, // Deep Forest / Rich Emerald Green
            WIN:   { light: '#065f46', dark: '#059669' },
            CMD:   { light: '#065f46', dark: '#059669' }
        };
        const entry = palettes[cleanMod] || { light: '#475569', dark: '#334155' };
        return isLight ? entry.light : entry.dark;
    };

    const getModGradient = (mKeys, isLight) => {
        if (!mKeys || mKeys.length === 0) return isLight ? '#64748b' : '#475569';
        if (mKeys.length === 1) return getModColor(mKeys[0], isLight);
        
        // Build dynamic gradient for multiple modifiers
        const colorStops = mKeys.map((m, idx) => {
            const color = getModColor(m, isLight);
            const startPerc = (idx / mKeys.length) * 100;
            const endPerc = ((idx + 1) / mKeys.length) * 100;
            return `${color} ${startPerc}%, ${color} ${endPerc}%`;
        });
        return `linear-gradient(to right, ${colorStops.join(', ')})`;
    };

    // --- Render Component ---

    return createElement('div', {
        ref: containerRef,
        className: "keyboard-container relative overflow-hidden flex items-center justify-center py-1 px-6",
        style: { width: '100%', height: `${maxHeight * finalScale + 8}px` }
    }, 
        createElement('div', {
            className: "keyboard-inner relative",
            style: {
                width: `${maxWidth}px`,
                height: `${maxHeight}px`,
                transform: `scale(${finalScale})`,
                transformOrigin: 'center center',
                flexShrink: 0
            }
        },
            createElement('div', {
                className: getKbdContainerClass(),
                style: { width: '100%', height: '100%', transform: 'none' }
            },
                keys.map((k, i) => {
                    const mK = k.matrix ? `${k.matrix[0]},${k.matrix[1]}` : null;
                    const val = mK ? codes[mK] : null;
                    
                    const parsed = parseKeyLabel(val, k.id, displayMode, keyStyle, macroAliases);
                    let {
                        fullRaw, displayText, isFluentIcon, isLayerKey,
                        layerType, layerNum, layerNum2, tapLabel, tapIsFluent, visualWeight,
                        isModKey, modType, modLabel, modKeys, baseLabel, baseIsFluent
                    } = parsed;

                    // 1uなどの小さなキー（w < 1.25）において、長いテキストを動的に短縮する
                    const is1u = (k.w || 56) / 56 < 1.25;
                    const shortenLabel = (label) => {
                        if (!label) return label;
                        const upper = label.toUpperCase();
                        if (upper === 'SPACE') return 'SPC';
                        if (upper === 'ENTER') return 'ENT';
                        if (upper === 'ESCAPE') return 'ESC';
                        return label;
                    };

                    if (is1u) {
                        displayText = shortenLabel(displayText);
                        tapLabel = shortenLabel(tapLabel);
                        baseLabel = shortenLabel(baseLabel);
                    }

                    const isFluentCenter = isFluentIcon || (isModKey && baseIsFluent);
                    const centerText = (isModKey && modType !== 'base') ? baseLabel : displayText;



                    // 自動スケーリングと折り返しの計算
                    let finalDisplayText = centerText;
                    let manualWrap = false;
                    
                    // 特殊記号での自動折り返し試行
                    if (centerText.length > 5 && (centerText.includes('_') || centerText.includes('-'))) {
                        const splitIdx = Math.max(centerText.lastIndexOf('_'), centerText.lastIndexOf('-'));
                        if (splitIdx > 1 && splitIdx < centerText.length - 2) {
                            finalDisplayText = centerText.substring(0, splitIdx) + '\n' + centerText.substring(splitIdx);
                            manualWrap = true;
                        }
                    }

                    const kWidth = (k.w - 12); // 内寸の目安
                    const availableWidth = kWidth - (isExportMode ? 4 : 2);
                    
                    // スケール計算: visualWeightに基づき、かつ1u(56px)基準で調整
                    let visualWeightForScale = centerText.length;
                    if (isFluentCenter) {
                        visualWeightForScale = 1.2;
                    } else if (isModKey && modType !== 'base') {
                        visualWeightForScale += 0.5;
                    }

                    // 同一の文字数のキーが一律で同じ縮小率となるよう、1文字あたりの幅を均一に11.0pxとして計算
                    const charWidthMultiplier = 11.0;
                    const estimatedPxWidth = visualWeightForScale * charWidthMultiplier; 
                    let targetScale = 1.0;
                    let canWrap = manualWrap;

                    if (estimatedPxWidth > availableWidth) {
                        targetScale = availableWidth / estimatedPxWidth;
                        // 極端に小さくなる場合は折り返しを検討
                        if (!manualWrap && targetScale < 0.7 && centerText.length > 6) {
                            canWrap = true;
                            targetScale = Math.max(0.75, targetScale * 1.2); 
                        }
                    }

                    // 最小/最大スケールの制限（長文のNUMLOCK等は十分に縮小できるように閾値を引き下げる）
                    const minScaleLimit = centerText.length >= 7 ? 0.4 : (centerText.length >= 5 ? 0.5 : 0.6);
                    targetScale = Math.max(isExportMode ? Math.min(minScaleLimit, 0.55) : minScaleLimit, Math.min(1.1, targetScale));
                    if (manualWrap) targetScale = Math.min(0.9, targetScale);

                    const cleanRaw = fullRaw ? fullRaw.toUpperCase() : '';
                    const displayRaw = (val && typeof val === 'string' && val.toUpperCase().startsWith('KC_'))
                        ? val.toUpperCase()
                        : (cleanRaw.startsWith('KC_') ? cleanRaw : 'KC_' + cleanRaw);

                    const jisSvg = k.isJIS && (() => {
                        const W = k.w - 6;
                        const H = k.h - 6;
                        const N = 14;
                        const H2 = 50; // Align perfectly with bottom of Row 2 (50px)
                        const R = 6;
                        const O = 1.2; // 50% of strokeWidth (2.4) to align stroke edge with border-box
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
                                d: pathD,
                                className: "jis-enter-path",
                                fill: fillColor,
                                stroke: strokeColor,
                                strokeWidth: 2.4, // Keep visual thickness identical to 3px CSS border
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
                                    // 特別な FN_MO13 等の2段構えデザイン
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
                                    // LTキー用の新しい2段構えデザイン
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
                                    // 通常の1段レイヤーデザイン (MO(1) や TG(2) など)
                                    createElement('div', { 
                                        className: "key-layer-main",
                                        style: getMainLegendStyle(isLight, `L${layerNum}`, false, (k.w || 56) / 56, {
                                            flex: 1,
                                            transform: 'scale(0.9)',
                                            marginTop: '6px'
                                        })
                                    }, `L${layerNum}`)
                                ),
                                createElement('div', {
                                    className: "key-layer-footer",
                                    style: getFooterContainerStyle(isLight, isAppDark)
                                }, 
                                    layerNum2 ? (
                                        // 帯の塗り分け案：背景を2:1のグラデーションで塗り分け、文字は一塊で中央配置
                                        createElement('div', {
                                            style: {
                                                flex: 1,
                                                background: `linear-gradient(to right, ${getLayerFooterColor(layerNum)} 66.6%, ${getLayerFooterColor(layerNum2)} 66.6%)`,
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
                                        // 単色帯
                                        createElement('div', {
                                            style: {
                                                flex: 1,
                                                backgroundColor: getLayerFooterColor(layerNum),
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
                                    // ① Base Modifier: color-matched icon/text
                                    createElement('div', {
                                        className: "key-content flex-1 flex items-center justify-center w-full h-full",
                                        style: {
                                            transform: `scale(${targetScale * 0.9})`,
                                            transformOrigin: 'center center',
                                            padding: '2px',
                                            paddingLeft: '6px' // offset from left accent bar
                                        }
                                    },
                                        createElement('span', {
                                            className: "legend-text",
                                            style: getMainLegendStyle(isLight, finalDisplayText, isFluentIcon, (k.w || 56) / 56, {
                                                color: getModColor(modKeys[0], isLight),
                                                ...(canWrap ? { whiteSpace: 'pre-wrap', lineHeight: '1.1' } : {})
                                            })
                                        }, finalDisplayText)
                                    )
                                ) : (
                                    // ② Mod-Tap or Direct Mod: split layout with premium colored footer band
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
                                    transform: `scale(${targetScale * 0.9})`,
                                    transformOrigin: 'center center',
                                    padding: '2px',
                                    zIndex: 2
                                } : {
                                    transform: `scale(${targetScale * 0.9})`,
                                    transformOrigin: 'center center',
                                    padding: '2px',
                                    marginTop: isExportMode ? '-2px' : '0',
                                    zIndex: 2
                                }
                            },
                                createElement('span', {
                                    className: "legend-text",
                                    style: getMainLegendStyle(isLight, finalDisplayText, isFluentIcon, (k.w || 56) / 56, {
                                        ...(canWrap ? { whiteSpace: 'pre-wrap', lineHeight: '1.1' } : {})
                                    })
                                }, finalDisplayText)
                            )
                        )
                    );
                })
            )
        )
    );
}
