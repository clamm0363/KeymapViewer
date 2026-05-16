const { createElement, useState, useEffect, useMemo, useRef, Fragment } = React;
const html = htm.bind(createElement);

import { SYMBOL_MAP, FLUENT_MAP } from '../constants.js';
import { getRawLabel } from '../utils/helpers.js';

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
                className: `kbd-container relative transition-all duration-200 border-2 ${
                    isLight
                    ? 'bg-slate-200/80 border-slate-300/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]'
                    : 'bg-gradient-to-br from-slate-400/40 to-slate-600/40 border-slate-500/40 shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)]'
                }`,
                style: {
                    width: '100%',
                    height: '100%',
                    transform: 'none'
                }
            },
                html`
                ${keys.map((k, i) => {
                    const mK = k.matrix ? `${k.matrix[0]},${k.matrix[1]}` : null;
                    const val = mK ? codes[mK] : null;
                    const fullRaw = getRawLabel(val || (k.id.includes('\n') ? k.id.split('\n').pop() : k.id));
                    
                    let complex = null;
                    let m = fullRaw.match(/^LT(\d+)\((L\d+),\s*(.+)\)$/);
                    if (m) complex = { type: 'lt', mod: m[2], base: m[3], symbol: '/' };
                    if (!complex) {
                        m = fullRaw.match(/^MT\(MOD_(\w+),\s*(.+)\)$/);
                        const modMap = { 'LCTL': 'CTRL', 'RCTL': 'CTRL', 'LSFT': 'SHIFT', 'RSFT': 'SHIFT', 'LALT': 'ALT', 'RALT': 'ALT', 'LGUI': 'GUI', 'RGUI': 'GUI' };
                        if (m) complex = { type: 'mt', mod: modMap[m[1]] || m[1], base: m[2], symbol: '/' };
                    }
                    if (!complex) {
                        m = fullRaw.match(/^([ACSG])\((.+)\)$/);
                        const modMap = { 'A': 'ALT', 'C': 'CTRL', 'S': 'SHIFT', 'G': 'GUI' };
                        if (m) complex = { type: 'mod', mod: modMap[m[1]], base: m[2], symbol: '+' };
                    }
                    if (!complex) {
                        m = fullRaw.match(/^(LCTL|LSFT|LALT|LGUI|RCTL|RSFT|RALT|RGUI)\((.+)\)$/);
                        const modMap = { 'LCTL': 'CTRL', 'RCTL': 'CTRL', 'LSFT': 'SHIFT', 'RSFT': 'SHIFT', 'LALT': 'ALT', 'RALT': 'ALT', 'LGUI': 'GUI', 'RGUI': 'GUI' };
                        if (m) complex = { type: 'mod', mod: modMap[m[1]], base: m[2], symbol: '+' };
                    }
                    if (!complex) {
                        m = fullRaw.match(/^(LCA|LSA|RSA|RCS|LCG|RCG|LSG|RSG|LAG|RAG|MEH|HYPR)\((.+)\)$/);
                        const multiMap = {
                            'LCA': 'CTRL+ALT', 'LSA': 'SHIFT+ALT', 'RSA': 'SHIFT+ALT', 'RCS': 'CTRL+SHIFT',
                            'LCG': 'CTRL+GUI', 'RCG': 'CTRL+GUI', 'LSG': 'SHIFT+GUI', 'RSG': 'SHIFT+GUI',
                            'LAG': 'ALT+GUI', 'RAG': 'ALT+GUI', 'MEH': 'CTRL+ALT+SHFT', 'HYPR': 'CTRL+ALT+SHFT+GUI'
                        };
                        if (m) complex = { type: 'mod', mod: multiMap[m[1]], base: m[2], symbol: '+' };
                    }

                    const raw = fullRaw.replace(/MACRO\((\d+)\)/g, (match, p1) => (macroAliases && macroAliases[p1] ? macroAliases[p1] : `M${p1}`)).replace(/CUSTOM\((\d+)\)/g, 'C$1');

                    let displayText = raw;
                    let isFluentIcon = false;

                    const dict = window.KeymapDictionary || { modifiers: {}, keys: {} };
                    const getDictLabel = (kCode) => {
                        const cleanCode = kCode.startsWith('KC_') ? kCode : `KC_${kCode}`;
                        if (dict.modifiers[cleanCode]) {
                            const entry = dict.modifiers[cleanCode];
                            return displayMode === 'Fluent' ? (keyStyle === 'Mac' ? entry.mac : entry.win) : (entry.text || kCode.replace('KC_', ''));
                        }
                        if (dict.keys[cleanCode]) {
                            const entry = dict.keys[cleanCode];
                            return displayMode === 'Fluent' && entry.fluent ? entry.fluent : (entry.text || kCode.replace('KC_', ''));
                        }
                        return null;
                    };

                    if (complex) {
                        const dictMod = getDictLabel(complex.mod);
                        const dictBase = getDictLabel(complex.base);
                        const hasFluentMod = displayMode === 'Fluent' && (dictMod || !!FLUENT_MAP[complex.mod]);
                        const baseStrRaw = complex.base.replace('KC_', '');
                        const hasFluentBase = displayMode === 'Fluent' && (dictBase || !!FLUENT_MAP[baseStrRaw]);
                        const modStr = dictMod || (hasFluentMod ? FLUENT_MAP[complex.mod] : (SYMBOL_MAP[complex.mod] || complex.mod));
                        const baseStr = dictBase || (hasFluentBase ? FLUENT_MAP[baseStrRaw] : (SYMBOL_MAP[baseStrRaw] || baseStrRaw));
                        displayText = `${modStr}${complex.symbol}${baseStr}`;
                        if (hasFluentMod || hasFluentBase) isFluentIcon = true;
                    } else {
                        const dictLabel = getDictLabel(raw);
                        if (dictLabel) {
                            displayText = dictLabel;
                            const cleanCode = raw.startsWith('KC_') ? raw : `KC_${raw}`;
                            const entry = dict.modifiers[cleanCode] || dict.keys[cleanCode];
                            if (displayMode === 'Fluent' && entry) {
                                if (entry.isFluent === true || (entry.fluent)) {
                                    isFluentIcon = true;
                                } else if (entry.isFluent === 'auto') {
                                    isFluentIcon = (displayText.length === 1 && displayText.charCodeAt(0) >= 0xE000);
                                }
                            }
                        } else if (displayMode === 'Fluent' && FLUENT_MAP[raw]) {
                            displayText = FLUENT_MAP[raw];
                            isFluentIcon = true;
                        } else if (/^\d+,\d+$/.test(displayText)) {
                            displayText = "";
                        } else {
                            displayText = SYMBOL_MAP[raw] || raw;
                        }
                    }

                    const layerMatch = raw.match(/^(MO|TG|TT|OSL|TO|DF)\((\d+)\)$/);
                    const ltMatch = raw.match(/^LT\((\d+),\s*(.+)\)$/);
                    const fnMoMatch = raw.match(/^FN_MO(\d+)(\d*)$/);
                    const isLayerKey = !!(layerMatch || ltMatch || fnMoMatch);
                    const layerType = isLayerKey ? (layerMatch ? layerMatch[1] : (ltMatch ? 'LT' : 'FN')) : null;
                    const layerNum = isLayerKey ? (layerMatch ? layerMatch[2] : (ltMatch ? ltMatch[1] : fnMoMatch[1])) : null;
                    let tapLabel = '';
                    let tapIsFluent = false;
                    if (ltMatch) {
                        const tKeyRaw = ltMatch[2];
                        const dictLabel = getDictLabel(tKeyRaw);
                        tapLabel = dictLabel || SYMBOL_MAP[tKeyRaw] || tKeyRaw.replace('KC_', '');
                        const cleanTKey = tKeyRaw.replace('KC_', '');
                        const entry = dict.keys[`KC_${cleanTKey}`] || dict.modifiers[`KC_${cleanTKey}`];
                        if (displayMode === 'Fluent') {
                            if (FLUENT_MAP[cleanTKey] || (entry && (entry.fluent || entry.isFluent))) {
                                tapIsFluent = true;
                                if (FLUENT_MAP[cleanTKey]) tapLabel = FLUENT_MAP[cleanTKey];
                                else if (entry.fluent) tapLabel = entry.fluent;
                            } else if (tapLabel.length === 1 && tapLabel.charCodeAt(0) >= 0xE000) {
                                tapIsFluent = true;
                            }
                        }
                    }

                    let finalDisplayText = displayText;
                    let manualWrap = false;
                    if (displayText.includes('_') || displayText.includes('-')) {
                        const lastU = displayText.lastIndexOf('_');
                        const lastH = displayText.lastIndexOf('-');
                        const splitIdx = Math.max(lastU, lastH);
                        if (splitIdx > 0 && splitIdx < displayText.length - 1) {
                            finalDisplayText = displayText.substring(0, splitIdx) + '\n' + displayText.substring(splitIdx);
                            manualWrap = true;
                        }
                    }

                    const lines = finalDisplayText.split('\n');
                    const maxLineChars = Math.max(...lines.map(l => l.length));
                    const kWidth = (k.w - 6);
                    const baseCharWidth = 16.0;
                    const estimatedWidth = maxLineChars * baseCharWidth;
                    const availableWidth = kWidth - (isExportMode ? 4 : 6);
                    let targetScale = 1.0;
                    let canWrap = manualWrap;
                    if (estimatedWidth > availableWidth) {
                        targetScale = availableWidth / estimatedWidth;
                        if (!manualWrap && targetScale < 0.65) {
                            targetScale = isExportMode ? 0.62 : 0.7;
                            canWrap = true;
                        }
                    }
                    const minScale = isExportMode ? 0.52 : 0.6;
                    targetScale = Math.max(minScale, targetScale);
                    if (manualWrap) targetScale = Math.min(0.85, targetScale);
                    const wrapStyle = (canWrap || manualWrap) ? 'pre-wrap' : 'nowrap';
                    const lineH = (canWrap || manualWrap) ? '1.05' : '1';

                    const baseClass = isLayerKey ? 'p-0 flex flex-col' : 'flex flex-col items-center justify-center';
                    const keycapBaseClass = `key-cap absolute border-[3px] rounded-md transition-all duration-75 overflow-hidden ${
                            isLight 
                            ? `bg-white shadow-md hover:bg-slate-50 hover:border-blue-500 ${isAppDark ? 'border-slate-400' : 'border-slate-300'}` 
                            : `bg-slate-900/60 shadow-2xl hover:bg-slate-800 hover:border-blue-400 ${isAppDark ? 'border-slate-500' : 'border-slate-700'}`
                        }`;
                    
                    const paddingOffset = 20;

                    return html`
                        <div key=${i} className="${keycapBaseClass} ${baseClass}"
                            title=${fullRaw}
                            onClick=${(e) => {
                                const macroMatch = fullRaw.match(/MACRO\((\d+)\)/);
                                if (macroMatch && onMacroClick) {
                                    e.stopPropagation();
                                    onMacroClick(parseInt(macroMatch[1], 10));
                                }
                            }}
                            style=${{ 
                                left: `${k.x + paddingOffset}px`, 
                                top: `${k.y + paddingOffset}px`, 
                                width: `${k.w - 6}px`, 
                                height: `${k.h - 6}px`,
                                overflow: isExportMode ? 'visible' : 'hidden'
                            }}>
                            ${isLayerKey ? html`
                                <div className="key-layer-container" style=${{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                                    <div className="key-layer-main" style=${{ 
                                        flex: 1,
                                        color: isLight ? '#1e293b' : '#fff',
                                        fontFamily: (layerType === 'LT' && tapIsFluent) ? '"FluentSystemIcons-Regular", "Inter", sans-serif' : 'inherit',
                                        fontSize: (layerType === 'LT' && tapIsFluent) ? '1.4em' : '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        ${layerType === 'LT' ? tapLabel : `L${layerNum}`}
                                    </div>
                                    <div className="key-layer-footer" style=${{ 
                                        height: '15px',
                                        margin: '0 -3px -3px -3px',
                                        width: 'calc(100% + 6px)',
                                        paddingBottom: '3px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderTop: isLight 
                                            ? (isAppDark ? '2.5px solid #94a3b8' : '2.5px solid #cbd5e1') 
                                            : (isAppDark ? '2.5px solid #475569' : '2.5px solid #334155'),
                                        backgroundColor: (isLight ? [
                                            '#64748b', '#2563eb', '#4f46e5', '#0891b2', '#10b981',
                                            '#f59e0b', '#ea580c', '#e11d48', '#9333ea', '#0284c7'
                                        ] : [
                                            '#475569', '#1e40af', '#3730a3', '#155e75', '#065f46',
                                            '#92400e', '#9a3412', '#9f1239', '#6b21a8', '#075985'
                                        ])[layerNum % 10],
                                        color: (isLight && [5].includes(layerNum % 10)) ? '#020617' : '#f8fafc',
                                        zIndex: 10
                                    }}>
                                        <span style=${{ display: 'inline-flex', alignItems: 'center' }}>
                                            ${layerType}${layerType === 'LT' ? html`<b style=${{ color: '#facc15', marginLeft: '1px' }}>${layerNum}</b>` : ''}
                                        </span>
                                    </div>
                                </div>
                            ` : html`
                                <div style=${{ 
                                    transform: `scale(${targetScale})`, 
                                    transformOrigin: 'center', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    width: canWrap ? `${availableWidth / targetScale}px` : 'auto',
                                    height: '100%'
                                }}>
                                    <span className="legend-text uppercase tracking-tight font-bold" style=${{ 
                                        color: isLight ? '#1e293b' : '#fff',
                                        fontWeight: isFluentIcon ? '400' : '700',
                                        fontFamily: isFluentIcon ? '"FluentSystemIcons-Regular", "Inter", sans-serif' : 'inherit',
                                        fontSize: (isFluentIcon || (displayText.length === 1 && /[\u2100-\u23FF]/.test(displayText))) ? '1.4em' : 'inherit',
                                        position: 'relative',
                                        top: isExportMode ? '-10px' : '0',
                                        paddingTop: !isExportMode ? (isFluentIcon ? '0.08em' : '0.08em') : '0',
                                        whiteSpace: wrapStyle,
                                        lineHeight: lineH,
                                        maxHeight: isExportMode ? 'none' : '2.2em',
                                        overflow: isExportMode ? 'visible' : 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>${finalDisplayText}</span>
                                </div>
                            `}
                        </div>
                    `;
                })}
                `
            )
        )
    );
}
