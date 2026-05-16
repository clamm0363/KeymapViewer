const { useState, useEffect, useMemo, useRef, createElement, Fragment } = React;
const html = htm.bind(createElement);

import { SAMPLE_100, SAMPLE_HHKB, SAMPLE_NUMPAD, STORAGE_KEY } from './constants.js';
import { loadSavedState } from './utils/helpers.js';
import { Keyboard } from './components/Keyboard.js';

export function App() {
    const saved = useMemo(() => loadSavedState(), []);
    const [devices, setDevices] = useState(() => {
        if (saved && saved.devices && saved.devices.length > 0) return saved.devices;
        return [{ id: Date.now(), name: null, design: null, keymapJson: null, layer: 0, displayMode: 'Fluent', theme: 'System', keyStyle: 'Windows', showSettings: false }];
    });
    const [layoutMode, setLayoutMode] = useState(() => (saved && saved.layoutMode) || 'stack');
    const [appTheme, setAppTheme] = useState(() => (saved && saved.appTheme) || 'dark');
    const [editingDeviceId, setEditingDeviceId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [draggedSlotId, setDraggedSlotId] = useState(null);
    const [dragOverTarget, setDragOverTarget] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [macroModalState, setMacroModalState] = useState(null);
    const [exportModalDevId, setExportModalDevId] = useState(null);
    const [exportSettings, setExportSettings] = useState({ layers: [], includeMacros: true, background: 'Dark' });
    const [isExporting, setIsExporting] = useState(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (saved) return; 
        const devs = [
            { id: Date.now(), name: SAMPLE_100.name, design: SAMPLE_100, keymapJson: SAMPLE_100, layer: 0, displayMode: 'Fluent', theme: 'System', keyStyle: 'Windows', macroAliases: {}, showSettings: false },
            { id: Date.now() + 1, name: SAMPLE_HHKB.name, design: SAMPLE_HHKB, keymapJson: SAMPLE_HHKB, layer: 0, displayMode: 'Fluent', theme: 'System', keyStyle: 'Mac', macroAliases: SAMPLE_HHKB.macroAliases || {}, showSettings: false },
            { id: Date.now() + 2, name: SAMPLE_NUMPAD.name, design: SAMPLE_NUMPAD, keymapJson: SAMPLE_NUMPAD, layer: 0, displayMode: 'Fluent', theme: 'System', keyStyle: 'Windows', macroAliases: SAMPLE_NUMPAD.macroAliases || {}, showSettings: false }
        ];
        setDevices(devs);
    }, []);

    useEffect(() => {
        if (isInitialMount.current) { isInitialMount.current = false; return; }
        try {
            const state = { devices, layoutMode, appTheme };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) { console.warn('Failed to save state:', e); }
    }, [devices, layoutMode, appTheme]);

    const handleExportClick = async (dev) => {
        setIsExporting(true);
        if (document.fonts) await document.fonts.ready;
        setTimeout(async () => {
            const el = document.getElementById('export-container');
            if (el) {
                try {
                    const canvas = await html2canvas(el, { 
                        backgroundColor: exportSettings.background === 'Transparent' ? null : (exportSettings.background === 'Light' ? '#f1f5f9' : '#020617'),
                        scale: 2
                    });
                    const link = document.createElement('a');
                    link.download = `${dev.name || 'Keymap'}_export.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                } catch(e) { 
                    console.error('Export failed:', e); 
                    alert('画像の書き出しに失敗しました。');
                }
            }
            setIsExporting(false);
            setExportModalDevId(null);
        }, 500);
    };

    const addSlot = () => {
        if (devices.length >= 4) return;
        setDevices(prev => [...prev, {
            id: Date.now(), name: null, design: null, keymapJson: null, layer: 0, displayMode: 'Fluent', theme: 'System', keyStyle: 'Windows', showSettings: false
        }]);
    };

    const updateDevice = (id, data) => {
        setDevices(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    };

    const handleFile = (e, id, type) => {
        const f = e.target.files[0];
        if (f) {
            const r = new FileReader();
            r.onload = (ev) => {
                try {
                    const j = JSON.parse(ev.target.result);
                    if (type === 'layout') {
                        if (j.layouts) updateDevice(id, { design: j, name: j.name || 'Device' });
                        else alert('レイアウト情報が見つかりません');
                    } else {
                        if (j.layers) updateDevice(id, { keymapJson: j });
                        else alert('マッピング情報が見つかりません');
                    }
                } catch (err) { alert('JSONファイルの解析に失敗しました'); }
            };
            r.readAsText(f);
        }
        e.target.value = '';
    };

    const removeDevice = (id) => {
        if (devices.length === 1) {
            updateDevice(id, { name: null, design: null, keymapJson: null, layer: 0, displayMode: 'Fluent', keyStyle: 'Windows', showSettings: false });
        } else {
            setDevices(prev => prev.filter(d => d.id !== id));
        }
    };

    const startEditing = (dev) => {
        setEditingDeviceId(dev.id);
        setEditingName(dev.name || '');
    };

    const finishEditing = (id) => {
        if (editingName.trim()) updateDevice(id, { name: editingName.trim() });
        setEditingDeviceId(null);
    };

    const handleSlotDragStart = (e, devId) => {
        setDraggedSlotId(devId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/slot-id', devId.toString());
        requestAnimationFrame(() => { e.target.style.opacity = '0.4'; });
    };

    const handleSlotDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedSlotId(null);
        setDragOverTarget(null);
    };

    const handleDragOver = (e, targetId) => {
        e.preventDefault();
        const isFile = e.dataTransfer.types.includes('Files');
        const isSlot = e.dataTransfer.types.includes('application/slot-id');
        if (isFile || isSlot) {
            e.dataTransfer.dropEffect = isFile ? 'copy' : 'move';
            setDragOverTarget(targetId);
        }
    };

    const handleDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setDragOverTarget(null);
    };

    const processDroppedFile = (file, targetDevId) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const j = JSON.parse(ev.target.result);
                if (targetDevId) {
                    if (j.layouts) updateDevice(targetDevId, { design: j, name: j.name || 'Device' });
                    else if (j.layers) updateDevice(targetDevId, { keymapJson: j });
                } else {
                    if (devices.length >= 4) return;
                    const nd = { id: Date.now(), name: null, design: null, keymapJson: null, layer: 0, displayMode: 'Fluent', theme: 'System', keyStyle: 'Windows', showSettings: false };
                    if (j.layouts) { nd.design = j; nd.name = j.name || 'Device'; }
                    else if (j.layers) { nd.keymapJson = j; nd.name = j.name || 'Mapping'; }
                    setDevices(prev => [...prev, nd]);
                }
            } catch (err) { alert('JSONファイルの解析に失敗しました'); }
        };
        reader.readAsText(file);
    };

    const handleDrop = (e, targetDevId) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverTarget(null);
        if (e.dataTransfer.files.length > 0) {
            const file = Array.from(e.dataTransfer.files).find(f => f.name.endsWith('.json'));
            if (file) processDroppedFile(file, targetDevId);
            return;
        }
        if (draggedSlotId && draggedSlotId !== targetDevId) {
            setDevices(prev => {
                const next = [...prev];
                const fromIdx = next.findIndex(d => d.id === draggedSlotId);
                const toIdx = next.findIndex(d => d.id === targetDevId);
                if (fromIdx === -1 || toIdx === -1) return prev;
                const [moved] = next.splice(fromIdx, 1);
                next.splice(toIdx, 0, moved);
                return next;
            });
        }
        setDraggedSlotId(null);
    };

    const isLightApp = appTheme === 'light';

    return createElement('div', {
        className: (isLightApp ? 'app-light' : 'app-dark') + ' min-h-screen p-6 md:p-8 flex flex-col transition-colors duration-300'
    }, [
        createElement('header', { key: 'header', className: 'flex flex-col md:flex-row justify-between items-center mb-12 gap-6 w-full' }, [
            createElement('div', { key: 'logo', className: 'flex items-center gap-6', onClick: () => window.location.reload(), style: { cursor: 'pointer' } }, [
                createElement('div', { key: 'km-box', className: 'bg-blue-600 w-14 h-14 rounded-3xl flex items-center justify-center shadow-2xl font-black text-white text-2xl tracking-tighter' }, 'KM'),
                createElement('div', { key: 'title-box' }, [
                    createElement('h1', { key: 'title', className: 'text-3xl font-black tracking-tighter ' + (isLightApp ? 'text-slate-900' : 'text-white') + ' uppercase italic leading-none' }, [
                        'Keymap ',
                        createElement('span', { key: 'viewer-span', className: 'text-blue-500 not-italic' }, 'Viewer')
                    ]),
                    createElement('p', { key: 'meta', className: 'text-[10px] ' + (isLightApp ? 'text-slate-400' : 'text-slate-500') + ' font-bold uppercase tracking-[0.3em] mt-2' }, [
                        'Mode: ',
                        createElement('span', { key: 'mode', className: 'text-blue-400' }, layoutMode.toUpperCase()),
                        ' | ',
                        createElement('span', { key: 'slots', className: isLightApp ? 'text-slate-900' : 'text-white' }, devices.length),
                        ' Slot' + (devices.length !== 1 ? 's' : '')
                    ])
                ])
            ]),
            createElement('div', { key: 'actions', className: 'flex items-center gap-4 ' + (isLightApp ? 'bg-white/80 border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-800') + ' p-2 rounded-2xl border backdrop-blur-sm transition-all' }, [
                createElement('button', { key: 'help-btn', onClick: () => setShowHelp(true), className: (isLightApp ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-700 hover:bg-slate-600 text-white') + ' px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest mr-1' }, 'HOW TO USE'),
                devices.length < 4 ? createElement('button', { key: 'add-btn', onClick: addSlot, className: 'bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest text-white mr-2' }, 'ADD SLOT') : null,
                createElement('div', { key: 'layout-toggle', className: 'flex gap-1 border-r ' + (isLightApp ? 'border-slate-200' : 'border-slate-800') + ' pr-4 mr-2' }, [
                    createElement('button', { key: 'grid-btn', onClick: () => setLayoutMode('grid'), className: (layoutMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : (isLightApp ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300')) + ' px-4 py-2 rounded-xl text-xs font-bold transition-all' }, 'GRID'),
                    createElement('button', { key: 'stack-btn', onClick: () => setLayoutMode('stack'), className: (layoutMode === 'stack' ? 'bg-blue-600 text-white shadow-lg' : (isLightApp ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300')) + ' px-4 py-2 rounded-xl text-xs font-bold transition-all' }, 'STACK')
                ]),
                createElement('div', { key: 'theme-toggle', className: 'flex p-1 rounded-xl gap-1 ' + (isLightApp ? 'bg-slate-100' : 'bg-slate-800/50') }, [
                    createElement('button', { key: 'light-btn', onClick: () => setAppTheme('light'), className: (isLightApp ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-400') + ' w-9 h-9 rounded-lg flex items-center justify-center transition-all', title: 'Light Mode', style: { fontFamily: 'Segoe Fluent Icons' } }, String.fromCharCode(0xE706)),
                    createElement('button', { key: 'dark-btn', onClick: () => setAppTheme('dark'), className: (appTheme === 'dark' ? 'bg-slate-700 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-400') + ' w-9 h-9 rounded-lg flex items-center justify-center transition-all', title: 'Dark Mode', style: { fontFamily: 'Segoe Fluent Icons' } }, String.fromCharCode(0xE708))
                ])
            ])
        ]),

        showHelp ? createElement('div', { key: 'help-modal', className: 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm', onClick: () => setShowHelp(false) }, [
            createElement('div', { key: 'help-content', className: (isLightApp ? 'bg-white' : 'bg-slate-900') + ' border ' + (isLightApp ? 'border-slate-200' : 'border-slate-700') + ' rounded-2xl shadow-2xl max-w-xl w-full mx-4 max-h-[80vh] overflow-y-auto', onClick: (e) => e.stopPropagation() }, [
                createElement('div', { key: 'help-header', className: (isLightApp ? 'bg-slate-50' : 'bg-slate-900') + ' sticky top-0 border-b ' + (isLightApp ? 'border-slate-200' : 'border-slate-800') + ' px-6 py-4 flex justify-between items-center rounded-t-2xl' }, [
                    createElement('h3', { key: 'h3', className: (isLightApp ? 'text-slate-900' : 'text-white') + ' text-lg font-black uppercase tracking-wide' }, '使い方ガイド'),
                    createElement('button', { key: 'close', onClick: () => setShowHelp(false), className: 'text-slate-500 hover:text-blue-500 transition-colors text-xl font-bold' }, '✕')
                ]),
                createElement('div', { key: 'help-body', className: 'px-6 py-5 space-y-5 text-sm ' + (isLightApp ? 'text-slate-600' : 'text-slate-300') + ' leading-relaxed' }, [
                    createElement('div', { key: 'h-file' }, [
                        createElement('h4', { key: 'h4', className: 'text-blue-400 font-black text-xs uppercase tracking-widest mb-2' }, '📂 キーマップの読み込み'),
                        createElement('ul', { key: 'ul', className: 'space-y-1 list-disc list-inside text-slate-400' }, [
                            createElement('li', { key: 'li1' }, [createElement('strong', { className: 'text-slate-200' }, 'LAYOUT'), ' — キーボードの物理配列を読み込みます']),
                            createElement('li', { key: 'li2' }, [createElement('strong', { className: 'text-slate-200' }, 'MAPPING'), ' — キーアサイン（マッピング）を読み込みます']),
                            createElement('li', { key: 'li3' }, [createElement('strong', { className: 'text-slate-200' }, 'ドラッグ＆ドロップ'), ' — スロット上に直接ドロップ可能です'])
                        ])
                    ]),
                    createElement('div', { key: 'h-settings' }, [
                        createElement('h4', { key: 'h4', className: 'text-blue-400 font-black text-xs uppercase tracking-widest mb-2' }, '⚙️ 個別設定'),
                        createElement('p', { key: 'p' }, '各スロットの右上にある三本線アイコンから、表示モードやテーマを個別に変更できます。')
                    ])
                ])
            ])
        ]) : null,

        macroModalState ? (() => {
            const dev = devices.find(d => d.id === macroModalState.deviceId);
            if (!dev) return null;
            const allMacros = (dev.keymapJson && dev.keymapJson.macros) || [];
            const specificMacroId = macroModalState.macroId;
            const macrosToShow = specificMacroId !== null && specificMacroId !== undefined
                ? [{ id: specificMacroId, content: allMacros[specificMacroId] }]
                : allMacros.map((content, id) => ({ id, content }));

            return createElement('div', { key: 'macro-modal', className: 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm', onClick: () => setMacroModalState(null) }, [
                createElement('div', { key: 'macro-content', className: (isLightApp ? 'bg-white' : 'bg-slate-900') + ' border ' + (isLightApp ? 'border-slate-200' : 'border-slate-700') + ' rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col', onClick: (e) => e.stopPropagation() }, [
                    createElement('div', { key: 'macro-header', className: (isLightApp ? 'bg-slate-50' : 'bg-slate-900') + ' sticky top-0 border-b ' + (isLightApp ? 'border-slate-200' : 'border-slate-800') + ' px-6 py-4 flex justify-between items-center rounded-t-2xl z-10' }, [
                        createElement('h3', { key: 'h3', className: (isLightApp ? 'text-slate-900' : 'text-white') + ' text-lg font-black uppercase tracking-wide' }, 'Macro Aliases'),
                        createElement('button', { key: 'close', onClick: () => setMacroModalState(null), className: 'text-slate-500 hover:text-blue-500 transition-colors text-xl font-bold' }, '✕')
                    ]),
                    createElement('div', { key: 'macro-body', className: 'px-6 py-5 overflow-y-auto' }, [
                        createElement('div', { key: 'macro-list', className: 'space-y-3' }, 
                            macrosToShow.map(m => createElement('div', { key: m.id, className: (isLightApp ? 'bg-slate-50' : 'bg-slate-950/50') + ' grid grid-cols-[80px_1fr_2fr] gap-4 items-center p-3 rounded-xl border ' + (isLightApp ? 'border-slate-200' : 'border-slate-800/50') }, [
                                createElement('div', { key: 'id', className: 'text-xs font-black text-blue-500' }, 'M(' + m.id + ')'),
                                createElement('input', { key: 'input', type: 'text', value: (dev.macroAliases && dev.macroAliases[m.id]) || '', onInput: (e) => updateDevice(dev.id, { macroAliases: { ...(dev.macroAliases || {}), [m.id]: e.target.value } }), className: 'bg-transparent border-b border-slate-700 outline-none text-sm font-bold w-full', placeholder: 'Alias...' }),
                                createElement('div', { key: 'content', className: 'text-[10px] text-slate-500 font-mono truncate', title: m.content }, m.content || 'Empty')
                            ]))
                        )
                    ])
                ])
            ]);
        })() : null,

        exportModalDevId ? createElement('div', { key: 'export-modal', className: 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm', onClick: () => !isExporting && setExportModalDevId(null) }, [
            createElement('div', { key: 'export-content', className: (isLightApp ? 'bg-white' : 'bg-slate-900') + ' border rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6', onClick: (e) => e.stopPropagation() }, [
                createElement('h3', { key: 'h3', className: 'text-lg font-black uppercase tracking-wide mb-6' }, 'Export Image'),
                createElement('div', { key: 'export-body', className: 'space-y-6' }, [
                    createElement('button', { key: 'dl-btn', onClick: () => handleExportClick(devices.find(d => d.id === exportModalDevId)), disabled: isExporting, className: 'w-full py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all' }, isExporting ? 'Generating...' : 'Download PNG')
                ])
            ])
        ]) : null,

        createElement('main', { key: 'main', className: 'flex-1 flex flex-col gap-8' }, [
            createElement('div', { key: 'main-layout', className: (layoutMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : 'flex flex-col gap-8') }, [
                devices.map((dev, idx) => createElement('div', { 
                    key: dev.id,
                    draggable: true,
                    onDragStart: (e) => handleSlotDragStart(e, dev.id),
                    onDragEnd: handleSlotDragEnd,
                    onDragOver: (e) => handleDragOver(e, dev.id),
                    onDragLeave: handleDragLeave,
                    onDrop: (e) => handleDrop(e, dev.id),
                    className: (isLightApp ? 'bg-white/80 border-slate-200' : 'bg-slate-900/40 border-slate-800') + ' relative flex flex-col rounded-[2rem] border-2 transition-all p-6 ' + (dragOverTarget === dev.id ? 'border-blue-400 scale-[1.01]' : '')
                }, [
                    createElement('div', { key: 'slot-header', className: 'flex justify-between items-start mb-4' }, [
                        createElement('div', { key: 'title-grp', className: 'flex items-center gap-3' }, [
                            createElement('span', { key: 'slot-idx', className: 'text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-600 text-white uppercase' }, 'Slot ' + (idx + 1)),
                            editingDeviceId === dev.id ? 
                                createElement('input', { key: 'name-input', type: 'text', value: editingName, onInput: (e) => setEditingName(e.target.value), onBlur: () => finishEditing(dev.id), onKeyDown: (e) => e.key === 'Enter' && finishEditing(dev.id), className: 'bg-transparent border-b border-blue-500 text-lg font-black outline-none w-48 uppercase', ref: (el) => el && el.focus() }) :
                                createElement(Fragment, { key: 'name-static' }, [
                                    createElement('h2', { key: 'h2', className: 'text-lg font-black tracking-tight uppercase ' + (isLightApp ? 'text-slate-900' : 'text-slate-100') }, dev.name || 'No Device'),
                                    createElement('button', { key: 'edit-btn', onClick: () => startEditing(dev), className: 'p-1 text-slate-400 hover:text-blue-400 transition-colors' }, 
                                        createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, [
                                            createElement('path', { d: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' }),
                                            createElement('path', { d: 'm15 5 4 4' })
                                        ])
                                    )
                                ])
                        ]),
                        createElement('div', { key: 'header-controls', className: 'flex items-center gap-1' }, [
                            createElement('button', { key: 'del-btn', onClick: () => removeDevice(dev.id), className: 'p-2 text-slate-400 hover:text-red-400 transition-colors', title: 'Remove Slot' }, 
                                createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, [
                                    createElement('path', { d: 'M3 6h18' }),
                                    createElement('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
                                    createElement('path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' })
                                ])
                            ),
                            createElement('button', { key: 'settings-btn', onClick: () => updateDevice(dev.id, { showSettings: !dev.showSettings }), className: 'p-2 ' + (dev.showSettings ? 'text-blue-400 bg-blue-500/10 rounded-lg' : 'text-slate-400 hover:text-blue-400') + ' transition-all', title: 'Display Settings' }, 
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
                                createElement('input', { key: 'i', type: 'radio', name: 'displayMode-' + dev.id, checked: dev.displayMode === opt, onChange: () => updateDevice(dev.id, { displayMode: opt }), className: 'hidden' }),
                                createElement('div', { key: 'v', className: 'w-3 h-3 rounded-full border ' + (isLightApp ? 'border-slate-300' : 'border-slate-600') + ' flex items-center justify-center ' + (dev.displayMode === opt ? 'border-blue-500' : '') }, 
                                    dev.displayMode === opt ? createElement('div', { className: 'w-1.5 h-1.5 rounded-full bg-blue-500' }) : null
                                ),
                                createElement('span', { key: 's', className: 'text-[9px] font-bold ' + (dev.displayMode === opt ? (isLightApp ? 'text-slate-900' : 'text-white') : 'text-slate-500') + ' uppercase' }, opt)
                            ])))
                        ]),
                        createElement('div', { key: 'theme-sect', className: 'flex items-center gap-4 ' + (isLightApp ? 'bg-white' : 'bg-slate-950/30') + ' p-2 px-4 rounded-xl border ' + (isLightApp ? 'border-slate-200' : 'border-slate-800/50') }, [
                            createElement('span', { key: 't', className: 'text-[9px] font-black ' + (isLightApp ? 'text-slate-400' : 'text-slate-600') + ' uppercase tracking-widest' }, 'THEME:'),
                            createElement('div', { key: 'btns', className: 'flex gap-4' }, ['Dark', 'Light', 'System'].map(opt => createElement('label', { key: opt, className: 'flex items-center gap-1.5 cursor-pointer group' }, [
                                createElement('input', { key: 'i', type: 'radio', name: 'theme-' + dev.id, checked: (dev.theme || 'System') === opt, onChange: () => updateDevice(dev.id, { theme: opt }), className: 'hidden' }),
                                createElement('div', { key: 'v', className: 'w-3 h-3 rounded-full border ' + (isLightApp ? 'border-slate-300' : 'border-slate-600') + ' flex items-center justify-center ' + ((dev.theme || 'System') === opt ? 'border-blue-500' : '') }, 
                                    (dev.theme || 'System') === opt ? createElement('div', { className: 'w-1.5 h-1.5 rounded-full bg-blue-500' }) : null
                                ),
                                createElement('span', { key: 's', className: 'text-[9px] font-bold ' + ((dev.theme || 'System') === opt ? (isLightApp ? 'text-slate-900' : 'text-white') : 'text-slate-500') + ' uppercase' }, opt)
                            ])))
                        ]),
                        createElement('div', { key: 'style-sect', className: 'flex items-center gap-4 ' + (isLightApp ? 'bg-white' : 'bg-slate-950/30') + ' p-2 px-4 rounded-xl border ' + (isLightApp ? 'border-slate-200' : 'border-slate-800/50') }, [
                            createElement('span', { key: 't', className: 'text-[9px] font-black ' + (isLightApp ? 'text-slate-400' : 'text-slate-600') + ' uppercase tracking-widest' }, 'STYLE:'),
                            createElement('div', { key: 'btns', className: 'flex gap-4' }, ['Windows', 'Mac'].map(opt => createElement('label', { key: opt, className: 'flex items-center gap-1.5 cursor-pointer group' }, [
                                createElement('input', { key: 'i', type: 'radio', name: 'keyStyle-' + dev.id, checked: (dev.keyStyle || 'Windows') === opt, onChange: () => updateDevice(dev.id, { keyStyle: opt }), className: 'hidden' }),
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
                            createElement('input', { key: 'layout-file', type: 'file', className: 'hidden', onChange: (e) => handleFile(e, dev.id, 'layout') })
                        ]),
                        createElement('label', { key: 'map-lbl', className: 'flex-1 min-w-[100px] ' + (isLightApp ? 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm' : 'bg-slate-800/40 hover:bg-slate-700/60 text-slate-200') + ' px-3 py-2 rounded-lg text-[10px] font-black cursor-pointer transition-all uppercase tracking-widest border ' + (isLightApp ? 'border-slate-200' : 'border-slate-700/50') + ' flex items-center justify-center' }, [
                            'MAPPING ',
                            createElement('input', { key: 'map-file', type: 'file', className: 'hidden', onChange: (e) => handleFile(e, dev.id, 'mapping') })
                        ]),
                        createElement('button', { key: 'macro-btn', onClick: () => setMacroModalState({ deviceId: dev.id, macroId: null }), className: 'flex-1 min-w-[80px] ' + (isLightApp ? 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm' : 'bg-slate-800/40 hover:bg-slate-700/60 text-slate-200') + ' px-3 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest border ' + (isLightApp ? 'border-slate-200' : 'border-slate-700/50') }, 'MACROS'),
                        createElement('button', { key: 'export-btn', onClick: () => { setExportModalDevId(dev.id); setExportSettings({ layers: [dev.layer], includeMacros: true, background: isLightApp ? 'Light' : 'Dark' }); }, className: 'flex-1 min-w-[80px] ' + (isLightApp ? 'bg-blue-50 hover:bg-blue-100 text-blue-600' : 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-400') + ' px-3 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest border ' + (isLightApp ? 'border-blue-200' : 'border-blue-500/30') }, 'EXPORT')
                    ]),

                    dev.design ? createElement('div', { key: 'kbd-area', className: 'flex flex-col gap-6' }, [
                        createElement('div', { key: 'layer-bar', className: 'flex items-center gap-4 ' + (isLightApp ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/40 backdrop-blur-sm border-slate-700/50') + ' p-1.5 rounded-xl border self-start ml-2' }, [
                            createElement('span', { key: 'lbl', className: 'text-[9px] font-black text-slate-400 uppercase tracking-widest px-2' }, 'Layer'),
                            createElement('div', { key: 'btns', className: 'flex gap-2' }, 
                                ((dev.keymapJson && dev.keymapJson.layers) || (dev.design && dev.design.layers) || [0,1,2,3]).map((_, l) => createElement('button', { key: l, onClick: () => updateDevice(dev.id, { layer: l }), className: (dev.layer === l ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300') + ' w-8 h-8 rounded-lg text-[10px] font-black transition-all' }, l))
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
                                onMacroClick: (macroId) => setMacroModalState({ deviceId: dev.id, macroId }),
                                keyStyle: dev.keyStyle || 'Windows'
                            })
                        )
                    ]) : createElement('div', { key: 'empty-area', className: 'py-20 text-center opacity-20' }, [
                        createElement('div', { key: 'icon', className: 'text-6xl mb-4' }, '⌨️'),
                        createElement('p', { key: 'text', className: 'text-[10px] font-black uppercase tracking-widest' }, 'Waiting for Data')
                    ])
                ])),
                
                devices.length < 4 ? createElement('div', { 
                    key: 'add-slot',
                    onClick: addSlot,
                    onDragOver: (e) => handleDragOver(e, 'add-slot'),
                    onDragLeave: handleDragLeave,
                    onDrop: (e) => handleDrop(e, null),
                    className: (dragOverTarget === 'add-slot' ? 'border-blue-400 bg-blue-500/10 text-blue-400' : 'border-slate-800 text-slate-700 hover:border-slate-600 hover:text-slate-500') + ' w-full py-12 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group'
                }, [
                    createElement('div', { key: 'icon', className: 'text-3xl transition-transform group-hover:scale-125' }, '+'),
                    createElement('div', { key: 'text', className: 'text-[10px] font-black uppercase tracking-widest' }, 'Add Slot')
                ]) : null
            ])
        ]),

        createElement('footer', { key: 'footer', className: (isLightApp ? 'text-slate-400' : 'text-slate-600') + ' mt-16 text-center text-[10px] font-bold uppercase tracking-widest pb-10' }, [
            '© 2026 Keymapping Viewer'
        ])
    ]);
}
