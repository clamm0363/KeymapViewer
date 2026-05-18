const { useState, useEffect, useMemo, useRef, createElement } = React;

import { STORAGE_KEY } from './constants.js';
import { loadSavedState } from './utils/helpers.js';
import { Header } from './components/Header.js';
import { DeviceSlot } from './components/DeviceSlot.js';
import { HelpModal } from './components/Modals/HelpModal.js';
import { MacroModal } from './components/Modals/MacroModal.js';
import { ExportModal } from './components/Modals/ExportModal.js';
import { Keyboard } from './components/Keyboard.js';

const CURRENT_VERSION = '1.2.5';

export function App() {
    const saved = useMemo(() => {
        const s = loadSavedState();
        if (s && s.version === CURRENT_VERSION) return s;
        return null;
    }, []);
    const [devices, setDevices] = useState(() => {
        // Try to restore from URL parameter first
        try {
            const params = new URLSearchParams(window.location.search);
            const dataParam = params.get('data');
            if (dataParam && window.LZString) {
                const decompressed = window.LZString.decompressFromEncodedURIComponent(dataParam);
                if (decompressed) {
                    const parsed = JSON.parse(decompressed);
                    if (parsed && parsed.design) {
                        return [{
                            id: Date.now(),
                            name: parsed.name || 'Shared Device',
                            design: parsed.design,
                            keymapJson: parsed.keymapJson,
                            layer: 0,
                            displayMode: parsed.displayMode || 'Fluent',
                            theme: parsed.theme || 'System',
                            keyStyle: parsed.keyStyle || 'Windows',
                            macroAliases: parsed.keymapJson?.macroAliases || {},
                            showSettings: false
                        }];
                    }
                }
            }
        } catch (e) {
            console.error('Failed to restore shared state from URL:', e);
        }

        // Fallback to saved state
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
    const exportRef = useRef(null);

    useEffect(() => {
        // Skip loading samples if we already have a loaded device design (e.g. from saved state or URL sharing)
        if (devices && devices.length > 0 && devices[0].design) return; 

        const loadSamples = async () => {
            const sampleFiles = [
                { file: 'SampleLayouts/sample_tkl_jp.json', keyStyle: 'Windows' },
                { file: 'SampleLayouts/sample_100_win.json', keyStyle: 'Windows' },
                { file: 'SampleLayouts/sample_hhkb_mac.json', keyStyle: 'Mac' },
                { file: 'SampleLayouts/sample_numpad.json', keyStyle: 'Windows' }
            ];

            try {
                const devs = await Promise.all(sampleFiles.map(async (s, idx) => {
                    // Use cache busting to ensure we get the latest version from disk
                    const resp = await fetch(`${s.file}?t=${Date.now()}`);
                    if (!resp.ok) throw new Error(`Failed to load ${s.file}`);
                    const data = await resp.json();
                    
                    // Separate Layout (design) and Mapping (keymapJson) logic
                    const design = {
                        name: data.name,
                        layouts: data.layouts,
                        matrix: data.matrix
                    };
                    
                    const keymapJson = {
                        layers: data.layers || [],
                        macros: data.macros || [],
                        macroAliases: data.macroAliases || {}
                    };

                    return {
                        id: Date.now() + idx,
                        name: data.name,
                        design: design,
                        keymapJson: keymapJson,
                        layer: 0,
                        displayMode: 'Fluent',
                        theme: 'System',
                        keyStyle: s.keyStyle,
                        macroAliases: keymapJson.macroAliases,
                        showSettings: false
                    };
                }));
                setDevices(devs);
            } catch (err) {
                console.error('Error loading initial samples:', err);
            }
        };

        loadSamples();
    }, []);

    useEffect(() => {
        if (isInitialMount.current) { isInitialMount.current = false; return; }
        try {
            const state = { devices, layoutMode, appTheme, version: CURRENT_VERSION };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) { console.warn('Failed to save state:', e); }
    }, [devices, layoutMode, appTheme]);

    // Robust Export Logic
    useEffect(() => {
        if (isExporting && exportRef.current) {
            const runExport = async () => {
                const dev = devices.find(d => d.id === exportModalDevId);
                if (!dev) {
                    setIsExporting(false);
                    return;
                }

                try {
                    // Wait for fonts to be ready
                    if (document.fonts) await document.fonts.ready;
                    
                    // Double-tick to ensure React has rendered the export-container to the DOM
                    await new Promise(r => requestAnimationFrame(r));
                    await new Promise(r => requestAnimationFrame(r));

                    const canvas = await html2canvas(exportRef.current, { 
                        backgroundColor: exportSettings.background === 'Transparent' ? null : (exportSettings.background === 'Light' ? '#f1f5f9' : '#020617'),
                        scale: 2,
                        logging: false,
                        useCORS: true,
                        allowTaint: true
                    });

                    const link = document.createElement('a');
                    link.download = `${dev.name || 'Keymap'}_export.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                } catch(e) { 
                    console.error('Export failed:', e); 
                    alert('画像の書き出しに失敗しました。');
                } finally {
                    setIsExporting(false);
                    setExportModalDevId(null);
                }
            };
            runExport();
        }
    }, [isExporting, exportModalDevId, devices, exportSettings.background]);

    const handleExportClick = () => {
        setIsExporting(true);
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
        if (e.target) e.target.style.opacity = '1';
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
        createElement(Header, {
            key: 'header',
            isLightApp,
            layoutMode,
            deviceCount: devices.length,
            onShowHelp: () => setShowHelp(true),
            onAddSlot: addSlot,
            onSetLayoutMode: setLayoutMode,
            onSetAppTheme: setAppTheme,
            appTheme
        }),

        showHelp && createElement(HelpModal, {
            key: 'help-modal',
            isLightApp,
            onClose: () => setShowHelp(false)
        }),

        macroModalState && createElement(MacroModal, {
            key: 'macro-modal',
            isLightApp,
            device: devices.find(d => d.id === macroModalState.deviceId),
            macroModalState,
            onClose: () => setMacroModalState(null),
            onUpdateDevice: updateDevice
        }),

        exportModalDevId && createElement(ExportModal, {
            key: 'export-modal',
            isLightApp,
            isExporting,
            onExport: handleExportClick,
            onClose: () => setExportModalDevId(null)
        }),

        // Hidden Export Container
        isExporting && exportModalDevId && (() => {
            const dev = devices.find(d => d.id === exportModalDevId);
            return createElement('div', {
                key: 'export-hidden',
                ref: exportRef,
                style: {
                    position: 'absolute',
                    left: '-9999px',
                    top: '0',
                    padding: '40px',
                    background: exportSettings.background === 'Light' ? '#f1f5f9' : '#020617',
                    width: 'fit-content'
                }
            }, [
                createElement(Keyboard, {
                    design: dev.design,
                    layer: dev.layer,
                    externalMap: dev.keymapJson,
                    displayMode: dev.displayMode,
                    theme: dev.theme || 'System',
                    appTheme: exportSettings.background === 'Light' ? 'light' : 'dark',
                    macroAliases: dev.macroAliases || {},
                    keyStyle: dev.keyStyle || 'Windows',
                    isExportMode: true,
                    forcedScale: 1.0 
                })
            ]);
        })(),

        createElement('main', { key: 'main', className: 'flex-1 flex flex-col gap-8' }, [
            createElement('div', { key: 'main-layout', className: (layoutMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : 'flex flex-col gap-8') }, [
                devices.map((dev, idx) => createElement(DeviceSlot, { 
                    key: dev.id,
                    dev,
                    idx,
                    isLightApp,
                    dragOverTarget,
                    editingDeviceId,
                    editingName,
                    appTheme,
                    onDragStart: handleSlotDragStart,
                    onDragEnd: handleSlotDragEnd,
                    onDragOver: handleDragOver,
                    onDragLeave: handleDragLeave,
                    onDrop: handleDrop,
                    onUpdateDevice: updateDevice,
                    onRemoveDevice: removeDevice,
                    onStartEditing: startEditing,
                    onFinishEditing: finishEditing,
                    onSetEditingName: setEditingName,
                    onFileHandle: handleFile,
                    onSetMacroModal: setMacroModalState,
                    onSetExportModal: (d) => { 
                        setExportModalDevId(d.id); 
                        setExportSettings({ layers: [d.layer], includeMacros: true, background: isLightApp ? 'Light' : 'Dark' }); 
                    }
                })),
                
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
