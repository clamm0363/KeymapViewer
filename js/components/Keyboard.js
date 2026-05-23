const { createElement, useState, useEffect, useMemo, useRef } = React;
const html = htm.bind(createElement);

import { FLUENT_FONT_STACK } from '../constants.js';
import { createSVGElement, isSVGAvailable, getSVGFallback, isWebFontOnly } from '../svg-icons.js';
import { findSplitX } from '../utils/helpers.js';

// Shared footer skeleton and text styling utilities for visual consistency across all keytypes
const getFooterContainerStyle = (isLight, isAppDark) => ({
    marginTop: 'auto',
    width: '100%',
    height: '18px',
    display: 'flex',
    zIndex: 10,
    overflow: 'hidden',
    borderBottomLeftRadius: '3px',
    borderBottomRightRadius: '3px',
    borderTop: `2px solid ${isLight ? (isAppDark ? '#94a3b8' : '#cbd5e1') : (isAppDark ? '#475569' : '#334155')}`
});

const getFooterTextStyle = (scale = 0.72, translateY = 0, fontSize = '14px') => {
    const baseFontSize = parseFloat(fontSize);
    const computedSize = Math.round(baseFontSize * scale * 100) / 100;
    return {
        fontSize: `${computedSize}px`,
        fontWeight: '500',
        fontFamily: '"Outfit", "Arial", "Helvetica", sans-serif',
        letterSpacing: '0.05em',
        lineHeight: '1',
        transform: translateY !== 0 ? `translateY(${translateY}px)` : 'none',
        whiteSpace: 'nowrap'
    };
};

// Shared layout and offset styling utilities for offset-legend keycaps (e.g., LT, FN_MO13)
const getOffsetContainerStyle = () => ({
    flex: 1,
    position: 'relative',
    width: '100%'
});

const getOffsetPrimaryStyle = (isLight, isFluent = false, customFontSize = null) => {
    const baseFontSize = parseFloat(customFontSize || (isFluent ? '26' : '22'));
    const computedSize = Math.round(baseFontSize * 0.75 * 100) / 100;
    return {
        position: 'absolute',
        left: '6px',
        bottom: '3.5px',
        fontSize: `${computedSize}px`,
        fontWeight: '400',
        fontFamily: isFluent 
            ? FLUENT_FONT_STACK.primary
            : FLUENT_FONT_STACK.fallback,
        color: isLight ? '#1e293b' : '#fff',
        lineHeight: '1'
    };
};

const getOffsetSecondaryStyle = (isLight) => ({
    position: 'absolute',
    right: '6px',
    top: '3px',
    fontSize: '12px',
    fontWeight: '400',
    fontFamily: '"Outfit", "Arial", "Helvetica", sans-serif',
    color: isLight ? '#64748b' : '#94a3b8',
    opacity: 0.8,
    lineHeight: '1'
});

// Calculate text scale based on character length and key width to maintain physical harmony
const getTextScale = (displayText, keyWidth = 1, isFluentIcon = false) => {
    let textScale = 1.0;
    if (!isFluentIcon && displayText) {
        const isFunctionKey = /^F\d+$/.test(displayText);
        if (isFunctionKey) {
            textScale = 1.0;
        } else {
            const len = displayText.length;
            if (len === 3) {
                textScale = keyWidth >= 1.25 ? 0.85 : 0.62;
            }
            else if (len === 4) {
                textScale = keyWidth >= 1.25 ? 0.85 : 0.62;
            }
            else if (len >= 5) {
                if (keyWidth >= 2.0) {
                    textScale = 0.85;
                } else if (keyWidth >= 1.25) {
                    textScale = 0.70;
                } else {
                    textScale = 0.55;
                }
            }
        }
    }
    return textScale;
};

// Shared main legend styling utility for standard/modifier/layer text keycaps to enforce strict size harmony
const getMainLegendStyle = (isLight, displayText, isFluentIcon = false, keyWidth = 1, customOverrides = {}) => {
    // 1uキーキャップ基準で、文字数（長さ）に応じて完全に均一な縮小率を適用し、表示崩れを防ぐ
    const textScale = getTextScale(displayText, keyWidth, isFluentIcon);
    const baseFontSize = 22;
    // Use direct fontSize instead of transform:scale() for accurate centering in all rendering contexts
    const computedFontSize = isFluentIcon ? baseFontSize : Math.round(baseFontSize * textScale * 100) / 100;

    const baseStyle = {
        color: isLight ? '#1e293b' : '#fff',
        fontWeight: isFluentIcon ? '400' : '400',
        fontFamily: isFluentIcon 
            ? (displayText === '\uE986' ? FLUENT_FONT_STACK.jpKana : FLUENT_FONT_STACK.primary)
            : FLUENT_FONT_STACK.fallback,
        fontSize: `${computedFontSize}px`,
        lineHeight: '1',
        transform: isFluentIcon ? 'translateY(1.5px)' : 'none',
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

export function Keyboard({ design, layer = 0, externalMap = null, displayMode = 'Fluent', theme = 'System', appTheme = 'dark', macroAliases = {}, onMacroClick = null, forcedScale = null, keyStyle = 'Windows', separation = 'DISABLE', encoderStyles = {}, layoutOptions = {} }) {
    const [codes, setCodes] = useState({});
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    
    const isLight = theme === 'Light' || (theme === 'System' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
    const isAppDark = (appTheme === 'dark' || (appTheme === 'System' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));

    const getEncoderActions = (encoderIdx, layerIdx) => {
        const encodersSource = (externalMap && externalMap.encoders) || (design && design.encoders);
        if (!encodersSource || !encodersSource[encoderIdx]) return null;
        const encData = encodersSource[encoderIdx];
        if (encData && encData[layerIdx]) {
            return encData[layerIdx];
        }
        return null;
    };

    const isSeparationEnabled = separation === 'ENABLE';
    const splitX = useMemo(() => {
        if (!isSeparationEnabled) return null;
        return findSplitX(design);
    }, [design, isSeparationEnabled]);

    const activeLayoutOptions = useMemo(() => {
        return layoutOptions || {};
    }, [layoutOptions]);

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
                    const parts = item.split('\n');
                    const m = parts[0].match(/(\d+),(\d+)/);
                    const encoderMatch = parts.find(p => /^e\d+$/.test(p.trim()));
                    const isEncoder = !!encoderMatch;
                    const encoderIndex = isEncoder ? parseInt(encoderMatch.replace('e', ''), 10) : null;
                    
                    let optionIdx = null;
                    let optionVal = null;
                    for (let i = 1; i < parts.length; i++) {
                        const p = parts[i].trim();
                        if (/^\d+,\d+$/.test(p)) {
                            const [optIdx, optVal] = p.split(',').map(num => parseInt(num, 10));
                            optionIdx = optIdx;
                            optionVal = optVal;
                            break;
                        }
                    }

                    // Evaluate layout option condition during coordinate calculation
                    // to determine if keycap should be visible, without skipping coordinate accumulation.
                    let isVisible = true;
                    if (optionIdx !== null && optionIdx !== undefined) {
                        const selectedVal = activeLayoutOptions[optionIdx] !== undefined ? activeLayoutOptions[optionIdx] : 0;
                        if (selectedVal !== optionVal) {
                            isVisible = false;
                        }
                    }
                    
                    if (isVisible) {
                        list.push({ 
                            id: item, 
                            matrix: m ? [parseInt(m[1]), parseInt(m[2])] : null, 
                            x: x * UNIT, 
                            y: y * UNIT, 
                            w: w * UNIT, 
                            h: h * UNIT,
                            isJIS: isJISKey,
                            isEncoder,
                            encoderIndex,
                            optionIdx,
                            optionVal
                        });
                    }
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

        // Shift right keys to ensure 1u physical gap
        if (isSeparationEnabled && splitX !== null) {
            const leftKeys = list.filter(k => (k.x + k.w / 2) < splitX);
            const rightKeys = list.filter(k => (k.x + k.w / 2) >= splitX);

            if (leftKeys.length > 0 && rightKeys.length > 0) {
                const leftMaxX = Math.max(...leftKeys.map(k => k.x + k.w));
                const rightMinX = Math.min(...rightKeys.map(k => k.x));

                const originalGap = rightMinX - leftMaxX;
                const targetGap = UNIT * 1.5; // 84px (1.5u)
                const shiftX = targetGap - originalGap;

                rightKeys.forEach(k => {
                    k.x += shiftX;
                });
            }
        }

        return list;
    }, [design, isSeparationEnabled, splitX, activeLayoutOptions]);

    const filteredKeys = keys;

    const maxWidth = useMemo(() => filteredKeys.length ? Math.max(...filteredKeys.map(k => k.x + k.w), 0) + 40 : 0, [filteredKeys]);
    const maxHeight = useMemo(() => filteredKeys.length ? Math.max(...filteredKeys.map(k => k.y + k.h), 0) + 40 : 0, [filteredKeys]);

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

    if (filteredKeys.length === 0) return null;

    // --- Styling Constants & Helpers ---
    
    const leftCaseStyle = useMemo(() => {
        if (!isSeparationEnabled || splitX === null) return null;
        const leftKeys = filteredKeys.filter(k => (k.x + k.w / 2) < splitX);
        if (leftKeys.length === 0) return null;

        const minX = Math.min(...leftKeys.map(k => k.x));
        const maxX = Math.max(...leftKeys.map(k => k.x + k.w));
        const minY = Math.min(...leftKeys.map(k => k.y));
        const maxY = Math.max(...leftKeys.map(k => k.y + k.h));

        const paddingOffset = 20;

        let border = '';
        let boxShadow = '';
        
        if (isLight) {
            border = '2px solid rgba(203, 213, 225, 0.5)';
            boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.05)';
        } else if (isAppDark) {
            border = '2px solid rgba(100, 116, 139, 0.4)';
            boxShadow = 'inset 0 2px 20px rgba(0,0,0,0.4)';
        } else {
            border = '2px solid rgba(148, 163, 184, 0.8)';
            boxShadow = '0 10px 30px -10px rgba(15,23,42,0.18), inset 0 2px 4px rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.15)';
        }

        return {
            position: 'absolute',
            left: `${minX + paddingOffset - 20}px`,
            top: `${minY + paddingOffset - 20}px`,
            width: `${(maxX - minX) + 40}px`,
            height: `${(maxY - minY) + 40}px`,
            borderRadius: '2rem',
            overflow: 'hidden',
            zIndex: 0,
            border,
            boxShadow
        };
    }, [filteredKeys, isSeparationEnabled, splitX, isLight, isAppDark]);

    const rightCaseStyle = useMemo(() => {
        if (!isSeparationEnabled || splitX === null) return null;
        const rightKeys = filteredKeys.filter(k => (k.x + k.w / 2) >= splitX);
        if (rightKeys.length === 0) return null;

        const minX = Math.min(...rightKeys.map(k => k.x));
        const maxX = Math.max(...rightKeys.map(k => k.x + k.w));
        const minY = Math.min(...rightKeys.map(k => k.y));
        const maxY = Math.max(...rightKeys.map(k => k.y + k.h));

        const paddingOffset = 20;

        let border = '';
        let boxShadow = '';
        
        if (isLight) {
            border = '2px solid rgba(203, 213, 225, 0.5)';
            boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.05)';
        } else if (isAppDark) {
            border = '2px solid rgba(100, 116, 139, 0.4)';
            boxShadow = 'inset 0 2px 20px rgba(0,0,0,0.4)';
        } else {
            border = '2px solid rgba(148, 163, 184, 0.8)';
            boxShadow = '0 10px 30px -10px rgba(15,23,42,0.18), inset 0 2px 4px rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.15)';
        }

        return {
            position: 'absolute',
            left: `${minX + paddingOffset - 20}px`,
            top: `${minY + paddingOffset - 20}px`,
            width: `${(maxX - minX) + 40}px`,
            height: `${(maxY - minY) + 40}px`,
            borderRadius: '2rem',
            overflow: 'hidden',
            zIndex: 0,
            border,
            boxShadow
        };
    }, [filteredKeys, isSeparationEnabled, splitX, isLight, isAppDark]);

    const getKbdContainerClass = () => {
        return "kbd-container relative transition-all duration-200";
    };

    // kbd-container の外枠スタイル（角丸 + overflow:hidden でクリッピングを担当）
    // html2canvas は要素自身の background を border-radius でクリップするのにバグがあるため、
    // 背景は子要素として分離し、overflow:hidden で物理的にクリップする2層構造を採る。
    const getKbdContainerStyle = () => {
        const baseStyle = { 
            width: '100%', 
            height: '100%', 
            transform: 'none',
            borderRadius: '2rem',
            overflow: 'hidden',
            position: 'relative'
        };
        
        if (isSeparationEnabled && splitX !== null) {
            return {
                ...baseStyle,
                border: 'none',
                background: 'transparent',
                boxShadow: 'none'
            };
        }
        
        let border = '';
        let boxShadow = '';
        
        if (isLight) {
            border = '2px solid rgba(203, 213, 225, 0.5)';
            boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.05)';
        } else if (isAppDark) {
            border = '2px solid rgba(100, 116, 139, 0.4)';
            boxShadow = 'inset 0 2px 20px rgba(0,0,0,0.4)';
        } else {
            border = '2px solid rgba(148, 163, 184, 0.8)';
            boxShadow = '0 10px 30px -10px rgba(15,23,42,0.18), inset 0 2px 4px rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.15)';
        }

        return {
            ...baseStyle,
            border,
            boxShadow
        };
    };

    // kbd-container 背景塗り用の内部子要素スタイル
    // border-radius の外枠側で overflow:hidden によりクリップされるため、
    // この子要素のグラデーション背景は角丸に沿って正しく切り抜かれる。
    const getKbdBackgroundStyle = () => {
        if (isSeparationEnabled && splitX !== null) return null;

        let background = '';
        if (isLight) {
            background = 'rgba(226, 232, 240, 0.8)';
        } else if (isAppDark) {
            background = 'linear-gradient(135deg, rgba(148, 163, 184, 0.4) 0%, rgba(71, 85, 105, 0.4) 100%)';
        } else {
            background = 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)';
        }

        return {
            position: 'absolute',
            top: '-3px', // ボーダー領域を完全に覆うために外側へ拡張
            left: '-3px',
            width: 'calc(100% + 6px)',
            height: 'calc(100% + 6px)',
            background,
            zIndex: 0,
            pointerEvents: 'none'
        };
    };

    // 分離筐体用の背景塗り子要素スタイル
    const getCaseBgFillStyle = () => {
        let background = '';
        if (isLight) {
            background = 'rgba(226, 232, 240, 0.8)';
        } else if (isAppDark) {
            background = 'linear-gradient(135deg, rgba(148, 163, 184, 0.4) 0%, rgba(71, 85, 105, 0.4) 100%)';
        } else {
            background = 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)';
        }
        return {
            position: 'absolute',
            top: '-3px', // ボーダー領域を完全に覆うために外側へ拡張
            left: '-3px',
            width: 'calc(100% + 6px)',
            height: 'calc(100% + 6px)',
            background,
            pointerEvents: 'none'
        };
    };

    /**
     * キートップの外枠（Frame）スタイル
     */
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
                transform: finalScale === 1 ? 'none' : `scale(${finalScale})`,
                transformOrigin: 'center center',
                flexShrink: 0
            }
        },
            createElement('div', {
                className: getKbdContainerClass(),
                style: getKbdContainerStyle()
            }, [
                // 筐体背景の塗り用子要素（外枠の overflow:hidden で角丸クリップされる）
                getKbdBackgroundStyle() && createElement('div', {
                    key: 'kbd-bg-fill',
                    style: getKbdBackgroundStyle()
                }),
                isSeparationEnabled && splitX !== null && leftCaseStyle && createElement('div', {
                    key: 'left-case',
                    style: leftCaseStyle,
                    className: "transition-all duration-200"
                },
                    createElement('div', { style: getCaseBgFillStyle() })
                ),
                isSeparationEnabled && splitX !== null && rightCaseStyle && createElement('div', {
                    key: 'right-case',
                    style: rightCaseStyle,
                    className: "transition-all duration-200"
                },
                    createElement('div', { style: getCaseBgFillStyle() })
                ),
                ...filteredKeys.map((k, i) => {
                    const mK = k.matrix ? `${k.matrix[0]},${k.matrix[1]}` : null;
                    const val = mK ? codes[mK] : null;
                    
                    const parsed = parseKeyLabel(val, k.id, displayMode, keyStyle, macroAliases);
                    let {
                        fullRaw, displayText, isFluentIcon, isLayerKey,
                        layerType, layerNum, layerNum2, tapLabel, tapIsFluent, visualWeight,
                        isModKey, modType, modLabel, modKeys, baseLabel, baseIsFluent
                    } = parsed;

                    // RGB制御キー用の判定とマッピング定義
                    const cleanRawForRGB = fullRaw ? fullRaw.toUpperCase() : '';
                    const displayRawForRGB = (val && typeof val === 'string' && val.toUpperCase().startsWith('KC_'))
                        ? val.toUpperCase()
                        : (cleanRawForRGB.startsWith('KC_') ? cleanRawForRGB : 'KC_' + cleanRawForRGB);
                    const isRGBKey = displayRawForRGB.startsWith('KC_RGB_');
                    const rgbLabels = {
                        "KC_RGB_TOG": "TOG",
                        "KC_RGB_MOD": "MODE+",
                        "KC_RGB_RMOD": "MODE-",
                        "KC_RGB_HUI": "HUE+",
                        "KC_RGB_HUD": "HUE-",
                        "KC_RGB_SAI": "SAT+",
                        "KC_RGB_SAD": "SAT-",
                        "KC_RGB_VAI": "VAL+",
                        "KC_RGB_VAD": "VAL-",
                        "KC_RGB_SPI": "SPD+",
                        "KC_RGB_SPD": "SPD-"
                    };
                    const isFluentMode = (displayMode === 'Fluent');
                    const isRGBFluent = isRGBKey && isFluentMode && isSVGAvailable(displayRawForRGB);
                    const rgbLabel = rgbLabels[displayRawForRGB] || '';

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

                    if (k.isEncoder) {
                        const currentStyle = (encoderStyles && encoderStyles[k.encoderIndex]) || 'Dial';
                        const ccwActions = getEncoderActions(k.encoderIndex, layer);
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
                            // Dial style: render ONLY indicator line, no text legend (per pre-merge dev branch design)
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
                    const availableWidth = kWidth - 2;
                    
                    // スケール計算: visualWeightに基づき、かつ1u(56px)基準で調整
                    let visualWeightForScale = centerText.length;
                    if (isFluentCenter) {
                        visualWeightForScale = 1.2;
                    } else if (isModKey && modType !== 'base') {
                        visualWeightForScale += 0.5;
                    }

                    // 同一の文字数のキーが一律で同じ縮小率となるよう、1文字あたりの幅を均一に10.5pxとして計算
                    const charWidthMultiplier = 10.5;
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
                    targetScale = Math.max(minScaleLimit, Math.min(1.1, targetScale));
                    if (manualWrap) targetScale = Math.min(0.9, targetScale);

                    const cleanRaw = fullRaw ? fullRaw.toUpperCase() : '';
                    const displayRaw = (val && typeof val === 'string' && val.toUpperCase().startsWith('KC_'))
                        ? val.toUpperCase()
                        : (cleanRaw.startsWith('KC_') ? cleanRaw : 'KC_' + cleanRaw);

                    // 🌟🌟🌟 以下の3行を新しく追加 🌟🌟🌟
                    if (displayMode?.toLowerCase() === 'fluent' && isSVGAvailable(displayRaw)) {
                    targetScale = 1.11; // SVGの場合は文字数による縮小を解除（後で0.9が掛けられて1.0倍になります）
                    }
                    // 🌟🌟🌟 追加ここまで 🌟🌟🌟

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
                                    (() => {
                                        const textScale = getTextScale(finalDisplayText, (k.w || 56) / 56, isFluentIcon);
                                        const combinedScale = targetScale * textScale * 0.9;
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
                                                    style: getMainLegendStyle(isLight, finalDisplayText, isFluentIcon, (k.w || 56) / 56, {
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
                                    // 🌟 RGB制御キー用の選択肢A（帯なしスプリット）レイアウト 🌟
                                    (() => {
                                        const effectiveSvgSize = 20;
                                        const svgEl = createSVGElement(displayRawForRGB, { size: effectiveSvgSize, color: isLight ? '#1e293b' : '#fff' });
                                        
                                        return createElement('div', {
                                            style: {
                                                position: 'relative',
                                                width: '100%',
                                                height: '100%',
                                                boxSizing: 'border-box'
                                            }
                                        }, [
                                            // ① アイコン領域: キートップの完全な「物理的中心（Y=50%）」にセンタリング配置
                                            svgEl && createElement('div', {
                                                key: 'rgb-svg-render',
                                                style: {
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    zIndex: 1
                                                },
                                                dangerouslySetInnerHTML: { __html: svgEl.outerHTML }
                                            }),
                                            // ② テキスト領域: キートップの最下部（bottom: 0.5px）に絶対配置
                                            createElement('div', {
                                                key: 'rgb-text-label',
                                                style: {
                                                    position: 'absolute',
                                                    bottom: '0.5px', // 限界まで底辺に寄せる（角丸やボーダーと干渉しないスレスレ）
                                                    left: 0,
                                                    width: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    zIndex: 2,
                                                    pointerEvents: 'none',
                                                    userSelect: 'none'
                                                }
                                            }, 
                                                createElement('span', {
                                                    style: {
                                                        fontSize: '11px', // 最小フォント制限回避
                                                        fontWeight: '500', 
                                                        color: isLight ? '#1e293b' : '#ffffff', // 通常のキーと同じくっきりとした文字色
                                                        fontFamily: '"Outfit", sans-serif',
                                                        letterSpacing: '0.06em', 
                                                        lineHeight: '1',
                                                        textTransform: 'uppercase',
                                                        transform: 'scale(0.55)', // 6.5px ➔ 6.0px 相当に微調整してさらにスッキリと
                                                        transformOrigin: 'bottom center',
                                                        display: 'inline-block',
                                                        whiteSpace: 'nowrap'
                                                    }
                                                }, rgbLabel)
                                            )
                                        ]);
                                    })()
                                ) : (
                                    // 通常のキーレンダリング
                                    (() => {
                                        const textScale = getTextScale(finalDisplayText, (k.w || 56) / 56, isFluentIcon);
                                        const combinedScale = targetScale * textScale * 0.9;
                                        return createElement('div', {
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
                                            // SVG or Text rendering
                                            (() => {
                                                const modeCheck = (displayMode === 'Fluent');
                                                const svgCheck = isSVGAvailable(displayRaw);

                                                // SVG icon rendering: create SVG at effective size directly
                                                if (modeCheck && svgCheck) {
                                                    const effectiveSvgSize = Math.max(8, Math.round(24 * combinedScale));
                                                    const svgEl = createSVGElement(displayRaw, { size: effectiveSvgSize, color: isLight ? '#1e293b' : '#fff' });
                                                    if (svgEl) {
                                                        return createElement('div', {
                                                            key: 'svg-render',
                                                            style: {
                                                                width: effectiveSvgSize + 'px',
                                                                height: effectiveSvgSize + 'px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            },
                                                            dangerouslySetInnerHTML: { __html: svgEl.outerHTML }
                                                        });
                                                    }
                                                }
                                                
                                                // Text rendering: use effective fontSize directly (no CSS transform)
                                                const effectiveFontSize = 22 * combinedScale;
                                                const needsScaleBypass = effectiveFontSize < 14;
                                                return createElement('div', {
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
                                                 }, finalDisplayText ? createElement('span', {
                                                     style: needsScaleBypass ? {
                                                         transform: `scale(${effectiveFontSize / 16})`,
                                                         transformOrigin: 'center center',
                                                         display: 'inline-block',
                                                         whiteSpace: 'nowrap'
                                                     } : null
                                                 }, finalDisplayText) : null);
                                            })()
                                        );
                                    })()
                                )
                            )
                        )
                    );
                })
            ])
        )
    );
}
