const { useState, useEffect, useMemo, useRef, useCallback, createElement } = React;

import { STORAGE_KEY } from './constants.js';
import { loadSavedState, sanitizeDeviceName } from './utils/helpers.js';
import { normalizeLegacyEncoderStyle } from './components/inputDeviceSettings.js';
import { Header } from './components/Header.js';
import { DeviceSlot } from './components/DeviceSlot.js';
import { HelpModal } from './components/Modals/HelpModal.js';
import { LinksModal } from './components/Modals/LinksModal.js';
import { MacroModal } from './components/Modals/MacroModal.js';
import { ExportModal } from './components/Modals/ExportModal.js';
import { LoadModal } from './components/Modals/LoadModal.js';
import { Keyboard } from './components/Keyboard.js';
import { findSupportedDeviceConfig, loadDeviceDefinition } from './utils/hid/deviceRegistry.js';
import { requestViaDevice, readViaDeviceKeymap } from './utils/hid/viaKeymapReader.js';
import {
  findLocalDeviceDefinition,
  removeLocalDeviceDefinition,
  saveLocalDeviceDefinition,
} from './utils/hid/localDefinitions.js';
import { formatUsbId, validateDefinitionForDevice } from './utils/hid/definitionUtils.js';
import { isLayoutJson, normalizeLayoutJson, normalizeMappingJson } from './utils/loadJsonUtils.js';
import { initPerfDebug, perfCounter } from './utils/perfDebug.js';

const CURRENT_VERSION = '1.2.5';
const DEFAULT_DISPLAY_SCALE = 1;
const MIN_DISPLAY_SCALE = 0.35;
const MAX_DISPLAY_SCALE = 1.6;
const EXPORT_KEYBOARD_SCALE = 1;
const DEFAULT_DISPLAY_SCALE_BY_LAYOUT = Object.freeze({
  stack: DEFAULT_DISPLAY_SCALE,
  grid: DEFAULT_DISPLAY_SCALE,
});
let nextDeviceId = Date.now();

function createDeviceId() {
  nextDeviceId += 1;
  return nextDeviceId;
}

function normalizeDisplayScale(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : DEFAULT_DISPLAY_SCALE;
}

function clampDisplayScale(value) {
  return Math.min(MAX_DISPLAY_SCALE, Math.max(MIN_DISPLAY_SCALE, normalizeDisplayScale(value)));
}

function normalizeDisplayScaleByLayout(
  displayScaleByLayout,
  legacyDisplayScale = DEFAULT_DISPLAY_SCALE
) {
  const fallback = normalizeDisplayScale(legacyDisplayScale);
  return {
    stack: normalizeDisplayScale(displayScaleByLayout?.stack ?? fallback),
    grid: normalizeDisplayScale(displayScaleByLayout?.grid ?? fallback),
  };
}

function getDisplayScaleForLayout(device, layoutMode) {
  const scales = normalizeDisplayScaleByLayout(device.displayScaleByLayout, device.displayScale);
  return normalizeDisplayScale(
    scales[layoutMode] ?? DEFAULT_DISPLAY_SCALE_BY_LAYOUT[layoutMode] ?? device.displayScale
  );
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

function normalizeDeviceIds(devices = []) {
  const seenIds = new Set();
  return devices.map((device) => {
    const rawId = Number(device?.id);
    const nextId =
      Number.isFinite(rawId) && rawId > 0 && !seenIds.has(rawId) ? rawId : createDeviceId();
    seenIds.add(nextId);
    return {
      ...device,
      id: nextId,
    };
  });
}

function normalizeNameForComparison(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function definitionSeemsToMatchConnectedDevice(definition, selectedDevice) {
  try {
    validateDefinitionForDevice(definition, selectedDevice);
  } catch {
    return false;
  }

  const deviceName = normalizeNameForComparison(selectedDevice?.productName);
  const definitionName = normalizeNameForComparison(definition?.name);

  if (!deviceName || !definitionName) {
    return true;
  }

  return deviceName.includes(definitionName) || definitionName.includes(deviceName);
}

function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        resolve(JSON.parse(event.target.result));
      } catch {
        reject(new Error('JSONファイルの解析に失敗しました。'));
      }
    };
    reader.onerror = () => reject(new Error('JSONファイルの読み込みに失敗しました。'));
    reader.readAsText(file);
  });
}

function createEmptyDevice() {
  return {
    id: createDeviceId(),
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
    showSettings: false,
    showCallouts: false,
    keyAnnotations: {},
  };
}

export function App() {
  initPerfDebug();
  perfCounter('App.render');
  const savedState = useMemo(() => {
    const loadedState = loadSavedState();
    if (loadedState && loadedState.version === CURRENT_VERSION) return loadedState;
    return null;
  }, []);
  const [devices, setDevices] = useState(() => {
    // Try to restore from URL parameter first
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedDataParam = urlParams.get('data');
      if (sharedDataParam && window.LZString) {
        const decompressed = window.LZString.decompressFromEncodedURIComponent(sharedDataParam);
        if (decompressed) {
          const sharedState = JSON.parse(decompressed);
          if (sharedState && sharedState.design) {
            return [
              {
                id: createDeviceId(),
                name: sanitizeDeviceName(sharedState.name || 'Shared Device'),
                design: sharedState.design,
                keymapJson: sharedState.keymapJson,
                layer: 0,
                displayMode: sharedState.displayMode || 'Fluent',
                theme: sharedState.theme || 'System',
                keyStyle: sharedState.keyStyle || 'Windows',
                encoderStyles: sharedState.encoderStyles || {},
                inputDeviceSettings: buildInputDeviceSettings(
                  sharedState.inputDeviceSettings,
                  sharedState.encoderStyles
                ),
                layoutOptions: sharedState.layoutOptions || {},
                separation: sharedState.separation || 'DISABLE',
                displayScale: normalizeDisplayScale(sharedState.displayScale),
                displayScaleByLayout: normalizeDisplayScaleByLayout(
                  sharedState.displayScaleByLayout,
                  sharedState.displayScale
                ),
                followScale: !!sharedState.followScale,
                macroAliases: sharedState.keymapJson?.macroAliases || {},
                showSettings: false,
                showCallouts: false,
                keyAnnotations: sharedState.keyAnnotations || {},
              },
            ];
          }
        }
      }
    } catch (error) {
      console.error('Failed to restore shared state from URL:', error);
    }

    if (savedState && savedState.devices && savedState.devices.length > 0) {
      return normalizeDeviceIds(
        savedState.devices.map((device) => ({
          ...device,
          inputDeviceSettings: buildInputDeviceSettings(
            device.inputDeviceSettings,
            device.encoderStyles
          ),
          displayScale: normalizeDisplayScale(device.displayScale),
          displayScaleByLayout: normalizeDisplayScaleByLayout(
            device.displayScaleByLayout,
            device.displayScale
          ),
          followScale: !!device.followScale,
          showCallouts: !!device.showCallouts,
          keyAnnotations: device.keyAnnotations || {},
        }))
      );
    }
    return [createEmptyDevice()];
  });
  const [layoutMode, setLayoutMode] = useState(
    () => (savedState && savedState.layoutMode) || 'stack'
  );
  const [appTheme, setAppTheme] = useState(
    () => (savedState && savedState.appTheme) || 'dark'
  );
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [draggedSlotId, setDraggedSlotId] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [macroModalState, setMacroModalState] = useState(null);
  const [exportModalDevId, setExportModalDevId] = useState(null);
  const [loadFlowState, setLoadFlowState] = useState(null);
  const [exportSettings, setExportSettings] = useState({
    layers: [],
    includeMacros: true,
    background: 'Dark',
  });
  const [isExporting, setIsExporting] = useState(false);
  const isInitialMount = useRef(true);
  const exportRef = useRef(null);
  const draggedSlotElementRef = useRef(null);
  const slotScaleMetricsRef = useRef({});
  const layoutFileInputRef = useRef(null);
  const mappingFileInputRef = useRef(null);
  const pendingFileActionRef = useRef(null);
  const pendingConnectedDeviceRef = useRef(null);

  const applyDisplayScalePresetForLayout = (
    targetLayoutMode,
    targetScale = DEFAULT_DISPLAY_SCALE
  ) => {
    setDevices((prev) =>
      prev.map((device) => {
        const nextScale = clampDisplayScale(targetScale);
        const nextScales = normalizeDisplayScaleByLayout(
          device.displayScaleByLayout,
          device.displayScale
        );
        return {
          ...device,
          displayScale: nextScale,
          displayScaleByLayout: {
            ...nextScales,
            [targetLayoutMode]: nextScale,
          },
        };
      })
    );
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
        { file: 'SampleLayouts/sample_numpad.json', keyStyle: 'Windows' },
      ];

      try {
        const devs = await Promise.all(
          sampleFiles.map(async (sampleFile) => {
            // Use cache busting to ensure we get the latest version from disk
            const response = await fetch(`${sampleFile.file}?t=${Date.now()}`);
            if (!response.ok) throw new Error(`Failed to load ${sampleFile.file}`);
            const sampleData = await response.json();

            // Separate Layout (design) and Mapping (keymapJson) logic
            const design = {
              name: sampleData.name,
              layouts: sampleData.layouts,
              matrix: sampleData.matrix,
              encoders: sampleData.encoders || [],
            };

            const keymapJson = {
              layers: sampleData.layers || [],
              macros: sampleData.macros || [],
              macroAliases: sampleData.macroAliases || {},
              encoders: sampleData.encoders || [],
            };

            return {
              id: createDeviceId(),
              name: sanitizeDeviceName(sampleData.name),
              design: design,
              keymapJson: keymapJson,
              layer: 0,
              displayMode: 'Fluent',
              theme: 'System',
              keyStyle: sampleFile.keyStyle,
              encoderStyles: sampleData.encoderStyles || {},
              inputDeviceSettings: buildInputDeviceSettings(
                sampleData.inputDeviceSettings,
                sampleData.encoderStyles
              ),
              layoutOptions: {},
              displayScale: DEFAULT_DISPLAY_SCALE,
              displayScaleByLayout: { ...DEFAULT_DISPLAY_SCALE_BY_LAYOUT },
              followScale: false,
              macroAliases: keymapJson.macroAliases,
              showSettings: false,
              showCallouts: false,
            };
          })
        );
        setDevices(devs);
      } catch (error) {
        console.error('Error loading initial samples:', error);
      }
    };

    loadSamples();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      const state = { devices, layoutMode, appTheme, version: CURRENT_VERSION };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save state:', error);
    }
  }, [devices, layoutMode, appTheme]);

  // Robust Export Logic (using html-to-image for accurate flexbox rendering)
  useEffect(() => {
    if (isExporting && exportRef.current) {
      const runExport = async () => {
        const exportDevice = devices.find((device) => device.id === exportModalDevId);
        if (!exportDevice) {
          setIsExporting(false);
          return;
        }
        try {
          // Dynamically import html-to-image (ESM) – only loaded when export is triggered
          const { toPng } = await import('https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm');

          // Ensure fonts are loaded
          if (document.fonts) await document.fonts.ready;
          // Double‑tick to ensure the export container is rendered
          await new Promise((r) => requestAnimationFrame(r));
          await new Promise((r) => requestAnimationFrame(r));
          // Make export container visible for capture
          if (exportRef.current) {
            exportRef.current.style.opacity = '1';
          }
          // Capture using html-to-image (foreignObject-based, faithful to browser rendering)
          const bgColor =
            exportSettings.background === 'Transparent'
              ? null
              : exportSettings.background === 'Light'
                ? '#f1f5f9'
                : '#020617';
          const exportedImageUrl = await toPng(exportRef.current, {
            pixelRatio: 2,
            backgroundColor: bgColor,
            cacheBust: true,
          });
          // Reset opacity after capture
          if (exportRef.current) {
            exportRef.current.style.opacity = '0';
          }
          // Download the image
          const link = document.createElement('a');
          link.download = `${exportDevice.name || 'Keymap'}_export.png`;
          link.href = exportedImageUrl;
          link.click();
        } catch (error) {
          console.error('Export failed:', error);
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

  const isLightApp = appTheme === 'light';

  const handleExportClick = () => {
    setIsExporting(true);
  };

  const handleSlotScaleMetrics = useCallback((deviceId, metrics) => {
    slotScaleMetricsRef.current[deviceId] = metrics;
  }, []);

  const handleOpenExportModal = useCallback(
    (device) => {
      setExportModalDevId(device.id);
      setExportSettings({
        layers: [device.layer],
        includeMacros: true,
        background: isLightApp ? 'Light' : 'Dark',
      });
    },
    [isLightApp]
  );

  const addSlot = () => {
    if (devices.length >= 4) return;
    setDevices((prev) => [...prev, createEmptyDevice()]);
  };

  const updateDevice = (id, data) => {
    setDevices((prev) => {
      const next = prev.map((device) => {
        if (device.id !== id) return device;

        const nextDevice = { ...device, ...data };
        const scales = normalizeDisplayScaleByLayout(
          nextDevice.displayScaleByLayout,
          nextDevice.displayScale
        );

        if (Object.prototype.hasOwnProperty.call(data, 'displayScale')) {
          const nextScale = clampDisplayScale(data.displayScale);
          nextDevice.displayScaleByLayout = {
            ...scales,
            [layoutMode]: nextScale,
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
      const nextSource = next.find((d) => d.id === id);
      if (
        !sourceMetrics ||
        !nextSource ||
        !Number.isFinite(sourceMetrics.autoFitScale) ||
        sourceMetrics.autoFitScale <= 0
      ) {
        return next;
      }

      const targetFinalScale =
        sourceMetrics.autoFitScale * getDisplayScaleForLayout(nextSource, layoutMode);

      return next.map((device) => {
        if (device.id === id || !device.followScale) return device;
        const metrics = slotScaleMetricsRef.current[device.id];
        if (!metrics || !Number.isFinite(metrics.autoFitScale) || metrics.autoFitScale <= 0) {
          return device;
        }
        const nextScale = clampDisplayScale(targetFinalScale / metrics.autoFitScale);
        const nextScales = normalizeDisplayScaleByLayout(
          device.displayScaleByLayout,
          device.displayScale
        );
        return {
          ...device,
          displayScale: nextScale,
          displayScaleByLayout: {
            ...nextScales,
            [layoutMode]: nextScale,
          },
        };
      });
    });
  };

  const handleMatchKeySize = () => {
    const metricsEntries = devices
      .filter((dev) => !!dev.design)
      .map((dev) => ({
        id: dev.id,
        metrics: slotScaleMetricsRef.current[dev.id],
      }))
      .filter(
        (entry) =>
          entry.metrics &&
          Number.isFinite(entry.metrics.autoFitScale) &&
          entry.metrics.autoFitScale > 0
      );

    if (metricsEntries.length < 2) return;

    const targetScale = Math.min(...metricsEntries.map((entry) => entry.metrics.autoFitScale));

    setDevices((prev) =>
      prev.map((device) => {
        const metrics = slotScaleMetricsRef.current[device.id];
        if (
          !device.design ||
          !metrics ||
          !Number.isFinite(metrics.autoFitScale) ||
          metrics.autoFitScale <= 0
        ) {
          return device;
        }
        const nextScale = clampDisplayScale(targetScale / metrics.autoFitScale);
        const nextScales = normalizeDisplayScaleByLayout(
          device.displayScaleByLayout,
          device.displayScale
        );
        return {
          ...device,
          displayScale: nextScale,
          displayScaleByLayout: {
            ...nextScales,
            [layoutMode]: nextScale,
          },
        };
      })
    );
  };

  const applyLayoutToSlot = (slotId, layoutJson, options = {}) => {
    const currentDevice = devices.find((device) => device.id === slotId);
    const shouldResetMapping = options.resetMapping !== false;
    updateDevice(slotId, {
      name: sanitizeDeviceName(layoutJson.name || currentDevice?.name || 'Device'),
      design: layoutJson,
      keymapJson: shouldResetMapping ? null : currentDevice?.keymapJson || null,
      macroAliases: shouldResetMapping ? {} : currentDevice?.macroAliases || {},
      layoutOptions: {},
      encoderStyles: layoutJson.encoderStyles || {},
      inputDeviceSettings: buildInputDeviceSettings(
        layoutJson.inputDeviceSettings,
        layoutJson.encoderStyles
      ),
    });
  };

  const applyMappingToSlot = (slotId, mappingJson) => {
    updateDevice(slotId, {
      keymapJson: mappingJson,
      macroAliases: mappingJson.macroAliases || {},
    });
  };

  const openLoadModal = (slotId) => {
    pendingFileActionRef.current = null;
    pendingConnectedDeviceRef.current = null;
    setLoadFlowState({
      slotId,
      step: 'root',
      isBusy: false,
      errorMessage: '',
      pendingDeviceInfo: null,
    });
  };

  const closeLoadModal = () => {
    pendingFileActionRef.current = null;
    pendingConnectedDeviceRef.current = null;
    setLoadFlowState(null);
  };

  const triggerLayoutFilePicker = (action) => {
    pendingFileActionRef.current = action;
    requestAnimationFrame(() => {
      layoutFileInputRef.current?.click();
    });
  };

  const triggerMappingFilePicker = (slotId) => {
    pendingFileActionRef.current = { kind: 'mapping', slotId };
    requestAnimationFrame(() => {
      mappingFileInputRef.current?.click();
    });
  };

  const startFileLoadFlow = (slotId) => {
    setLoadFlowState((prev) =>
      prev && prev.slotId === slotId
        ? {
            ...prev,
            errorMessage: '',
          }
        : prev
    );
    triggerLayoutFilePicker({ kind: 'layout-root', slotId });
  };

  const cacheDefinitionForDevice = (selectedDevice, definition) => {
    try {
      const validatedDefinition = validateDefinitionForDevice(definition, selectedDevice);
      saveLocalDeviceDefinition({
        ...validatedDefinition,
        name: validatedDefinition.name || selectedDevice.productName || 'Connected Device',
      });
    } catch (error) {
      console.warn('Failed to cache layout definition locally:', error);
    }
  };

  const applyConnectedDeviceDefinition = async (slotId, selectedDevice, definition) => {
    const keymapJson = await readViaDeviceKeymap(selectedDevice, definition);

    updateDevice(slotId, {
      name: sanitizeDeviceName(selectedDevice.productName || definition.name || 'Connected Device'),
      design: definition,
      keymapJson,
      macroAliases: keymapJson.macroAliases || {},
      layoutOptions: {},
      encoderStyles: definition.encoderStyles || {},
      inputDeviceSettings: buildInputDeviceSettings(
        definition.inputDeviceSettings,
        definition.encoderStyles
      ),
    });

    cacheDefinitionForDevice(selectedDevice, definition);
    closeLoadModal();
  };

  const prepareLayoutFallback = (slotId, selectedDevice, baseMessage) => {
    pendingConnectedDeviceRef.current = selectedDevice;
    setLoadFlowState({
      slotId,
      step: 'device',
      isBusy: false,
      errorMessage: baseMessage,
      pendingDeviceInfo: {
        vendorId: selectedDevice.vendorId,
        productId: selectedDevice.productId,
        productName: selectedDevice.productName || '',
      },
    });
  };

  const handleLayoutFileSelected = async (e) => {
    const file = e.target.files?.[0];
    const action = pendingFileActionRef.current;
    e.target.value = '';
    pendingFileActionRef.current = null;

    if (!file || !action) {
      return;
    }

    try {
      const parsed = await readJsonFile(file);
      const layoutJson = normalizeLayoutJson(parsed);

      if (action.kind === 'layout-root') {
        applyLayoutToSlot(action.slotId, layoutJson, { resetMapping: true });
        setLoadFlowState({
          slotId: action.slotId,
          step: 'post-layout',
          isBusy: false,
          errorMessage: '',
          pendingDeviceInfo: null,
        });
        return;
      }

      if (action.kind === 'layout-for-device') {
        const selectedDevice = pendingConnectedDeviceRef.current;
        if (!selectedDevice) {
          setLoadFlowState((prev) =>
            prev
              ? {
                  ...prev,
                  step: 'device',
                  errorMessage:
                    '接続中デバイス情報が見つかりません。もう一度 WebHID 読込をやり直してください。',
                }
              : prev
          );
          return;
        }

        setLoadFlowState((prev) =>
          prev
            ? {
                ...prev,
                step: 'device',
                isBusy: true,
                errorMessage: '',
              }
            : prev
        );

        const validatedLayout = validateDefinitionForDevice(layoutJson, selectedDevice);
        await applyConnectedDeviceDefinition(action.slotId, selectedDevice, validatedLayout);
      }
    } catch (error) {
      console.error('Failed to load layout JSON:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'LAYOUT JSON の読み込みに失敗しました。';
      setLoadFlowState((prev) =>
        prev
          ? {
              ...prev,
              step: action.kind === 'layout-for-device' ? 'device' : 'root',
              isBusy: false,
              errorMessage,
            }
          : prev
      );
    }
  };

  const handleMappingFileSelected = async (e) => {
    const file = e.target.files?.[0];
    const action = pendingFileActionRef.current;
    e.target.value = '';
    pendingFileActionRef.current = null;

    if (!file || !action || action.kind !== 'mapping') {
      return;
    }

    try {
      const parsed = await readJsonFile(file);
      const mappingJson = normalizeMappingJson(parsed);
      applyMappingToSlot(action.slotId, mappingJson);
      closeLoadModal();
    } catch (error) {
      console.error('Failed to load mapping JSON:', error);
      setLoadFlowState((prev) =>
        prev
          ? {
              ...prev,
              step: 'post-layout',
              isBusy: false,
              errorMessage:
                error instanceof Error ? error.message : 'MAPPING JSON の読み込みに失敗しました。',
            }
          : prev
      );
    }
  };

  const handleMappingDeviceLoad = async (slotId) => {
    setLoadFlowState((prev) =>
      prev && prev.slotId === slotId
        ? {
            ...prev,
            step: 'root',
            isBusy: true,
            errorMessage: '',
            pendingDeviceInfo: null,
          }
        : prev
    );

    try {
      const selectedDevice = await requestViaDevice();
      if (!selectedDevice) {
        setLoadFlowState((prev) =>
          prev && prev.slotId === slotId
            ? {
                ...prev,
                isBusy: false,
              }
            : prev
        );
        return;
      }

      const cachedDefinitionRecord = findLocalDeviceDefinition(
        selectedDevice.vendorId,
        selectedDevice.productId
      );
      if (cachedDefinitionRecord?.definition) {
        if (
          definitionSeemsToMatchConnectedDevice(cachedDefinitionRecord.definition, selectedDevice)
        ) {
          await applyConnectedDeviceDefinition(
            slotId,
            selectedDevice,
            cachedDefinitionRecord.definition
          );
          return;
        }

        console.warn(
          'Cached layout definition did not match connected device name, removing stale cache entry.'
        );
        removeLocalDeviceDefinition(selectedDevice.vendorId, selectedDevice.productId);
      }

      const currentDevice = devices.find((device) => device.id === slotId) || null;
      if (currentDevice?.design && isLayoutJson(currentDevice.design)) {
        try {
          const matchedLayout = validateDefinitionForDevice(
            normalizeLayoutJson(currentDevice.design),
            selectedDevice
          );
          if (!definitionSeemsToMatchConnectedDevice(matchedLayout, selectedDevice)) {
            throw new Error('Current slot layout name does not match connected device.');
          }
          await applyConnectedDeviceDefinition(slotId, selectedDevice, matchedLayout);
          return;
        } catch (validationError) {
          console.warn(
            'Current slot layout does not match connected device, skipping slot layout reuse:',
            validationError
          );
        }
      }

      const deviceConfig = findSupportedDeviceConfig(
        selectedDevice.vendorId,
        selectedDevice.productId
      );
      if (deviceConfig) {
        try {
          const definition = await loadDeviceDefinition(deviceConfig);
          await applyConnectedDeviceDefinition(slotId, selectedDevice, definition);
          return;
        } catch (definitionError) {
          console.warn('Failed to load bundled device definition:', definitionError);
        }
      }

      prepareLayoutFallback(
        slotId,
        selectedDevice,
        `このデバイス (${formatUsbId(selectedDevice.vendorId)} / ${formatUsbId(selectedDevice.productId)}) の LAYOUT を解決できませんでした。LAYOUT 用 JSON を読み込んで続行してください。`
      );
    } catch (error) {
      if (error && (error.name === 'NotFoundError' || error.name === 'AbortError')) {
        setLoadFlowState((prev) =>
          prev && prev.slotId === slotId
            ? {
                ...prev,
                isBusy: false,
                errorMessage: '',
              }
            : prev
        );
        return;
      }

      console.error('Failed to load mapping from HID device:', error);
      setLoadFlowState((prev) =>
        prev && prev.slotId === slotId
          ? {
              ...prev,
              step: 'root',
              isBusy: false,
              errorMessage:
                error instanceof Error
                  ? error.message
                  : '接続デバイスからの読み込みに失敗しました。',
            }
          : prev
      );
      pendingConnectedDeviceRef.current = null;
    }
  };

  const removeDevice = (id) => {
    if (devices.length === 1) {
      updateDevice(id, { ...createEmptyDevice(), id });
    } else {
      setDevices((prev) => prev.filter((d) => d.id !== id));
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
        const isDroppedLayout = isLayoutJson(j);
        const isDroppedMapping = Array.isArray(j?.layers);
        if (targetDevId) {
          if (isDroppedLayout) {
            applyLayoutToSlot(targetDevId, normalizeLayoutJson(j), { resetMapping: true });
          } else if (isDroppedMapping) {
            applyMappingToSlot(targetDevId, normalizeMappingJson(j));
          }
        } else {
          if (devices.length >= 4) return;
          const newDevice = createEmptyDevice();
          if (isDroppedLayout) {
            const layoutJson = normalizeLayoutJson(j);
            newDevice.design = layoutJson;
            newDevice.name = sanitizeDeviceName(layoutJson.name || 'Device');
            newDevice.layoutOptions = {};
            newDevice.encoderStyles = layoutJson.encoderStyles || {};
            newDevice.inputDeviceSettings = buildInputDeviceSettings(
              layoutJson.inputDeviceSettings,
              layoutJson.encoderStyles
            );
          } else if (isDroppedMapping) {
            const mappingJson = normalizeMappingJson(j);
            newDevice.keymapJson = mappingJson;
            newDevice.macroAliases = mappingJson.macroAliases || {};
            newDevice.name = sanitizeDeviceName(mappingJson.name || 'Mapping');
          }
          setDevices((prev) => [...prev, newDevice]);
        }
      } catch {
        alert('JSONファイルの解析に失敗しました');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e, targetDevId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);
    if (e.dataTransfer.files.length > 0) {
      const file = Array.from(e.dataTransfer.files).find((f) => f.name.endsWith('.json'));
      if (file) processDroppedFile(file, targetDevId);
      return;
    }
    if (draggedSlotId && draggedSlotId !== targetDevId) {
      setDevices((prev) => {
        const next = [...prev];
        const fromIdx = next.findIndex((d) => d.id === draggedSlotId);
        const toIdx = next.findIndex((d) => d.id === targetDevId);
        if (fromIdx === -1 || toIdx === -1) return prev;
        const [movedDevice] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, movedDevice);
        return next;
      });
    }
    setDraggedSlotId(null);
  };

  const deviceViewItems = useMemo(
    () =>
      devices.map((device, deviceIndex) => ({
        idx: deviceIndex,
        dev: {
          ...device,
          displayScale: getDisplayScaleForLayout(device, layoutMode),
          displayScaleByLayout: normalizeDisplayScaleByLayout(
            device.displayScaleByLayout,
            device.displayScale
          ),
        },
        onScaleMetricsChange: (metrics) => handleSlotScaleMetrics(device.id, metrics),
        onSetExportModal: () => handleOpenExportModal(device),
      })),
    [devices, layoutMode, handleSlotScaleMetrics, handleOpenExportModal]
  );

  return createElement(
    'div',
    {
      className:
        (isLightApp ? 'app-light' : 'app-dark') +
        ' min-h-screen w-full max-w-full px-4 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-8 flex flex-col transition-colors duration-300',
      style: {
        overflowX: 'clip',
      },
    },
    [
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
        appTheme,
      }),

      showHelp &&
        createElement(HelpModal, {
          key: 'help-modal',
          isLightApp,
          onClose: () => setShowHelp(false),
        }),

      showLinks &&
        createElement(LinksModal, {
          key: 'links-modal',
          isLightApp,
          onClose: () => setShowLinks(false),
        }),

      macroModalState &&
        createElement(MacroModal, {
          key: 'macro-modal',
          isLightApp,
          device: devices.find((d) => d.id === macroModalState.deviceId),
          macroModalState,
          onClose: () => setMacroModalState(null),
          onUpdateDevice: updateDevice,
        }),

      exportModalDevId &&
        createElement(ExportModal, {
          key: 'export-modal',
          isLightApp,
          isExporting,
          onExport: handleExportClick,
          onClose: () => setExportModalDevId(null),
        }),

      loadFlowState &&
        createElement(LoadModal, {
          key: 'load-modal',
          isLightApp,
          slotLabel:
            `Slot ${devices.findIndex((device) => device.id === loadFlowState.slotId) + 1 || ''}`.trim(),
          step: loadFlowState.step || 'root',
          isBusy: !!loadFlowState.isBusy,
          errorMessage: loadFlowState.errorMessage || '',
          pendingDeviceInfo: loadFlowState.pendingDeviceInfo || null,
          onChooseFileFlow: () => startFileLoadFlow(loadFlowState.slotId),
          onChooseDeviceFlow: () => handleMappingDeviceLoad(loadFlowState.slotId),
          onChooseMappingFile: () => triggerMappingFilePicker(loadFlowState.slotId),
          onSkipMapping: closeLoadModal,
          onChooseLayoutForDevice: () =>
            triggerLayoutFilePicker({ kind: 'layout-for-device', slotId: loadFlowState.slotId }),
          onClose: closeLoadModal,
        }),

      createElement('input', {
        key: 'global-layout-file-input',
        ref: layoutFileInputRef,
        type: 'file',
        accept: '.json,application/json',
        className: 'hidden',
        onChange: handleLayoutFileSelected,
      }),

      createElement('input', {
        key: 'global-mapping-file-input',
        ref: mappingFileInputRef,
        type: 'file',
        accept: '.json,application/json',
        className: 'hidden',
        onChange: handleMappingFileSelected,
      }),

      // Hidden Export Container
      isExporting &&
        exportModalDevId &&
        (() => {
          const exportDevice = devices.find((device) => device.id === exportModalDevId);
          return createElement(
            'div',
            {
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
                zIndex: '-100',
              },
            },
            [
              createElement(Keyboard, {
                design: exportDevice.design,
                layer: exportDevice.layer,
                externalMap: exportDevice.keymapJson,
                displayMode: exportDevice.displayMode,
                theme: exportDevice.theme || 'System',
                appTheme: exportSettings.background === 'Light' ? 'light' : 'dark',
                macroAliases: exportDevice.macroAliases || {},
                keyStyle: exportDevice.keyStyle || 'Windows',
                encoderStyles: exportDevice.encoderStyles || {},
                inputDeviceSettings: exportDevice.inputDeviceSettings || {},
                layoutOptions: exportDevice.layoutOptions || {},
                forcedScale: EXPORT_KEYBOARD_SCALE,
                userScale: EXPORT_KEYBOARD_SCALE,
                separation: exportDevice.separation || 'DISABLE',
              }),
            ]
          );
        })(),

      createElement('main', { key: 'main', className: 'flex-1 flex flex-col gap-8' }, [
        createElement(
          'div',
          {
            key: 'main-layout',
            className:
              layoutMode === 'grid'
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-8'
                : 'flex flex-col gap-8',
          },
          [
            deviceViewItems.map(({ dev, idx, onScaleMetricsChange, onSetExportModal }) =>
              createElement(DeviceSlot, {
                key: dev.id,
                dev,
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
                onOpenLoadModal: openLoadModal,
                onSetMacroModal: setMacroModalState,
                onScaleMetricsChange,
                onSetExportModal,
              })
            ),

            devices.length < 4
              ? createElement(
                  'div',
                  {
                    key: 'add-slot',
                    onClick: addSlot,
                    onDragOver: (e) => handleDragOver(e, 'add-slot'),
                    onDragLeave: handleDragLeave,
                    onDrop: (e) => handleDrop(e, null),
                    className:
                      (dragOverTarget === 'add-slot'
                        ? 'border-blue-400 bg-blue-500/10 text-blue-400'
                        : 'border-slate-800 text-slate-700 hover:border-slate-600 hover:text-slate-500') +
                      ' w-full py-12 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group',
                  },
                  [
                    createElement(
                      'div',
                      {
                        key: 'icon',
                        className: 'text-3xl transition-transform group-hover:scale-125',
                      },
                      '+'
                    ),
                    createElement(
                      'div',
                      {
                        key: 'text',
                        className: 'text-[10px] font-black uppercase tracking-widest',
                      },
                      'Add Slot'
                    ),
                  ]
                )
              : null,
          ]
        ),
      ]),

      createElement(
        'footer',
        {
          key: 'footer',
          className:
            (isLightApp ? 'text-slate-400' : 'text-slate-600') +
            ' mt-16 text-center text-[10px] font-bold uppercase tracking-widest pb-10',
        },
        ['© 2026 Keymapping Viewer']
      ),
    ]
  );
}
