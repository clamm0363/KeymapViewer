const { createElement, useState, useEffect, useMemo, useRef } = React;
const html = htm.bind(createElement);

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
                        h: h * UNIT 
                    });
                    x += w; w = 1; h = 1;
                } else {
                    if (item.x !== undefined) x += item.x; 
                    if (item.y !== undefined) y += item.y;
                    if (item.w !== undefined) w = item.w; 
                    if (item.h !== undefined) h = item.h;
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
        const darkTheme = "bg-gradient-to-br from-slate-400/40 to-slate-600/40 border-slate-500/40 shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)]";
        return `${base} ${isLight ? lightTheme : darkTheme}`;
    };

    /**
     * キートップの外枠（Frame）スタイル
     */
    const getKeycapFrameStyle = (k, isLayerKey) => {
        const paddingOffset = 20;
        const lightBorder = isAppDark ? '#94a3b8' : '#cbd5e1';
        const darkBorder = isAppDark ? '#475569' : '#334155';
        
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
            backgroundColor: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.6)',
            boxShadow: isLight ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : '0 20px 25px -5px rgb(0 0 0 / 0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.075s ease'
        };
    };

    /**
     * 凡例（Legend）の基本スタイル
     */
    const getLegendBaseStyle = (isFluentIcon, displayText, canWrap) => ({
        color: isLight ? '#1e293b' : '#fff',
        fontWeight: isFluentIcon ? '400' : '800',
        fontFamily: isFluentIcon ? '"FluentSystemIcons-Regular", "Inter", sans-serif' : 'inherit',
        fontSize: (isFluentIcon || (displayText.length === 1 && /[\u2100-\u23FF]/.test(displayText))) ? '1.4em' : '18px',
        whiteSpace: canWrap ? 'pre-wrap' : 'nowrap',
        lineHeight: canWrap ? '1.1' : '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        width: '100%'
    });

    const getLayerFooterColor = (num) => {
        const lightColors = ['#64748b', '#2563eb', '#4f46e5', '#0891b2', '#10b981', '#f59e0b', '#ea580c', '#e11d48', '#9333ea', '#0284c7'];
        const darkColors = ['#475569', '#1e40af', '#3730a3', '#155e75', '#065f46', '#92400e', '#9a3412', '#9f1239', '#6b21a8', '#075985'];
        return (isLight ? lightColors : darkColors)[num % 10];
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
                    const {
                        fullRaw, displayText, isFluentIcon, isLayerKey,
                        layerType, layerNum, layerNum2, tapLabel, tapIsFluent, visualWeight
                    } = parsed;

                    // 自動スケーリングと折り返しの計算
                    let finalDisplayText = displayText;
                    let manualWrap = false;
                    
                    // 特殊記号での自動折り返し試行
                    if (displayText.length > 5 && (displayText.includes('_') || displayText.includes('-'))) {
                        const splitIdx = Math.max(displayText.lastIndexOf('_'), displayText.lastIndexOf('-'));
                        if (splitIdx > 1 && splitIdx < displayText.length - 2) {
                            finalDisplayText = displayText.substring(0, splitIdx) + '\n' + displayText.substring(splitIdx);
                            manualWrap = true;
                        }
                    }

                    const kWidth = (k.w - 12); // 内寸の目安
                    const availableWidth = kWidth - (isExportMode ? 4 : 2);
                    
                    // スケール計算: visualWeightに基づき、かつ1u(56px)基準で調整
                    // 18px (base font size) * visualWeight が目安の幅
                    const estimatedPxWidth = visualWeight * 11.0; 
                    let targetScale = 1.0;
                    let canWrap = manualWrap;

                    if (estimatedPxWidth > availableWidth) {
                        targetScale = availableWidth / estimatedPxWidth;
                        // 極端に小さくなる場合は折り返しを検討
                        if (!manualWrap && targetScale < 0.7 && displayText.length > 6) {
                            canWrap = true;
                            targetScale = Math.max(0.75, targetScale * 1.2); 
                        }
                    }

                    // 最小/最大スケールの制限
                    targetScale = Math.max(isExportMode ? 0.55 : 0.6, Math.min(1.1, targetScale));
                    if (manualWrap) targetScale = Math.min(0.9, targetScale);

                    return createElement('div', {
                        key: i,
                        className: `key-cap group`,
                        title: fullRaw,
                        onClick: (e) => {
                            const macroMatch = fullRaw.match(/MACRO\((\d+)\)/);
                            if (macroMatch && onMacroClick) {
                                e.stopPropagation();
                                onMacroClick(parseInt(macroMatch[1], 10));
                            }
                        },
                        style: getKeycapFrameStyle(k, isLayerKey)
                    }, 
                        isLayerKey ? (
                            createElement('div', { className: "key-layer-container", style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' } },
                                layerNum2 ? (
                                    // 特別な FN_MO13 等の2段構えデザイン
                                    createElement('div', { 
                                        className: "key-layer-main relative",
                                        style: { flex: 1, position: 'relative', width: '100%' }
                                    }, 
                                        createElement('div', {
                                            className: "layer-primary",
                                            style: {
                                                position: 'absolute',
                                                left: '6px', // 4pxから少し中央寄りへ
                                                bottom: '2px', // 0pxから少し上げ
                                                fontSize: '24px',
                                                fontWeight: '900',
                                                color: isLight ? '#1e293b' : '#fff',
                                                transform: 'scale(0.75)',
                                                transformOrigin: 'left bottom'
                                            }
                                        }, `L${layerNum}`),
                                        createElement('div', {
                                            className: "layer-secondary",
                                            style: {
                                                position: 'absolute',
                                                right: '6px', // 4pxから少し中央寄りへ
                                                top: '3px', // 1pxから少し下げ
                                                fontSize: '16px',
                                                fontWeight: '700',
                                                color: isLight ? '#64748b' : '#94a3b8',
                                                opacity: 0.8,
                                                transform: 'scale(0.75)',
                                                transformOrigin: 'right top'
                                            }
                                        }, `L${layerNum2}`)
                                    )
                                ) : (
                                    // 通常の1段レイヤーデザイン
                                    createElement('div', { 
                                        className: "key-layer-main",
                                        style: {
                                            color: isLight ? '#1e293b' : '#fff',
                                            fontFamily: (layerType === 'LT' && tapIsFluent) ? '"FluentSystemIcons-Regular", "Inter", sans-serif' : 'inherit',
                                            fontSize: (layerType === 'LT' && tapIsFluent) ? '1.4em' : '22px',
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transform: (layerType === 'LT' && tapIsFluent) ? 'none' : 'scale(0.85)',
                                            transformOrigin: 'center center'
                                        }
                                    }, layerType === 'LT' ? tapLabel : `L${layerNum}`)
                                ),
                                createElement('div', {
                                    className: "key-layer-footer",
                                    style: {
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
                                    }
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
                                                style: {
                                                    fontSize: '18px',
                                                    fontWeight: '900',
                                                    letterSpacing: '0.05em',
                                                    transform: 'scale(0.55) translateY(-1px)',
                                                    transformOrigin: 'center center',
                                                    whiteSpace: 'nowrap'
                                                }
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
                                                style: { 
                                                    fontSize: '14px',
                                                    fontWeight: '900',
                                                    letterSpacing: '0.05em',
                                                    transform: 'scale(0.72) translateY(-1px)',
                                                    transformOrigin: 'center center',
                                                    whiteSpace: 'nowrap'
                                                } 
                                            }, 
                                                layerType,
                                                layerType === 'LT' && createElement('b', { style: { color: '#facc15', marginLeft: '2px', fontWeight: '900' } }, layerNum)
                                            )
                                        )
                                    )
                                )
                            )
                        ) : (
                            createElement('div', {
                                className: "key-content flex-1 flex items-center justify-center w-full h-full",
                                style: {
                                    transform: `scale(${targetScale * 0.9})`, // 全体的に少し余裕を持たせる
                                    transformOrigin: 'center center',
                                    padding: '2px',
                                    marginTop: isExportMode ? '-2px' : '0'
                                }
                            },
                                createElement('span', {
                                    className: "legend-text",
                                    style: {
                                        ...getLegendBaseStyle(isFluentIcon, finalDisplayText, canWrap),
                                        fontSize: isFluentIcon ? '1.4em' : '22px', // 大きめのベースサイズ
                                        transform: isFluentIcon ? 'none' : 'scale(0.85)', // 文字のみスケール調整
                                        transformOrigin: 'center center'
                                    }
                                }, finalDisplayText)
                            )
                        )
                    );
                })
            )
        )
    );
}
