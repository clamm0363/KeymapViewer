const { createElement, useState, useEffect, useMemo, useRef } = React;
const html = htm.bind(createElement);

import { FLUENT_FONT_STACK } from '../constants.js';
import { createSVGElement, isSVGAvailable, getSVGFallback, isWebFontOnly } from '../svg-icons.js';
import { findSplitX } from '../utils/helpers.js';

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

export function Keyboard({ design, layer = 0, externalMap = null, displayMode = 'Fluent', theme = 'System', appTheme = 'dark', macroAliases = {}, onMacroClick = null, forcedScale = null, isExportMode = false, keyStyle = 'Windows', separation = 'DISABLE', encoderStyles = {} }) {
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
                    list.push({ 
                        id: item, 
                        matrix: m ? [parseInt(m[1]), parseInt(m[2])] : null, 
                        x: x * UNIT, 
                        y: y * UNIT, 
                        w: w * UNIT, 
                        h: h * UNIT,
                        isJIS: isJISKey,
                        isEncoder,
                        encoderIndex
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
    }, [design, isSeparationEnabled, splitX]);

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
    
    const leftCaseStyle = useMemo(() => {
        if (!isSeparationEnabled || splitX === null) return null;
        const leftKeys = keys.filter(k => (k.x + k.w / 2) < splitX);
        if (leftKeys.length === 0) return null;

        const minX = Math.min(...leftKeys.map(k => k.x));
        const maxX = Math.max(...leftKeys.map(k => k.x + k.w));
        const minY = Math.min(...leftKeys.map(k => k.y));
        const maxY = Math.max(...leftKeys.map(k => k.y + k.h));

        const paddingOffset = 20;
        return {
            position: 'absolute',
            left: `${minX + paddingOffset - 20}px`,
            top: `${minY + paddingOffset - 20}px`,
            width: `${(maxX - minX) + 40}px`,
            height: `${(maxY - minY) + 40}px`,
            borderRadius: '2rem',
            zIndex: 0
        };
    }, [keys, isSeparationEnabled, splitX]);

    const rightCaseStyle = useMemo(() => {
        if (!isSeparationEnabled || splitX === null) return null;
        const rightKeys = keys.filter(k => (k.x + k.w / 2) >= splitX);
        if (rightKeys.length === 0) return null;

        const minX = Math.min(...rightKeys.map(k => k.x));
        const maxX = Math.max(...rightKeys.map(k => k.x + k.w));
        const minY = Math.min(...rightKeys.map(k => k.y));
        const maxY = Math.max(...rightKeys.map(k => k.y + k.h));

        const paddingOffset = 20;
        return {
            position: 'absolute',
            left: `${minX + paddingOffset - 20}px`,
            top: `${minY + paddingOffset - 20}px`,
            width: `${(maxX - minX) + 40}px`,
            height: `${(maxY - minY) + 40}px`,
            borderRadius: '2rem',
            zIndex: 0
        };
    }, [keys, isSeparationEnabled, splitX]);

    const getKbdContainerClass = () => {
        const base = "kbd-container relative transition-all duration-200";
        if (isSeparationEnabled && splitX !== null) {
            return `${base} border-0 bg-transparent shadow-none`;
        }
        const lightTheme = "border-2 bg-slate-200/80 border-slate-300/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]";
        const darkTheme = isAppDark
            ? "border-2 bg-gradient-to-br from-slate-400/40 to-slate-600/40 border-slate-500/40 shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)]"
            : "border-2 bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 border-slate-400/80 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.18),_inset_0_2px_4px_rgba(255,255,255,0.55),_inset_0_-2px_4px_rgba(0,0,0,0.15)]";
        return `${base} ${isLight ? lightTheme : darkTheme}`;
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
                transform: `scale(${finalScale})`,
                transformOrigin: 'center center',
                flexShrink: 0
            }
        },
            createElement('div', {
                className: getKbdContainerClass(),
                style: { width: '100%', height: '100%', transform: 'none' }
            }, [
                isSeparationEnabled && splitX !== null && leftCaseStyle && createElement('div', {
                    key: 'left-case',
                    style: leftCaseStyle,
                    className: "border-2 transition-all duration-200 " + (isLight 
                        ? "bg-slate-200/80 border-slate-300/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]"
                        : (isAppDark 
                            ? "bg-gradient-to-br from-slate-400/40 to-slate-600/40 border-slate-500/40 shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)]"
                            : "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 border-slate-400/80 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.18),_inset_0_2px_4px_rgba(255,255,255,0.55),_inset_0_-2px_4px_rgba(0,0,0,0.15)]"))
                }),
                isSeparationEnabled && splitX !== null && rightCaseStyle && createElement('div', {
                    key: 'right-case',
                    style: rightCaseStyle,
                    className: "border-2 transition-all duration-200 " + (isLight 
                        ? "bg-slate-200/80 border-slate-300/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]"
                        : (isAppDark 
                            ? "bg-gradient-to-br from-slate-400/40 to-slate-600/40 border-slate-500/40 shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)]"
                            : "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 border-slate-400/80 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.18),_inset_0_2px_4px_rgba(255,255,255,0.55),_inset_0_-2px_4px_rgba(0,0,0,0.15)]"))
                }),
                ...keys.map((k, i) => {
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
                            const parsedCcw = parseKeyLabel(ccwCode, ccwCode, displayMode, keyStyle, macroAliases);
                            const parsedCw = parseKeyLabel(cwCode, cwCode, displayMode, keyStyle, macroAliases);
                            ccwLabel = parsedCcw.displayText;
                            cwLabel = parsedCw.displayText;
                        }

                        const parsedPush = parseKeyLabel(val, k.id, 'Text', keyStyle, macroAliases);
                        const pushText = parsedPush.displayText;

                        let tooltipText = `Encoder e${k.encoderIndex}\n`;
                        tooltipText += `Push: ${pushText || 'None'} (${val || 'KC_NO'})`;
                        if (ccwActions) {
                            if (currentStyle === 'VerticalWheel') {
                                tooltipText += `\n🔄 UP (Rotate Right): ${cwLabel || 'None'} (${cwCode})`;
                                tooltipText += `\n🔄 DOWN (Rotate Left): ${ccwLabel || 'None'} (${ccwCode})`;
                            } else if (currentStyle === 'HorizontalWheel') {
                                tooltipText += `\n🔄 RIGHT (Rotate Right): ${cwLabel || 'None'} (${cwCode})`;
                                tooltipText += `\n🔄 LEFT (Rotate Left): ${ccwLabel || 'None'} (${ccwCode})`;
                            } else {
                                tooltipText += `\n🔄 CW (Rotate Right): ${cwLabel || 'None'} (${cwCode})`;
                                tooltipText += `\n🔄 CCW (Rotate Left): ${ccwLabel || 'None'} (${ccwCode})`;
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
                            // Dial style: render both indicator line AND text legend (knob-legend)
                            let finalDisplayText = centerText;
                            let targetScale = 1.0;
                            const availableWidth = 44 - 10;
                            const estimatedPxWidth = (isFluentCenter ? 1.2 : centerText.length) * 11.0;
                            if (estimatedPxWidth > availableWidth) {
                                targetScale = availableWidth / estimatedPxWidth;
                            }
                            targetScale = Math.max(0.5, Math.min(1.0, targetScale));

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
                                }),
                                createElement('div', {
                                    key: 'knob-legend',
                                    className: "key-content flex-1 flex items-center justify-center w-full h-full",
                                    style: {
                                        transform: `scale(${targetScale * 0.8})`,
                                        transformOrigin: 'center center',
                                        padding: '2px',
                                        marginTop: '2px',
                                        zIndex: 2
                                    }
                                },
                                    createElement('span', {
                                        className: "legend-text font-bold",
                                        style: getMainLegendStyle(isLight, finalDisplayText, isFluentIcon, 1, {
                                            fontSize: '18px',
                                            color: isLight ? '#1e293b' : '#ffffff'
                                        })
                                    }, finalDisplayText)
                                )
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
                                // SVG rendering attempt for compatible icons
                                (() => {
                                    // --- デバッグ用ログ（自白剤） ---
                                    const modeCheck = (displayMode === 'Fluent');
                                    const svgCheck = isSVGAvailable(displayRaw);
                                    
                                    console.log(`[SVG判定] ${displayRaw} | ModeOK: ${modeCheck} | SvgOK: ${svgCheck}`);

                                    // Try to use SVG if available for this key
                                    if (modeCheck && svgCheck) {
                                        const svgEl = createSVGElement(displayRaw, { size: 24, color: isLight ? '#1e293b' : '#fff' });
                                        if (svgEl) {
                                            return createElement('div', {
                                                key: 'svg-render',
                                                style: {
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                },
                                                dangerouslySetInnerHTML: { __html: svgEl.outerHTML }
                                            });
                                        }
                                    }
                                    
                                    // Fallback to WebFont text rendering
                                    return createElement('span', {
                                        className: "legend-text",
                                        style: getMainLegendStyle(isLight, finalDisplayText, isFluentIcon, (k.w || 56) / 56, {
                                            ...(canWrap ? { whiteSpace: 'pre-wrap', lineHeight: '1.1' } : {})
                                        })
                                    }, finalDisplayText);
                                })()
                            )
                        )
                    );
                })
            ])
        )
    );
}
