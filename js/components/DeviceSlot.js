const { createElement, Fragment, useState } = React;
import { Keyboard } from './Keyboard.js';

export function DeviceSlot({ 
    dev, 
    idx, 
    isLightApp, 
    dragOverTarget, 
    editingDeviceId, 
    editingName,
    appTheme,
    onDragStart, 
    onDragEnd, 
    onDragOver, 
    onDragLeave, 
    onDrop,
    onUpdateDevice,
    onRemoveDevice,
    onStartEditing,
    onFinishEditing,
    onSetEditingName,
    onFileHandle,
    onSetMacroModal,
    onSetExportModal
}) {
    const [copied, setCopied] = useState(false);
    const hasData = !!dev.design;

    const handleShare = () => {
        if (!hasData) return;
        try {
            const shareData = {
                name: dev.name,
                design: dev.design,
                keymapJson: dev.keymapJson,
                keyStyle: dev.keyStyle,
                theme: dev.theme,
                displayMode: dev.displayMode
            };
            const compressed = window.LZString.compressToEncodedURIComponent(JSON.stringify(shareData));
            const shareUrl = window.location.origin + window.location.pathname + '?data=' + compressed;
            navigator.clipboard.writeText(shareUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(err => {
                console.error('Failed to copy share URL:', err);
                alert('URLのコピーに失敗しました。');
            });
        } catch (e) {
            console.error('Failed to generate share URL:', e);
            alert('共有URLの作成に失敗しました。');
        }
    };

    return createElement('div', { 
        key: dev.id,
        draggable: true,
        onDragStart: (e) => onDragStart(e, dev.id),
        onDragEnd: onDragEnd,
        onDragOver: (e) => onDragOver(e, dev.id),
        onDragLeave: onDragLeave,
        onDrop: (e) => onDrop(e, dev.id),
        className: (isLightApp ? 'bg-white/80 border-slate-200' : 'bg-slate-900/40 border-slate-800') + ' relative flex flex-col rounded-[2rem] border-2 transition-all p-6 ' + (dragOverTarget === dev.id ? 'border-blue-400 scale-[1.01]' : '')
    }, [
        createElement('div', { key: 'slot-header', className: 'flex justify-between items-start mb-4' }, [
            createElement('div', { key: 'title-grp', className: 'flex items-center gap-3' }, [
                createElement('span', { key: 'slot-idx', className: 'inline-flex items-center justify-center text-[10px] font-black px-2 h-5 rounded-md bg-blue-600 text-white uppercase tracking-wider pt-[1px]' }, 'Slot ' + (idx + 1)),
                editingDeviceId === dev.id ? 
                    createElement('input', { key: 'name-input', type: 'text', value: editingName, onInput: (e) => onSetEditingName(e.target.value), onBlur: () => onFinishEditing(dev.id), onKeyDown: (e) => e.key === 'Enter' && onFinishEditing(dev.id), className: 'bg-transparent border-b border-blue-500 text-lg font-black outline-none w-48 uppercase', ref: (el) => el && el.focus() }) :
                    createElement(Fragment, { key: 'name-static' }, [
                        createElement('h2', { 
                            key: 'h2', 
                            className: 'text-lg font-black tracking-tight uppercase ' + (isLightApp ? 'text-slate-900' : 'text-slate-100'),
                            style: { wordSpacing: '0.25em' } 
                        }, dev.name || 'No Device'),
                        createElement('button', { key: 'edit-btn', onClick: () => onStartEditing(dev), className: 'p-1 text-slate-400 hover:text-blue-400 transition-colors' }, 
                            createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, [
                                createElement('path', { d: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' }),
                                createElement('path', { d: 'm15 5 4 4' })
                            ])
                        )
                    ])
            ]),
            createElement('div', { key: 'header-controls', className: 'flex items-center gap-1' }, [
                createElement('button', { key: 'del-btn', onClick: () => onRemoveDevice(dev.id), className: 'p-2 text-slate-400 hover:text-red-400 transition-colors', title: 'Remove Slot' }, 
                    createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, [
                        createElement('path', { d: 'M3 6h18' }),
                        createElement('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
                        createElement('path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' })
                    ])
                ),
                createElement('button', { key: 'settings-btn', onClick: () => onUpdateDevice(dev.id, { showSettings: !dev.showSettings }), className: 'p-2 ' + (dev.showSettings ? 'text-blue-400 bg-blue-500/10 rounded-lg' : 'text-slate-400 hover:text-blue-400') + ' transition-all', title: 'Display Settings' }, 
                    createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, [
                        createElement('line', { x1: 3, y1: 12, x2: 21, y2: 12 }),
                        createElement('line', { x1: 3, y1: 6, x2: 21, y2: 6 }),
                        createElement('line', { x1: 3, y1: 18, x2: 21, y2: 18 })
                    ])
                )
            ])
        ]),

        dev.showSettings ? createElement('div', { key: 'settings-panel', className: 'flex flex-wrap items-center gap-4 mb-6 ' + (isLightApp ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-700') + ' p-4 rounded-xl border w-full animate-in fade-in slide-in-from-top-2' }, [
            createElement('div', { key: 'mode-sect', className: 'flex items-center gap-4 ' + (isLightApp ? 'bg-white' : 'bg-slate-950/30') + ' p-2 px-4 rounded-xl border ' + (isLightApp ? 'border-slate-200' : 'border-slate-800/50') }, [
                createElement('span', { key: 't', className: 'text-[9px] font-black ' + (isLightApp ? 'text-slate-400' : 'text-slate-600') + ' uppercase tracking-widest' }, 'DISPLAY MODE:'),
                createElement('div', { key: 'btns', className: 'flex gap-4' }, ['Fluent', 'Text'].map(opt => createElement('label', { key: opt, className: 'flex items-center gap-1.5 cursor-pointer group' }, [
                    createElement('input', { key: 'i', type: 'radio', name: 'displayMode-' + dev.id, checked: dev.displayMode === opt, onChange: () => onUpdateDevice(dev.id, { displayMode: opt }), className: 'hidden' }),
                    createElement('div', { key: 'v', className: 'w-3 h-3 rounded-full border ' + (isLightApp ? 'border-slate-300' : 'border-slate-600') + ' flex items-center justify-center ' + (dev.displayMode === opt ? 'border-blue-500' : '') }, 
                        dev.displayMode === opt ? createElement('div', { className: 'w-1.5 h-1.5 rounded-full bg-blue-500' }) : null
                    ),
                    createElement('span', { key: 's', className: 'text-[9px] font-bold ' + (dev.displayMode === opt ? (isLightApp ? 'text-slate-900' : 'text-white') : 'text-slate-500') + ' uppercase' }, opt)
                ])))
            ]),
            createElement('div', { key: 'theme-sect', className: 'flex items-center gap-4 ' + (isLightApp ? 'bg-white' : 'bg-slate-950/30') + ' p-2 px-4 rounded-xl border ' + (isLightApp ? 'border-slate-200' : 'border-slate-800/50') }, [
                createElement('span', { key: 't', className: 'text-[9px] font-black ' + (isLightApp ? 'text-slate-400' : 'text-slate-600') + ' uppercase tracking-widest' }, 'THEME:'),
                createElement('div', { key: 'btns', className: 'flex gap-4' }, ['Dark', 'Light', 'System'].map(opt => createElement('label', { key: opt, className: 'flex items-center gap-1.5 cursor-pointer group' }, [
                    createElement('input', { key: 'i', type: 'radio', name: 'theme-' + dev.id, checked: (dev.theme || 'System') === opt, onChange: () => onUpdateDevice(dev.id, { theme: opt }), className: 'hidden' }),
                    createElement('div', { key: 'v', className: 'w-3 h-3 rounded-full border ' + (isLightApp ? 'border-slate-300' : 'border-slate-600') + ' flex items-center justify-center ' + ((dev.theme || 'System') === opt ? 'border-blue-500' : '') }, 
                        (dev.theme || 'System') === opt ? createElement('div', { className: 'w-1.5 h-1.5 rounded-full bg-blue-500' }) : null
                    ),
                    createElement('span', { key: 's', className: 'text-[9px] font-bold ' + ((dev.theme || 'System') === opt ? (isLightApp ? 'text-slate-900' : 'text-white') : 'text-slate-500') + ' uppercase' }, opt)
                ])))
            ]),
            createElement('div', { key: 'style-sect', className: 'flex items-center gap-4 ' + (isLightApp ? 'bg-white' : 'bg-slate-950/30') + ' p-2 px-4 rounded-xl border ' + (isLightApp ? 'border-slate-200' : 'border-slate-800/50') }, [
                createElement('span', { key: 't', className: 'text-[9px] font-black ' + (isLightApp ? 'text-slate-400' : 'text-slate-600') + ' uppercase tracking-widest' }, 'STYLE:'),
                createElement('div', { key: 'btns', className: 'flex gap-4' }, ['Windows', 'Mac'].map(opt => createElement('label', { key: opt, className: 'flex items-center gap-1.5 cursor-pointer group' }, [
                    createElement('input', { key: 'i', type: 'radio', name: 'keyStyle-' + dev.id, checked: (dev.keyStyle || 'Windows') === opt, onChange: () => onUpdateDevice(dev.id, { keyStyle: opt }), className: 'hidden' }),
                    createElement('div', { key: 'v', className: 'w-3 h-3 rounded-full border ' + (isLightApp ? 'border-slate-300' : 'border-slate-600') + ' flex items-center justify-center ' + ((dev.keyStyle || 'Windows') === opt ? 'border-blue-500' : '') }, 
                        (dev.keyStyle || 'Windows') === opt ? createElement('div', { className: 'w-1.5 h-1.5 rounded-full bg-blue-500' }) : null
                    ),
                    createElement('span', { key: 's', className: 'text-[9px] font-bold ' + ((dev.keyStyle || 'Windows') === opt ? (isLightApp ? 'text-slate-900' : 'text-white') : 'text-slate-500') + ' uppercase' }, opt)
                ])))
            ])
        ]) : null,

        createElement('div', { key: 'slot-actions', className: 'flex flex-wrap items-center gap-2 mb-6 p-2 ' + (isLightApp ? 'bg-slate-100/50' : 'bg-slate-950/30') + ' rounded-xl border ' + (isLightApp ? 'border-slate-200' : 'border-slate-800/50') }, [
            createElement('label', { key: 'layout-lbl', className: 'flex-1 min-w-[100px] ' + (isLightApp ? 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm' : 'bg-slate-800/40 hover:bg-slate-700/60 text-slate-200') + ' px-3 py-2 rounded-lg text-[10px] font-black cursor-pointer transition-all uppercase tracking-widest border ' + (isLightApp ? 'border-slate-200' : 'border-slate-700/50') + ' flex items-center justify-center' }, [
                'LAYOUT ',
                createElement('input', { key: 'layout-file', type: 'file', className: 'hidden', onChange: (e) => onFileHandle(e, dev.id, 'layout') })
            ]),
            createElement('label', { key: 'map-lbl', className: 'flex-1 min-w-[100px] ' + (isLightApp ? 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm' : 'bg-slate-800/40 hover:bg-slate-700/60 text-slate-200') + ' px-3 py-2 rounded-lg text-[10px] font-black cursor-pointer transition-all uppercase tracking-widest border ' + (isLightApp ? 'border-slate-200' : 'border-slate-700/50') + ' flex items-center justify-center' }, [
                'MAPPING ',
                createElement('input', { key: 'map-file', type: 'file', className: 'hidden', onChange: (e) => onFileHandle(e, dev.id, 'mapping') })
            ]),
            createElement('button', { key: 'macro-btn', onClick: () => onSetMacroModal({ deviceId: dev.id, macroId: null }), className: 'flex-1 min-w-[80px] ' + (isLightApp ? 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm' : 'bg-slate-800/40 hover:bg-slate-700/60 text-slate-200') + ' px-3 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest border ' + (isLightApp ? 'border-slate-200' : 'border-slate-700/50') }, 'MACROS'),
            createElement('button', { 
                key: 'share-btn', 
                onClick: handleShare, 
                disabled: !hasData,
                className: 'flex-1 min-w-[80px] ' + 
                    (!hasData ? 'opacity-40 cursor-not-allowed border-dashed ' : 'hover:scale-[1.02] ') +
                    (copied 
                        ? (isLightApp ? 'bg-green-50 text-green-600 border-green-200 shadow-inner' : 'bg-green-600/20 text-green-400 border-green-500/30 shadow-inner') 
                        : (isLightApp ? 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm' : 'bg-slate-800/40 hover:bg-slate-700/60 text-slate-200')) + 
                    ' px-3 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest border ' + 
                    (copied ? '' : (isLightApp ? 'border-slate-200' : 'border-slate-700/50')) 
            }, copied ? 'COPIED!' : 'SHARE'),
            createElement('button', { key: 'export-btn', onClick: () => onSetExportModal(dev), className: 'flex-1 min-w-[80px] ' + (isLightApp ? 'bg-blue-50 hover:bg-blue-100 text-blue-600' : 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-400') + ' px-3 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest border ' + (isLightApp ? 'border-blue-200' : 'border-blue-500/30') }, 'EXPORT')
        ]),

        dev.design ? createElement('div', { key: 'kbd-area', className: 'flex flex-col gap-6' }, [
            createElement('div', { key: 'layer-bar', className: 'flex items-center gap-4 ' + (isLightApp ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/40 backdrop-blur-sm border-slate-700/50') + ' p-1.5 rounded-xl border self-start ml-2' }, [
                createElement('span', { key: 'lbl', className: 'text-[9px] font-black text-slate-400 uppercase tracking-widest px-2' }, 'Layer'),
                createElement('div', { key: 'btns', className: 'flex gap-2' }, 
                    ((dev.keymapJson && dev.keymapJson.layers) || (dev.design && dev.design.layers) || [0,1,2,3]).map((_, l) => createElement('button', { key: l, onClick: () => onUpdateDevice(dev.id, { layer: l }), className: (dev.layer === l ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300') + ' w-8 h-8 rounded-lg text-[10px] font-black transition-all' }, l))
                )
            ]),
            createElement('div', { key: 'kbd-wrap', className: 'w-full flex justify-center overflow-hidden' }, 
                createElement(Keyboard, { 
                    design: dev.design, 
                    layer: dev.layer, 
                    externalMap: dev.keymapJson, 
                    displayMode: dev.displayMode,
                    theme: dev.theme || 'System',
                    appTheme: appTheme,
                    macroAliases: dev.macroAliases || {},
                    onMacroClick: (macroId) => onSetMacroModal({ deviceId: dev.id, macroId }),
                    keyStyle: dev.keyStyle || 'Windows'
                })
            )
        ]) : createElement('div', { key: 'empty-area', className: 'py-20 text-center opacity-20' }, [
            createElement('div', { key: 'icon', className: 'text-6xl mb-4' }, '⌨️'),
            createElement('p', { key: 'text', className: 'text-[10px] font-black uppercase tracking-widest' }, 'Waiting for Data')
        ])
    ]);
}
