const { createElement, Fragment, useEffect, useState } = React;
import { Keyboard } from './Keyboard.js';
import { sanitizeDeviceName, findSplitX } from '../utils/helpers.js';
import { createSVGElement } from '../svg-icons.js';
import {
    getDefaultInputDeviceSetting,
    getVariantOptions,
    INPUT_DEVICE_KINDS,
    resolveInputDeviceSetting,
    toLegacyEncoderStyle
} from './inputDeviceSettings.js';

const MIN_DISPLAY_SCALE = 0.35;
const MAX_DISPLAY_SCALE = 1.6;
const DEFAULT_DISPLAY_SCALE = 1;
const MAX_VISIBLE_LAYER_BUTTONS = 8;

const normalizeDisplayScale = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : DEFAULT_DISPLAY_SCALE;
};

const renderSlotSvgIcon = (iconKey, color) => {
    const svgEl = createSVGElement(iconKey, { size: 20, color });
    if (!svgEl) return null;

    return createElement('div', {
        style: {
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        dangerouslySetInnerHTML: { __html: svgEl.outerHTML }
    });
};

const getEncoderIndices = (design) => {
    if (!design || !design.layouts || !design.layouts.keymap) return [];
    const indices = new Set();
    design.layouts.keymap.forEach(row => {
        row.forEach(item => {
            if (typeof item === 'string') {
                const parts = item.split('\n');
                const encoderMatch = parts.find(p => /^e\d+$/.test(p.trim()));
                if (encoderMatch) {
                    const idx = parseInt(encoderMatch.replace('e', ''), 10);
                    if (!isNaN(idx)) {
                        indices.add(idx);
                    }
                }
            }
        });
    });
    return [...indices].sort((a, b) => a - b);
};

const parseLayoutOption = (label, idx) => {
    let labelName = `OPTION ${idx + 1}`;
    let originalLabel = '';
    let choices = [
        { value: 0, label: 'MODE A' },
        { value: 1, label: 'MODE B' }
    ];

    if (typeof label === 'string') {
        originalLabel = label;
        choices = [
            { value: 0, label: 'MODE A' },
            { value: 1, label: 'MODE B' }
        ];
    } else if (Array.isArray(label)) {
        originalLabel = `Variant ${idx + 1}`;
        choices = label.map((c, cIdx) => ({
            value: cIdx,
            label: typeof c === 'string' ? c : String(c)
        }));
    } else if (label && typeof label === 'object') {
        originalLabel = label.label || '';
        const opts = label.options || label.choices || [];
        if (Array.isArray(opts)) {
            choices = opts.map((c, cIdx) => {
                if (typeof c === 'string') {
                    return { value: cIdx, label: c };
                } else if (Array.isArray(c) && c.length >= 2) {
                    return { value: parseInt(c[1], 10), label: c[0] };
                } else if (c && typeof c === 'object') {
                    return { value: c.value !== undefined ? c.value : cIdx, label: c.label || String(c.value) };
                }
                return { value: cIdx, label: String(c) };
            });
        }
    }
    return { labelName, originalLabel, choices };
};

const updateInputDeviceSetting = (dev, idx, partialSetting) => {
    const currentSetting = resolveInputDeviceSetting(dev.inputDeviceSettings, dev.encoderStyles, idx);
    const nextSetting = { ...currentSetting, ...partialSetting };
    return {
        inputDeviceSettings: {
            ...(dev.inputDeviceSettings || {}),
            [idx]: nextSetting
        },
        encoderStyles: {
            ...(dev.encoderStyles || {}),
            [idx]: toLegacyEncoderStyle(nextSetting)
        }
    };
};

export function DeviceSlot({ 
    dev, 
    idx, 
    isLightApp, 
    layoutMode,
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
    onOpenMappingSource,
    onSetMacroModal,
    onSetExportModal,
    onScaleMetricsChange
}) {
    const [copied, setCopied] = useState(false);
    const isGridLayout = layoutMode === 'grid';
    const hasData = !!dev.design;
    const encoderIndices = getEncoderIndices(dev.design);
    const hasGap = dev.design && findSplitX(dev.design) !== null;
    const showSeparation = hasGap;
    const hasEncoders = encoderIndices.length > 0;
    const hasLayoutOptions = !!(dev.design && dev.design.layouts && dev.design.layouts.labels && dev.design.layouts.labels.length > 0);
    const hasDeviceSpecificOptions = showSeparation || hasEncoders || hasLayoutOptions;
    const currentDisplayScale = normalizeDisplayScale(dev.displayScale);
    const isScaleFollowing = !!dev.followScale;
    const layerOptions = ((dev.keymapJson && dev.keymapJson.layers) || (dev.design && dev.design.layers) || [0, 1, 2, 3]);
    const totalLayerPages = Math.max(1, Math.ceil(layerOptions.length / MAX_VISIBLE_LAYER_BUTTONS));
    const [layerPage, setLayerPage] = useState(() => Math.min(totalLayerPages - 1, Math.floor((Number(dev.layer) || 0) / MAX_VISIBLE_LAYER_BUTTONS)));
    const clampedLayerPage = Math.min(layerPage, totalLayerPages - 1);
    const visibleLayerStart = clampedLayerPage * MAX_VISIBLE_LAYER_BUTTONS;
    const visibleLayerOptions = layerOptions.slice(visibleLayerStart, visibleLayerStart + MAX_VISIBLE_LAYER_BUTTONS);
    const showLayerPagination = layerOptions.length > MAX_VISIBLE_LAYER_BUTTONS;
    const actionButtonClass = isGridLayout
        ? 'flex h-9 min-w-[84px] items-center justify-center rounded-xl border px-3 text-[8px] font-black uppercase tracking-[0.18em] transition-all sm:min-w-[92px]'
        : 'flex h-10 min-w-[92px] items-center justify-center rounded-xl border px-3 text-[9px] font-black uppercase tracking-[0.22em] transition-all sm:min-w-[100px]';
    const neutralActionButtonClass = actionButtonClass + ' ' + (isLightApp
        ? 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm border-slate-200'
        : 'bg-slate-800/40 hover:bg-slate-700/60 text-slate-200 border-slate-700/50');
    const primaryActionButtonClass = actionButtonClass + ' ' + (isLightApp
        ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'
        : 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border-blue-500/30');
    const settingsPanel = createElement('div', {
        key: 'settings-panel-body',
        className: 'flex flex-col gap-4'
    }, [
        createElement('div', { key: 'global-opts', className: 'flex flex-wrap items-stretch gap-4' }, [
            createElement('div', { key: 'mode-sect', className: 'flex w-full flex-wrap items-center gap-4 ' + (isLightApp ? 'bg-white' : 'bg-slate-950/30') + ' p-2 px-4 rounded-xl border ' + (isLightApp ? 'border-slate-200' : 'border-slate-800/50') }, [
                createElement('span', { key: 't', className: 'text-[9px] font-black ' + (isLightApp ? 'text-slate-400' : 'text-slate-600') + ' uppercase tracking-widest' }, 'DISPLAY MODE:'),
                createElement('div', { key: 'btns', className: 'flex flex-wrap gap-4' }, ['Fluent', 'Text'].map(opt => createElement('label', { key: opt, className: 'flex items-center gap-1.5 cursor-pointer group' }, [
                    createElement('input', { key: 'i', type: 'radio', name: 'displayMode-' + dev.id, checked: dev.displayMode === opt, onChange: () => onUpdateDevice(dev.id, { displayMode: opt }), className: 'hidden' }),
                    createElement('div', { key: 'v', className: 'w-3 h-3 rounded-full border ' + (isLightApp ? 'border-slate-300' : 'border-slate-600') + ' flex items-center justify-center ' + (dev.displayMode === opt ? 'border-blue-500' : '') },
                        dev.displayMode === opt ? createElement('div', { className: 'w-1.5 h-1.5 rounded-full bg-blue-500' }) : null
                    ),
                    createElement('span', { key: 's', className: 'text-[9px] font-bold ' + (dev.displayMode === opt ? (isLightApp ? 'text-slate-900' : 'text-white') : 'text-slate-500') + ' uppercase' }, opt)
                ])))
            ]),
            createElement('div', { key: 'theme-sect', className: 'flex w-full flex-wrap items-center gap-4 ' + (isLightApp ? 'bg-white' : 'bg-slate-950/30') + ' p-2 px-4 rounded-xl border ' + (isLightApp ? 'border-slate-200' : 'border-slate-800/50') }, [
                createElement('span', { key: 't', className: 'text-[9px] font-black ' + (isLightApp ? 'text-slate-400' : 'text-slate-600') + ' uppercase tracking-widest' }, 'THEME:'),
                createElement('div', { key: 'btns', className: 'flex flex-wrap gap-4' }, ['Dark', 'Light', 'System'].map(opt => createElement('label', { key: opt, className: 'flex items-center gap-1.5 cursor-pointer group' }, [
                    createElement('input', { key: 'i', type: 'radio', name: 'theme-' + dev.id, checked: (dev.theme || 'System') === opt, onChange: () => onUpdateDevice(dev.id, { theme: opt }), className: 'hidden' }),
                    createElement('div', { key: 'v', className: 'w-3 h-3 rounded-full border ' + (isLightApp ? 'border-slate-300' : 'border-slate-600') + ' flex items-center justify-center ' + ((dev.theme || 'System') === opt ? 'border-blue-500' : '') },
                        (dev.theme || 'System') === opt ? createElement('div', { className: 'w-1.5 h-1.5 rounded-full bg-blue-500' }) : null
                    ),
                    createElement('span', { key: 's', className: 'text-[9px] font-bold ' + ((dev.theme || 'System') === opt ? (isLightApp ? 'text-slate-900' : 'text-white') : 'text-slate-500') + ' uppercase' }, opt)
                ])))
            ]),
            createElement('div', { key: 'style-sect', className: 'flex w-full flex-wrap items-center gap-4 ' + (isLightApp ? 'bg-white' : 'bg-slate-950/30') + ' p-2 px-4 rounded-xl border ' + (isLightApp ? 'border-slate-200' : 'border-slate-800/50') }, [
                createElement('span', { key: 't', className: 'text-[9px] font-black ' + (isLightApp ? 'text-slate-400' : 'text-slate-600') + ' uppercase tracking-widest' }, 'STYLE:'),
                createElement('div', { key: 'btns', className: 'flex flex-wrap gap-4' }, ['Windows', 'Mac'].map(opt => createElement('label', { key: opt, className: 'flex items-center gap-1.5 cursor-pointer group' }, [
                    createElement('input', { key: 'i', type: 'radio', name: 'keyStyle-' + dev.id, checked: (dev.keyStyle || 'Windows') === opt, onChange: () => onUpdateDevice(dev.id, { keyStyle: opt }), className: 'hidden' }),
                    createElement('div', { key: 'v', className: 'w-3 h-3 rounded-full border ' + (isLightApp ? 'border-slate-300' : 'border-slate-600') + ' flex items-center justify-center ' + ((dev.keyStyle || 'Windows') === opt ? 'border-blue-500' : '') },
                        (dev.keyStyle || 'Windows') === opt ? createElement('div', { className: 'w-1.5 h-1.5 rounded-full bg-blue-500' }) : null
                    ),
                    createElement('span', { key: 's', className: 'text-[9px] font-bold ' + ((dev.keyStyle || 'Windows') === opt ? (isLightApp ? 'text-slate-900' : 'text-white') : 'text-slate-500') + ' uppercase' }, opt)
                ])))
            ]),
            createElement('div', { key: 'scale-sect', className: 'flex min-w-0 w-full flex-wrap items-center gap-3 ' + (isLightApp ? 'bg-white' : 'bg-slate-950/30') + ' p-2 px-4 rounded-xl border ' + (isLightApp ? 'border-slate-200' : 'border-slate-800/50') }, [
                createElement('span', { key: 't', className: 'text-[9px] font-black ' + (isLightApp ? 'text-slate-400' : 'text-slate-600') + ' uppercase tracking-widest whitespace-nowrap' }, 'SCALE:'),
                createElement('input', {
                    key: 'slider',
                    type: 'range',
                    min: String(MIN_DISPLAY_SCALE * 100),
                    max: String(MAX_DISPLAY_SCALE * 100),
                    step: '5',
                    value: String(Math.round(currentDisplayScale * 100)),
                    disabled: isScaleFollowing,
                    onInput: (e) => onUpdateDevice(dev.id, { displayScale: Number(e.target.value) / 100 }),
                    className: 'min-w-[180px] flex-1 accent-blue-500 ' + (isScaleFollowing ? 'opacity-40 cursor-not-allowed' : '')
                }),
                createElement('span', { key: 'value', className: 'w-12 text-right text-[10px] font-black ' + (isScaleFollowing ? 'text-slate-400' : (isLightApp ? 'text-slate-700' : 'text-slate-200')) + ' uppercase tracking-widest' }, `${Math.round(currentDisplayScale * 100)}%`),
                createElement('button', {
                    key: 'reset',
                    disabled: isScaleFollowing,
                    onClick: () => onUpdateDevice(dev.id, { displayScale: DEFAULT_DISPLAY_SCALE }),
                    className: ((isScaleFollowing
                        ? (isLightApp ? 'bg-slate-100 text-slate-400' : 'bg-slate-900/60 text-slate-500')
                        : (isLightApp ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'))
                        + ' px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ' + (isScaleFollowing ? 'cursor-not-allowed' : ''))
                }, '100%'),
                createElement('label', { key: 'follow-lbl', className: 'flex items-center gap-2 cursor-pointer select-none' }, [
                    createElement('input', {
                        key: 'follow-input',
                        type: 'checkbox',
                        checked: isScaleFollowing,
                        onChange: (e) => onUpdateDevice(dev.id, { followScale: e.target.checked }),
                        className: 'sr-only'
                    }),
                    createElement('span', {
                        key: 'follow-box',
                        className: 'flex h-5 w-5 items-center justify-center rounded-md border transition-all ' + (
                            isScaleFollowing
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : (isLightApp ? 'border-slate-300 bg-white text-transparent' : 'border-slate-600 bg-slate-900/60 text-transparent')
                        )
                    }, createElement('svg', {
                        width: 12,
                        height: 12,
                        viewBox: '0 0 16 16',
                        fill: 'none',
                        stroke: 'currentColor',
                        strokeWidth: 2.4,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round'
                    }, [
                        createElement('path', { key: 'check', d: 'M3.5 8.5 6.5 11.5 12.5 4.5' })
                    ])),
                    createElement('span', {
                        key: 'follow-text',
                        className: 'text-[9px] font-black uppercase tracking-widest ' + (isScaleFollowing ? (isLightApp ? 'text-blue-600' : 'text-blue-300') : (isLightApp ? 'text-slate-500' : 'text-slate-400'))
                    }, 'FOLLOW SIZE')
                ])
            ])
        ]),
        hasDeviceSpecificOptions ? createElement('div', {
            key: 'device-opts-divider',
            className: 'w-full h-[1px] ' + (isLightApp ? 'bg-slate-200' : 'bg-slate-800')
        }) : null,
        hasDeviceSpecificOptions ? createElement('div', { key: 'device-opts', className: 'flex flex-wrap items-stretch gap-4' }, [
            showSeparation ? createElement('div', { key: 'separation-sect', className: 'flex w-full flex-wrap items-center gap-4 ' + (isLightApp ? 'bg-white' : 'bg-slate-950/30') + ' p-2 px-4 rounded-xl border ' + (isLightApp ? 'border-slate-200' : 'border-slate-800/50') }, [
                createElement('span', { key: 't', className: 'text-[9px] font-black ' + (isLightApp ? 'text-slate-400' : 'text-slate-600') + ' uppercase tracking-widest' }, 'SEPARATION:'),
                createElement('div', { key: 'btns', className: 'flex flex-wrap gap-4' }, ['Disable', 'Enable'].map(opt => {
                    const isChecked = (opt === 'Enable' ? dev.separation === 'ENABLE' : (!dev.separation || dev.separation === 'DISABLE'));
                    return createElement('label', {
                        key: opt,
                        onClick: (e) => {
                            e.preventDefault();
                            if (opt === 'Enable') {
                                const hasGap = findSplitX(dev.design) !== null;
                                if (hasGap) {
                                    onUpdateDevice(dev.id, { separation: 'ENABLE' });
                                } else {
                                    alert('有効なギャップが検出できませんでした。');
                                    onUpdateDevice(dev.id, { separation: 'DISABLE' });
                                }
                            } else {
                                onUpdateDevice(dev.id, { separation: 'DISABLE' });
                            }
                        },
                        className: 'flex items-center gap-1.5 cursor-pointer group'
                    }, [
                        createElement('input', {
                            key: 'i',
                            type: 'radio',
                            name: 'separation-' + dev.id,
                            checked: isChecked,
                            readOnly: true,
                            className: 'hidden'
                        }),
                        createElement('div', { key: 'v', className: 'w-3 h-3 rounded-full border ' + (isLightApp ? 'border-slate-300' : 'border-slate-600') + ' flex items-center justify-center ' + (isChecked ? 'border-blue-500' : '') },
                            isChecked ? createElement('div', { className: 'w-1.5 h-1.5 rounded-full bg-blue-500' }) : null
                        ),
                        createElement('span', { key: 's', className: 'text-[9px] font-bold ' + (isChecked ? (isLightApp ? 'text-slate-900' : 'text-white') : 'text-slate-500') + ' uppercase' }, opt)
                    ]);
                }))
            ]) : null,
            ...encoderIndices.map(idx => {
                const currentSetting = resolveInputDeviceSetting(dev.inputDeviceSettings, dev.encoderStyles, idx);
                const kindOptions = [
                    { value: INPUT_DEVICE_KINDS.ENCODER, label: 'Encoder' },
                    { value: INPUT_DEVICE_KINDS.POINTING_DEVICE, label: 'Pointing' }
                ];
                const variantOptions = getVariantOptions(currentSetting.kind);
                return createElement('div', { key: 'encoder-sect-' + idx, className: 'flex w-full flex-col items-start gap-3 ' + (isLightApp ? 'bg-white' : 'bg-slate-950/30') + ' p-2 px-4 rounded-xl border md:flex-row md:items-center md:gap-4 ' + (isLightApp ? 'border-slate-200' : 'border-slate-800/50') }, [
                    createElement('span', { key: 't', className: 'text-[9px] font-black ' + (isLightApp ? 'text-slate-400' : 'text-slate-600') + ' uppercase tracking-widest md:flex-shrink-0' }, 'INPUT e' + idx + ':'),
                    createElement('div', { key: 'device-option-groups', className: 'flex w-full flex-wrap items-center gap-3 md:gap-4' }, [
                        createElement('div', { key: 'device-kind-btns', className: 'flex flex-wrap items-center gap-4' }, kindOptions.map(opt => createElement('label', { key: opt.value, className: 'flex items-center gap-1.5 cursor-pointer group' }, [
                            createElement('input', {
                                key: 'i',
                                type: 'radio',
                                name: 'inputDeviceKind-' + idx + '-' + dev.id,
                                checked: currentSetting.kind === opt.value,
                                onChange: () => onUpdateDevice(dev.id, updateInputDeviceSetting(dev, idx, getDefaultInputDeviceSetting(opt.value))),
                                className: 'hidden'
                            }),
                            createElement('div', { key: 'v', className: 'w-3 h-3 rounded-full border ' + (isLightApp ? 'border-slate-300' : 'border-slate-600') + ' flex items-center justify-center ' + (currentSetting.kind === opt.value ? 'border-blue-500' : '') },
                                currentSetting.kind === opt.value ? createElement('div', { className: 'w-1.5 h-1.5 rounded-full bg-blue-500' }) : null
                            ),
                            createElement('span', { key: 's', className: 'text-[9px] font-bold ' + (currentSetting.kind === opt.value ? (isLightApp ? 'text-slate-900' : 'text-white') : 'text-slate-500') + ' uppercase' }, opt.label)
                        ]))),
                        createElement('div', { key: 'device-variant-btns', className: 'flex flex-wrap items-center gap-4' }, variantOptions.map(opt => createElement('label', { key: opt.value, className: 'flex items-center gap-1.5 cursor-pointer group' }, [
                            createElement('input', {
                                key: 'i',
                                type: 'radio',
                                name: 'inputDeviceVariant-' + idx + '-' + dev.id,
                                checked: currentSetting.variant === opt.value,
                                onChange: () => onUpdateDevice(dev.id, updateInputDeviceSetting(dev, idx, { variant: opt.value })),
                                className: 'hidden'
                            }),
                            createElement('div', { key: 'v', className: 'w-3 h-3 rounded-full border ' + (isLightApp ? 'border-slate-300' : 'border-slate-600') + ' flex items-center justify-center ' + (currentSetting.variant === opt.value ? 'border-blue-500' : '') },
                                currentSetting.variant === opt.value ? createElement('div', { className: 'w-1.5 h-1.5 rounded-full bg-blue-500' }) : null
                            ),
                            createElement('span', { key: 's', className: 'text-[9px] font-bold ' + (currentSetting.variant === opt.value ? (isLightApp ? 'text-slate-900' : 'text-white') : 'text-slate-500') + ' uppercase' }, opt.label)
                        ])))
                    ])
                ]);
            }),
            ...((dev.design && dev.design.layouts && dev.design.layouts.labels) || []).map((lbl, idx) => {
                const { labelName, originalLabel, choices } = parseLayoutOption(lbl, idx);
                const activeOptions = dev.layoutOptions || {};
                const currentValue = activeOptions[idx] !== undefined ? activeOptions[idx] : 0;

                return createElement('div', {
                    key: 'layout-opt-sect-' + idx,
                    title: originalLabel ? `Original Label: ${originalLabel}` : null,
                    className: 'flex w-full flex-wrap items-center gap-4 ' + (isLightApp ? 'bg-white' : 'bg-slate-950/30') + ' p-2 px-4 rounded-xl border ' + (isLightApp ? 'border-slate-200' : 'border-slate-800/50') + (originalLabel ? ' cursor-help' : '')
                }, [
                    createElement('span', {
                        key: 't',
                        className: 'text-[9px] font-black ' + (isLightApp ? 'text-slate-400' : 'text-slate-600') + ' uppercase tracking-widest'
                    }, labelName + ':'),
                    createElement('div', { key: 'btns', className: 'flex flex-wrap gap-4' }, choices.map(opt => createElement('label', {
                        key: opt.value,
                        className: 'flex items-center gap-1.5 cursor-pointer group'
                    }, [
                        createElement('input', {
                            key: 'i',
                            type: 'radio',
                            name: 'layoutOption-' + idx + '-' + dev.id,
                            checked: currentValue === opt.value,
                            onChange: () => onUpdateDevice(dev.id, {
                                layoutOptions: {
                                    ...activeOptions,
                                    [idx]: opt.value
                                }
                            }),
                            className: 'hidden'
                        }),
                        createElement('div', {
                            key: 'v',
                            className: 'w-3 h-3 rounded-full border ' + (isLightApp ? 'border-slate-300' : 'border-slate-600') + ' flex items-center justify-center ' + (currentValue === opt.value ? 'border-blue-500' : '')
                        }, currentValue === opt.value ? createElement('div', { className: 'w-1.5 h-1.5 rounded-full bg-blue-500' }) : null),
                        createElement('span', {
                            key: 's',
                            className: 'text-[9px] font-bold ' + (currentValue === opt.value ? (isLightApp ? 'text-slate-900' : 'text-white') : 'text-slate-500') + ' uppercase'
                        }, opt.label)
                    ])))
                ]);
            })
        ]) : null
    ]);

    useEffect(() => {
        const nextPage = Math.min(totalLayerPages - 1, Math.floor((Number(dev.layer) || 0) / MAX_VISIBLE_LAYER_BUTTONS));
        setLayerPage(prev => (prev === nextPage ? prev : nextPage));
    }, [dev.layer, totalLayerPages]);

    const renderLayerBar = () => dev.design ? createElement('div', {
        key: 'layer-bar',
        className: 'flex h-10 w-fit max-w-full items-center gap-2 rounded-xl border px-2.5 ' + (isLightApp ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/40 backdrop-blur-sm border-slate-700/50')
    }, [
        createElement('span', { key: 'lbl', className: 'px-1 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400' }, 'LAYER'),
        showLayerPagination ? createElement('button', {
            key: 'prev-page',
            type: 'button',
            disabled: clampedLayerPage === 0,
            onClick: () => setLayerPage(prev => Math.max(0, prev - 1)),
            className: ((clampedLayerPage === 0
                ? 'cursor-not-allowed opacity-35 '
                : '') + 'flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black transition-all ' + (isLightApp ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-700' : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-100'))
        }, '<') : null,
        createElement('div', { key: 'btns', className: 'flex gap-1.5' },
            visibleLayerOptions.map((_, pageOffset) => {
                const layerIndex = visibleLayerStart + pageOffset;
                return createElement('button', {
                    key: layerIndex,
                    onClick: () => onUpdateDevice(dev.id, { layer: layerIndex }),
                    className: (dev.layer === layerIndex
                        ? 'bg-blue-600 text-white shadow-lg'
                        : (isLightApp ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-700' : 'text-slate-500 hover:bg-slate-700/60 hover:text-slate-200'))
                        + ' flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-black transition-all'
                }, layerIndex)
            })
        ),
        showLayerPagination ? createElement('button', {
            key: 'next-page',
            type: 'button',
            disabled: clampedLayerPage >= totalLayerPages - 1,
            onClick: () => setLayerPage(prev => Math.min(totalLayerPages - 1, prev + 1)),
            className: ((clampedLayerPage >= totalLayerPages - 1
                ? 'cursor-not-allowed opacity-35 '
                : '') + 'flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black transition-all ' + (isLightApp ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-700' : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-100'))
        }, '>') : null
    ]) : null;

    const handleShare = () => {
        if (!hasData) return;
        try {
            const shareData = {
                name: dev.name,
                design: dev.design,
                keymapJson: dev.keymapJson,
                keyStyle: dev.keyStyle,
                theme: dev.theme,
                displayMode: dev.displayMode,
                encoderStyles: dev.encoderStyles,
                inputDeviceSettings: dev.inputDeviceSettings,
                layoutOptions: dev.layoutOptions,
                separation: dev.separation,
                displayScale: normalizeDisplayScale(dev.displayScale),
                displayScaleByLayout: dev.displayScaleByLayout,
                followScale: !!dev.followScale
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
        'data-slot-root': 'true',
        onDragOver: (e) => onDragOver(e, dev.id),
        onDragLeave: onDragLeave,
        onDrop: (e) => onDrop(e, dev.id),
        className: (isLightApp ? 'bg-white/80 border-slate-200' : 'bg-slate-900/40 border-slate-800') + ' relative min-w-0 flex flex-col rounded-[2rem] border-2 transition-all px-4 pb-4 pt-6 sm:px-6 sm:pb-6 sm:pt-8 ' + (dragOverTarget === dev.id ? 'border-blue-400 scale-[1.01]' : '')
    }, [
        createElement('div', {
            key: 'drag-handle-wrap',
            className: 'pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2'
        }, createElement('div', {
            draggable: true,
            onDragStart: (e) => onDragStart(e, dev.id),
            onDragEnd: onDragEnd,
            title: 'Drag Slot',
            className: 'pointer-events-auto flex h-9 min-w-[132px] cursor-grab active:cursor-grabbing items-center justify-center gap-3 rounded-full border px-4 shadow-lg backdrop-blur-sm transition-colors ' + (
                isLightApp
                    ? 'border-slate-200 bg-white/95 text-slate-500 hover:border-blue-300 hover:text-blue-600'
                    : 'border-slate-700 bg-slate-950/90 text-slate-500 hover:border-blue-500/60 hover:text-blue-300'
            )
        }, [
            createElement('span', {
                key: 'drag-grip',
                className: 'inline-flex items-center gap-1'
            }, [
                createElement('span', { key: 'dot-1', className: 'h-1.5 w-1.5 rounded-full bg-current opacity-70' }),
                createElement('span', { key: 'dot-2', className: 'h-1.5 w-1.5 rounded-full bg-current opacity-70' }),
                createElement('span', { key: 'dot-3', className: 'h-1.5 w-1.5 rounded-full bg-current opacity-70' })
            ]),
            createElement('span', {
                key: 'drag-label',
                className: 'text-[9px] font-black uppercase tracking-[0.28em]'
            }, 'Move Slot'),
            createElement('span', {
                key: 'drag-grip-2',
                className: 'inline-flex items-center gap-1'
            }, [
                createElement('span', { key: 'dot-1', className: 'h-1.5 w-1.5 rounded-full bg-current opacity-70' }),
                createElement('span', { key: 'dot-2', className: 'h-1.5 w-1.5 rounded-full bg-current opacity-70' }),
                createElement('span', { key: 'dot-3', className: 'h-1.5 w-1.5 rounded-full bg-current opacity-70' })
            ])
        ])),
        createElement('div', { key: 'slot-header', className: 'mb-5 flex flex-col gap-3' }, [
            createElement('div', { key: 'header-main-row', className: 'flex min-w-0 items-center justify-between gap-3' }, [
                createElement('div', { key: 'title-grp', className: 'flex min-w-0 flex-1 items-center gap-3' }, [
                    createElement('span', { key: 'slot-idx', className: 'inline-flex h-5 flex-shrink-0 items-center justify-center whitespace-nowrap rounded-md bg-blue-600 px-2 text-[10px] font-black uppercase tracking-wider text-white pt-[1px]' }, 'Slot ' + (idx + 1)),
                    editingDeviceId === dev.id ? 
                        createElement('input', { 
                            key: 'name-input', 
                            type: 'text', 
                            value: editingName, 
                            onInput: (e) => onSetEditingName(sanitizeDeviceName(e.target.value)), 
                            onBlur: () => onFinishEditing(dev.id), 
                            onKeyDown: (e) => e.key === 'Enter' && onFinishEditing(dev.id), 
                            placeholder: 'DEVICE NAME...',
                            className: (isLightApp 
                                ? 'bg-blue-50/80 border-blue-400 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20' 
                                : 'bg-blue-950/30 border-blue-500/60 text-white placeholder-slate-600 focus:bg-blue-950/50 focus:ring-2 focus:ring-blue-500/30') 
                                + ' text-lg font-black outline-none border-2 w-full max-w-[560px] min-w-0 px-3 py-1 rounded-xl transition-all uppercase',
                            ref: (el) => el && el.focus() 
                        }) :
                        createElement(Fragment, { key: 'name-static' }, [
                            createElement('div', { key: 'title-stack', className: 'flex min-w-0 flex-1 items-center gap-2' }, [
                                createElement('h2', { 
                                    key: 'h2', 
                                    className: 'min-w-0 break-words text-lg font-black leading-tight tracking-tight uppercase ' + (isLightApp ? 'text-slate-900' : 'text-slate-100'),
                                    style: { wordSpacing: '0.25em' } 
                                }, dev.name || 'No Device'),
                                createElement('button', { key: 'edit-btn', onClick: () => onStartEditing(dev), className: 'flex-shrink-0 p-1 text-slate-400 hover:text-blue-400 transition-colors' },
                                    renderSlotSvgIcon('ic_fluent_pen_24_regular', 'currentColor')
                                )
                            ])
                        ])
                ]),
                createElement('div', { key: 'header-controls', className: 'flex flex-shrink-0 items-center gap-1' }, [
                    createElement('button', { key: 'del-btn', onClick: () => onRemoveDevice(dev.id), className: 'p-2 text-slate-400 hover:text-red-400 transition-colors', title: 'Remove Slot' },
                        renderSlotSvgIcon('ic_fluent_delete_24_regular', 'currentColor')
                    ),
                    createElement('button', { key: 'settings-btn', onClick: () => onUpdateDevice(dev.id, { showSettings: !dev.showSettings }), className: 'p-2 ' + (dev.showSettings ? 'text-blue-400 bg-blue-500/10 rounded-lg' : 'text-slate-400 hover:text-blue-400') + ' transition-all', title: 'Display Settings' },
                        renderSlotSvgIcon('ic_fluent_navigation_24_regular', 'currentColor')
                    )
                ])
            ]),
            createElement('div', { key: 'header-control-band', className: isGridLayout ? 'flex flex-col gap-2' : 'flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between' }, isGridLayout ? [
                createElement('div', { key: 'action-band', className: 'flex flex-wrap items-center justify-start gap-2' }, [
                    createElement('label', { key: 'layout-lbl', className: neutralActionButtonClass + ' cursor-pointer' }, [
                        'LAYOUT',
                        createElement('input', { key: 'layout-file', type: 'file', className: 'hidden', onChange: (e) => onFileHandle(e, dev.id, 'layout') })
                    ]),
                    createElement('button', {
                        key: 'map-btn',
                        onClick: () => onOpenMappingSource(dev.id),
                        className: neutralActionButtonClass
                    }, 'MAPPING'),
                    createElement('button', { key: 'macro-btn', onClick: () => onSetMacroModal({ deviceId: dev.id, macroId: null }), className: neutralActionButtonClass }, 'MACROS'),
                    createElement('button', { 
                        key: 'share-btn', 
                        onClick: handleShare, 
                        disabled: !hasData,
                        className: actionButtonClass + ' ' +
                            (!hasData ? 'opacity-40 cursor-not-allowed border-dashed ' : '') +
                            (copied
                                ? (isLightApp ? 'bg-green-50 text-green-600 border-green-200 shadow-inner' : 'bg-green-600/20 text-green-400 border-green-500/30 shadow-inner')
                                : (isLightApp ? 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm border-slate-200' : 'bg-slate-800/40 hover:bg-slate-700/60 text-slate-200 border-slate-700/50'))
                    }, copied ? 'COPIED!' : 'SHARE'),
                    createElement('button', { key: 'export-btn', onClick: () => onSetExportModal(dev), className: primaryActionButtonClass }, 'EXPORT')
                ]),
                renderLayerBar()
            ] : [
                renderLayerBar(),
                createElement('div', { key: 'action-band', className: 'flex flex-wrap items-center gap-2 lg:ml-auto lg:justify-end' }, [
                    createElement('label', { key: 'layout-lbl', className: neutralActionButtonClass + ' cursor-pointer' }, [
                        'LAYOUT',
                        createElement('input', { key: 'layout-file', type: 'file', className: 'hidden', onChange: (e) => onFileHandle(e, dev.id, 'layout') })
                    ]),
                    createElement('button', {
                        key: 'map-btn',
                        onClick: () => onOpenMappingSource(dev.id),
                        className: neutralActionButtonClass
                    }, 'MAPPING'),
                    createElement('button', { key: 'macro-btn', onClick: () => onSetMacroModal({ deviceId: dev.id, macroId: null }), className: neutralActionButtonClass }, 'MACROS'),
                    createElement('button', { 
                        key: 'share-btn', 
                        onClick: handleShare, 
                        disabled: !hasData,
                        className: actionButtonClass + ' ' +
                            (!hasData ? 'opacity-40 cursor-not-allowed border-dashed ' : '') +
                            (copied
                                ? (isLightApp ? 'bg-green-50 text-green-600 border-green-200 shadow-inner' : 'bg-green-600/20 text-green-400 border-green-500/30 shadow-inner')
                                : (isLightApp ? 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm border-slate-200' : 'bg-slate-800/40 hover:bg-slate-700/60 text-slate-200 border-slate-700/50'))
                    }, copied ? 'COPIED!' : 'SHARE'),
                    createElement('button', { key: 'export-btn', onClick: () => onSetExportModal(dev), className: primaryActionButtonClass }, 'EXPORT')
                ])
            ])
        ]),

        dev.design ? createElement('div', {
            key: 'kbd-area',
            className: 'flex min-w-0 flex-col gap-4 ' + (dev.showSettings && !isGridLayout ? 'lg:flex-row lg:items-start' : '')
        }, [
            dev.showSettings && !isGridLayout ? createElement('aside', {
                key: 'settings-drawer',
                className: 'order-1 flex w-full min-w-0 flex-col gap-4 overflow-y-auto overflow-x-hidden rounded-2xl border p-4 shadow-2xl ring-1 animate-in fade-in slide-in-from-right-2 lg:order-2 lg:sticky lg:top-6 lg:max-h-[70vh] lg:min-w-[30rem] ' + (isLightApp ? 'bg-white border-slate-200 ring-slate-200/80' : 'bg-slate-950 border-slate-700 ring-slate-700/80'),
                style: { width: 'min(100%, 32rem)' }
            }, settingsPanel) : null,
            createElement('div', {
                key: 'kbd-wrap',
                className: 'order-2 min-w-0 flex-1 overflow-hidden lg:order-1'
            },
                createElement('div', { className: 'w-full flex justify-center overflow-hidden' }, 
                createElement(Keyboard, { 
                    design: dev.design, 
                    layer: dev.layer, 
                    externalMap: dev.keymapJson, 
                    displayMode: dev.displayMode,
                    theme: dev.theme || 'System',
                    appTheme: appTheme,
                    macroAliases: dev.macroAliases || {},
                    onMacroClick: (macroId) => onSetMacroModal({ deviceId: dev.id, macroId }),
                    keyStyle: dev.keyStyle || 'Windows',
                    userScale: currentDisplayScale,
                    separation: dev.separation || 'DISABLE',
                    encoderStyles: dev.encoderStyles || {},
                    inputDeviceSettings: dev.inputDeviceSettings || {},
                    layoutOptions: dev.layoutOptions || {},
                    onScaleMetricsChange
                })
            )),
            dev.showSettings && isGridLayout ? createElement('div', {
                key: 'settings-grid-panel',
                className: 'order-3 flex w-full min-w-0 flex-col gap-4 overflow-x-hidden rounded-2xl border p-4 shadow-2xl ring-1 animate-in fade-in slide-in-from-top-2 ' + (isLightApp ? 'bg-white border-slate-200 ring-slate-200/80' : 'bg-slate-950 border-slate-700 ring-slate-700/80')
            }, settingsPanel) : null
        ]) : createElement('div', { key: 'empty-area', className: 'py-20 text-center opacity-20' }, [
            createElement('div', { key: 'icon', className: 'text-6xl mb-4' }, '⌨️'),
            createElement('p', { key: 'text', className: 'text-[10px] font-black uppercase tracking-widest' }, 'Waiting for Data')
        ])
    ]);
}
