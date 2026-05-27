const { useState, useEffect, useMemo, useRef, createElement } = React;

import { STORAGE_KEY } from './constants.js';
import { loadSavedState, sanitizeDeviceName } from './utils/helpers.js';
import { normalizeLegacyEncoderStyle } from './components/inputDeviceSettings.js';
import { Header } from './components/Header.js';
import { DeviceSlot } from './components/DeviceSlot.js';
import { HelpModal } from './components/Modals/HelpModal.js';
import { LinksModal } from './components/Modals/LinksModal.js';
import { MacroModal } from './components/Modals/MacroModal.js';
import { ExportModal } from './components/Modals/ExportModal.js';
import { MappingSourceModal } from './components/Modals/MappingSourceModal.js';
import { Keyboard } from './components/Keyboard.js';
import { findSupportedDeviceConfig, loadDeviceDefinition, SUPPORTED_HID_FILTERS } from './utils/hid/deviceRegistry.js';
import { requestViaDevice, readViaDeviceKeymap } from './utils/hid/viaKeymapReader.js';

const CURRENT_VERSION = '1.2.5';
const DEFAULT_DISPLAY_SCALE = 1;
const MIN_DISPLAY_SCALE = 0.35;
const MAX_DISPLAY_SCALE = 1.6;
const EXPORT_KEYBOARD_SCALE = 1;
const DEFAULT_DISPLAY_SCALE_BY_LAYOUT = Object.freeze({
    stack: DEFAULT_DISPLAY_SCALE,
    grid: DEFAULT_DISPLAY_SCALE
});

function normalizeDisplayScale(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : DEFAULT_DISPLAY_SCALE;
}

function clampDisplayScale(value) {
    return Math.min(MAX_DISPLAY_SCALE, Math.max(MIN_DISPLAY_SCALE, normalizeDisplayScale(value)));
}

function normalizeDisplayScaleByLayout(displayScaleByLayout, legacyDisplayScale = DEFAULT_DISPLAY_SCALE) {
    const fallback = normalizeDisplayScale(legacyDisplayScale);
    return {
        stack: normalizeDisplayScale(displayScaleByLayout?.stack ?? fallback),
        grid: normalizeDisplayScale(displayScaleByLayout?.grid ?? fallback)
    };
}

function getDisplayScaleForLayout(device, layoutMode) {
    const scales = normalizeDisplayScaleByLayout(device.displayScaleByLayout, device.displayScale);
    return normalizeDisplayScale(scales[layoutMode] ?? DEFAULT_DISPLAY_SCALE_BY_LAYOUT[layoutMode] ?? device.displayScale);
}

function buildInputDeviceSettings(inputDeviceSettings = {}, encoderStyles = {}) {
    const next = { ...inputDeviceSettings };
    Object.entries(encoderStyles || {}).forEach(([idx, style]) => {
        if (!next[idx]) {
            next[idx] = normalizeLegacyEncoderStyle(style);
        }
    });
    return next;
}

function createEmptyDevice() {
    return {
        id: Date.now(),
        name: null,
        design: null,
        keymapJson: null,
        layer: 0,
        displayMode: 'Fluent',
        theme: 'System',
        keyStyle: 'Windows',
        encoderStyles: {},
        inputDeviceSettings: {},
        layoutOptions: {},
        separation: 'DISABLE',
        displayScale: DEFAULT_DISPLAY_SCALE,
        displayScaleByLayout: { ...DEFAULT_DISPLAY_SCALE_BY_LAYOUT },
        followScale: false,
        showSettings: false
    };
}

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
                            name: sanitizeDeviceName(parsed.name || 'Shared Device'),
                            design: parsed.design,
                            keymapJson: parsed.keymapJson,
                            layer: 0,
                            displayMode: parsed.displayMode || 'Fluent',
                            theme: parsed.theme || 'System',
                            keyStyle: parsed.keyStyle || 'Windows',
                            encoderStyles: parsed.encoderStyles || {},
                            inputDeviceSettings: buildInputDeviceSettings(parsed.inputDeviceSettings, parsed.encoderStyles),
                            layoutOptions: parsed.layoutOptions || {},
                            separation: parsed.separation || 'DISABLE',
                            displayScale: normalizeDisplayScale(parsed.displayScale),
                            displayScaleByLayout: normalizeDisplayScaleByLayout(parsed.displayScaleByLayout, parsed.displayScale),
                            followScale: !!parsed.followScale,
                            macroAliases: parsed.keymapJson?.macroAliases || {},
                            showSettings: false
                        }];
                    }
                }
            }
        } catch (e) {
            console.error('Failed to restore shared state from URL:', e);
        }

        if (saved && saved.devices && saved.devices.length > 0) {
            return saved.devices.map(device => ({
                ...device,
                inputDeviceSettings: buildInputDeviceSettings(device.inputDeviceSettings, device.encoderStyles),
                displayScale: normalizeDisplayScale(device.displayScale),
                displayScaleByLayout: normalizeDisplayScaleByLayout(device.displayScaleByLayout, device.displayScale),
                followScale: !!device.followScale
            }));
        }
        return [createEmptyDevice()];
    });
    const [layoutMode, setLayoutMode] = useState(() => (saved && saved.layoutMode) || 'stack');
    const [appTheme, setAppTheme] = useState(() => (saved && saved.appTheme) || 'dark');
    const [editingDeviceId, setEditingDeviceId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [draggedSlotId, setDraggedSlotId] = useState(null);
    const [dragOverTarget, setDragOverTarget] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [showLinks, setShowLinks] = useState(false);
    const [macroModalState, setMacroModalState] = useState(null);
    const [exportModalDevId, setExportModalDevId] = useState(null);
    const [mappingSourceState, setMappingSourceState] = useState(null);
    const [exportSettings, setExportSettings] = useState({ layers: [], includeMacros: true, background: 'Dark' });
    const [isExporting, setIsExporting] = useState(false);
    const isInitialMount = useRef(true);
    const exportRef = useRef(null);
    const draggedSlotElementRef = useRef(null);
    const slotScaleMetricsRef = useRef({});
    const mappingFileInputRef = useRef(null);
    const mappingFileTargetIdRef = useRef(null);

    const applyDisplayScalePresetForLayout = (targetLayoutMode, targetScale = DEFAULT_DISPLAY_SCALE) => {
        setDevices(prev => prev.map(device => {
            const nextScale = clampDisplayScale(targetScale);
            const nextScales = normalizeDisplayScaleByLayout(device.displayScaleByLayout, device.displayScale);
            return {
                ...device,
                displayScale: nextScale,
                displayScaleByLayout: {
                    ...nextScales,
                    [targetLayoutMode]: nextScale
                }
            };
        }));
    };

    const handleLayoutModeChange = (nextLayoutMode) => {
        setLayoutMode(nextLayoutMode);
        applyDisplayScalePresetForLayout(nextLayoutMode, DEFAULT_DISPLAY_SCALE);
    };

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
                        matrix: data.matrix,
                        encoders: data.encoders || []
                    };
                    
                    const keymapJson = {
                        layers: data.layers || [],
                        macros: data.macros || [],
                        macroAliases: data.macroAliases || {},
                        encoders: data.encoders || []
                    };

                    return {
                        id: Date.now() + idx,
                        name: sanitizeDeviceName(data.name),
                        design: design,
                        keymapJson: keymapJson,
                        layer: 0,
                        displayMode: 'Fluent',
                        theme: 'System',
                        keyStyle: s.keyStyle,
                        encoderStyles: data.encoderStyles || {},
                        inputDeviceSettings: buildInputDeviceSettings(data.inputDeviceSettings, data.encoderStyles),
                        layoutOptions: {},
                        displayScale: DEFAULT_DISPLAY_SCALE,
                        displayScaleByLayout: { ...DEFAULT_DISPLAY_SCALE_BY_LAYOUT },
                        followScale: false,
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

    // Robust Export Logic (using html-to-image for accurate flexbox rendering)
    useEffect(() => {
        if (isExporting && exportRef.current) {
            const runExport = async () => {
                const dev = devices.find(d => d.id === exportModalDevId);
                if (!dev) {
                    setIsExporting(false);
                    return;
                }
                try {
                    // Dynamically import html-to-image (ESM) – only loaded when export is triggered
                    const { toPng } = await import('https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm');

                    // Ensure fonts are loaded
                    if (document.fonts) await document.fonts.ready;
                    // Double‑tick to ensure the export container is rendered
                    await new Promise(r => requestAnimationFrame(r));
                    await new Promise(r => requestAnimationFrame(r));
                    // Make export container visible for capture
                    if (exportRef.current) {
                        exportRef.current.style.opacity = '1';
                    }
                    // Capture using html-to-image (foreignObject-based, faithful to browser rendering)
                    const bgColor = exportSettings.background === 'Transparent' ? null : (exportSettings.background === 'Light' ? '#f1f5f9' : '#020617');
                    const dataUrl = await toPng(exportRef.current, {
                        pixelRatio: 2,
                        backgroundColor: bgColor,
                        cacheBust: true
                    });
                    // Reset opacity after capture
                    if (exportRef.current) {
                        exportRef.current.style.opacity = '0';
                    }
                    // Download the image
                    const link = document.createElement('a');
                    link.download = `${dev.name || 'Keymap'}_export.png`;
                    link.href = dataUrl;
                    link.click();
                } catch (e) {
                    console.error('Export failed:', e);
                    alert('画像の書き出しに失敗しました。');
                    // Reset opacity on error too
                    if (exportRef.current) {
                        exportRef.current.style.opacity = '0';
                    }
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
        setDevices(prev => [...prev, createEmptyDevice()]);
    };

    const updateDevice = (id, data) => {
        setDevices(prev => {
            const next = prev.map(d => {
                if (d.id !== id) return d;

                const nextDevice = { ...d, ...data };
                const scales = normalizeDisplayScaleByLayout(nextDevice.displayScaleByLayout, nextDevice.displayScale);

                if (Object.prototype.hasOwnProperty.call(data, 'displayScale')) {
                    const nextScale = clampDisplayScale(data.displayScale);
                    nextDevice.displayScaleByLayout = {
                        ...scales,
                        [layoutMode]: nextScale
                    };
                    nextDevice.displayScale = nextScale;
                } else {
                    nextDevice.displayScaleByLayout = scales;
                    nextDevice.displayScale = normalizeDisplayScale(scales[layoutMode]);
                }

                return nextDevice;
            });
            if (!Object.prototype.hasOwnProperty.call(data, 'displayScale')) {
                return next;
            }

            const sourceMetrics = slotScaleMetricsRef.current[id];
            const nextSource = next.find(d => d.id === id);
            if (!sourceMetrics || !nextSource || !Number.isFinite(sourceMetrics.autoFitScale) || sourceMetrics.autoFitScale <= 0) {
                return next;
            }

            const targetFinalScale = sourceMetrics.autoFitScale * getDisplayScaleForLayout(nextSource, layoutMode);

            return next.map(device => {
                if (device.id === id || !device.followScale) return device;
                const metrics = slotScaleMetricsRef.current[device.id];
                if (!metrics || !Number.isFinite(metrics.autoFitScale) || metrics.autoFitScale <= 0) {
                    return device;
                }
                const nextScale = clampDisplayScale(targetFinalScale / metrics.autoFitScale);
                const nextScales = normalizeDisplayScaleByLayout(device.displayScaleByLayout, device.displayScale);
                return {
                    ...device,
                    displayScale: nextScale,
                    displayScaleByLayout: {
                        ...nextScales,
                        [layoutMode]: nextScale
                    }
                };
            });
        });
    };

    const handleMatchKeySize = () => {
        const metricsEntries = devices
            .filter(dev => !!dev.design)
            .map(dev => ({
                id: dev.id,
                metrics: slotScaleMetricsRef.current[dev.id]
            }))
            .filter(entry => entry.metrics && Number.isFinite(entry.metrics.autoFitScale) && entry.metrics.autoFitScale > 0);

        if (metricsEntries.length < 2) return;

        const targetScale = Math.min(...metricsEntries.map(entry => entry.metrics.autoFitScale));

        setDevices(prev => prev.map(device => {
            const metrics = slotScaleMetricsRef.current[device.id];
            if (!device.design || !metrics || !Number.isFinite(metrics.autoFitScale) || metrics.autoFitScale <= 0) {
                return device;
            }
            const nextScale = clampDisplayScale(targetScale / metrics.autoFitScale);
            const nextScales = normalizeDisplayScaleByLayout(device.displayScaleByLayout, device.displayScale);
            return {
                ...device,
                displayScale: nextScale,
                displayScaleByLayout: {
                    ...nextScales,
                    [layoutMode]: nextScale
                }
            };
        }));
    };

    const handleFile = (e, id, type) => {
        const f = e.target.files[0];
        if (f) {
            const r = new FileReader();
            r.onload = (ev) => {
                try {
                    const j = JSON.parse(ev.target.result);
                    if (type === 'layout') {
                        if (j.layouts) updateDevice(id, {
                            design: j,
                            name: sanitizeDeviceName(j.name || 'Device'),
                            layoutOptions: {},
                            encoderStyles: j.encoderStyles || {},
                            inputDeviceSettings: buildInputDeviceSettings(j.inputDeviceSettings, j.encoderStyles)
                        });
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

    const openMappingSource = (slotId) => {
        setMappingSourceState({
            slotId,
            isDeviceLoading: false,
            errorMessage: ''
        });
    };

    const closeMappingSource = () => {
        setMappingSourceState(null);
    };

    const triggerMappingFilePicker = (slotId) => {
        mappingFileTargetIdRef.current = slotId;
        setMappingSourceState(null);
        requestAnimationFrame(() => {
            mappingFileInputRef.current?.click();
        });
    };

    const handleGlobalMappingFile = (e) => {
        const slotId = mappingFileTargetIdRef.current;
        mappingFileTargetIdRef.current = null;

        if (slotId !== null && slotId !== undefined) {
            handleFile(e, slotId, 'mapping');
        } else {
            e.target.value = '';
        }
    };

    const handleMappingDeviceLoad = async (slotId) => {
        setMappingSourceState((prev) => prev && prev.slotId === slotId ? {
            ...prev,
            isDeviceLoading: true,
            errorMessage: ''
        } : prev);

        try {
            const selectedDevice = await requestViaDevice(SUPPORTED_HID_FILTERS);
            if (!selectedDevice) {
                setMappingSourceState((prev) => prev && prev.slotId === slotId ? {
                    ...prev,
                    isDeviceLoading: false
                } : prev);
                return;
            }

            const deviceConfig = findSupportedDeviceConfig(selectedDevice.vendorId, selectedDevice.productId);
            if (!deviceConfig) {
                throw new Error('このデバイスに対応するレイアウト定義がまだ登録されていません。');
            }

            const definition = await loadDeviceDefinition(deviceConfig);
            const keymapJson = await readViaDeviceKeymap(selectedDevice, definition);

            updateDevice(slotId, {
                name: sanitizeDeviceName(selectedDevice.productName || definition.name || 'Connected Device'),
                design: definition,
                keymapJson,
                macroAliases: keymapJson.macroAliases || {},
                layoutOptions: {},
                encoderStyles: definition.encoderStyles || {},
                inputDeviceSettings: buildInputDeviceSettings(definition.inputDeviceSettings, definition.encoderStyles)
            });

            setMappingSourceState(null);
        } catch (error) {
            if (error && (error.name === 'NotFoundError' || error.name === 'AbortError')) {
                setMappingSourceState((prev) => prev && prev.slotId === slotId ? {
                    ...prev,
                    isDeviceLoading: false,
                    errorMessage: ''
                } : prev);
                return;
            }

            console.error('Failed to load mapping from HID device:', error);
            setMappingSourceState((prev) => prev && prev.slotId === slotId ? {
                ...prev,
                isDeviceLoading: false,
                errorMessage: error instanceof Error ? error.message : '接続デバイスからの読み込みに失敗しました。'
            } : prev);
        }
    };

    const removeDevice = (id) => {
        if (devices.length === 1) {
            updateDevice(id, { ...createEmptyDevice(), id });
        } else {
            setDevices(prev => prev.filter(d => d.id !== id));
        }
    };

    const startEditing = (dev) => {
        setEditingDeviceId(dev.id);
        setEditingName(dev.name || '');
    };

    const finishEditing = (id) => {
        const cleaned = sanitizeDeviceName(editingName);
        if (cleaned.trim()) updateDevice(id, { name: cleaned.trim() });
        setEditingDeviceId(null);
    };

    const handleSlotDragStart = (e, devId) => {
        setDraggedSlotId(devId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/slot-id', devId.toString());
        const slotElement = e.currentTarget.closest('[data-slot-root="true"]');
        draggedSlotElementRef.current = slotElement || null;
        if (slotElement) {
            const rect = slotElement.getBoundingClientRect();
            e.dataTransfer.setDragImage(
                slotElement,
                Math.min(Math.max(e.clientX - rect.left, 24), rect.width - 24),
                Math.min(Math.max(e.clientY - rect.top, 24), rect.height - 24)
            );
        }
        requestAnimationFrame(() => {
            if (draggedSlotElementRef.current) {
                draggedSlotElementRef.current.style.opacity = '0.4';
            }
        });
    };

    const handleSlotDragEnd = () => {
        if (draggedSlotElementRef.current) {
            draggedSlotElementRef.current.style.opacity = '1';
            draggedSlotElementRef.current = null;
        }
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
                    if (j.layouts) updateDevice(targetDevId, {
                        design: j,
                        name: sanitizeDeviceName(j.name || 'Device'),
                        layoutOptions: {},
                        encoderStyles: j.encoderStyles || {},
                        inputDeviceSettings: buildInputDeviceSettings(j.inputDeviceSettings, j.encoderStyles)
                    });
                    else if (j.layers) updateDevice(targetDevId, { keymapJson: j });
                } else {
                    if (devices.length >= 4) return;
                    const nd = createEmptyDevice();
                    if (j.layouts) {
                        nd.design = j;
                        nd.name = sanitizeDeviceName(j.name || 'Device');
                        nd.layoutOptions = {};
                        nd.encoderStyles = j.encoderStyles || {};
                        nd.inputDeviceSettings = buildInputDeviceSettings(j.inputDeviceSettings, j.encoderStyles);
                    }
                    else if (j.layers) { nd.keymapJson = j; nd.name = sanitizeDeviceName(j.name || 'Mapping'); }
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
        className: (isLightApp ? 'app-light' : 'app-dark') + ' min-h-screen w-full max-w-full px-4 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-8 flex flex-col transition-colors duration-300',
        style: {
            overflowX: 'clip'
        }
    }, [
        createElement(Header, {
            key: 'header',
            isLightApp,
            layoutMode,
            deviceCount: devices.length,
            onShowHelp: () => setShowHelp(true),
            onShowLinks: () => setShowLinks(true),
            onMatchKeySize: handleMatchKeySize,
            onSetLayoutMode: handleLayoutModeChange,
            onSetAppTheme: setAppTheme,
            appTheme
        }),

        showHelp && createElement(HelpModal, {
            key: 'help-modal',
            isLightApp,
            onClose: () => setShowHelp(false)
        }),

        showLinks && createElement(LinksModal, {
            key: 'links-modal',
            isLightApp,
            onClose: () => setShowLinks(false)
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

        mappingSourceState && createElement(MappingSourceModal, {
            key: 'mapping-source-modal',
            isLightApp,
            slotLabel: `Slot ${devices.findIndex((device) => device.id === mappingSourceState.slotId) + 1 || ''}`.trim(),
            isDeviceLoading: !!mappingSourceState.isDeviceLoading,
            errorMessage: mappingSourceState.errorMessage || '',
            onChooseFile: () => triggerMappingFilePicker(mappingSourceState.slotId),
            onChooseDevice: () => handleMappingDeviceLoad(mappingSourceState.slotId),
            onClose: closeMappingSource
        }),

        createElement('input', {
            key: 'global-mapping-file-input',
            ref: mappingFileInputRef,
            type: 'file',
            accept: '.json,application/json',
            className: 'hidden',
            onChange: handleGlobalMappingFile
        }),

        // Hidden Export Container
        isExporting && exportModalDevId && (() => {
            const dev = devices.find(d => d.id === exportModalDevId);
            return createElement('div', {
                key: 'export-hidden',
                ref: exportRef,
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: 'fit-content',
                    height: 'fit-content',
                    padding: '40px',
                    background: exportSettings.background === 'Light' ? '#f1f5f9' : '#020617',
                    opacity: '0',
                    pointerEvents: 'none',
                    zIndex: '-100'
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
                    encoderStyles: dev.encoderStyles || {},
                    inputDeviceSettings: dev.inputDeviceSettings || {},
                    layoutOptions: dev.layoutOptions || {},
                    forcedScale: EXPORT_KEYBOARD_SCALE,
                    userScale: EXPORT_KEYBOARD_SCALE,
                    separation: dev.separation || 'DISABLE'
                })
            ]);
        })(),

        createElement('main', { key: 'main', className: 'flex-1 flex flex-col gap-8' }, [
            createElement('div', { key: 'main-layout', className: (layoutMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : 'flex flex-col gap-8') }, [
                devices.map((dev, idx) => createElement(DeviceSlot, { 
                    key: dev.id,
                    dev: {
                        ...dev,
                        displayScale: getDisplayScaleForLayout(dev, layoutMode),
                        displayScaleByLayout: normalizeDisplayScaleByLayout(dev.displayScaleByLayout, dev.displayScale)
                    },
                    idx,
                    isLightApp,
                    layoutMode,
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
                    onOpenMappingSource: openMappingSource,
                    onSetMacroModal: setMacroModalState,
                    onScaleMetricsChange: (metrics) => {
                        slotScaleMetricsRef.current[dev.id] = metrics;
                    },
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
