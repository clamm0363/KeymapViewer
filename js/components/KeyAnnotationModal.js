const { createElement, useState } = React;

import { createSVGElement, listUniqueSVGIcons } from '../svg-icons.js';

const SVG_ICON_OPTIONS = listUniqueSVGIcons()
  .filter((icon) => icon.hasSVG)
  .sort((a, b) => {
    const categoryCompare = String(a.category || '').localeCompare(String(b.category || ''));
    if (categoryCompare !== 0) return categoryCompare;
    return a.key.localeCompare(b.key);
  });
const SVG_ICON_CATEGORIES = [
  'ALL',
  ...new Set(
    SVG_ICON_OPTIONS.map((icon) => icon.category).filter(Boolean)
  ),
];

function renderIconPreview(iconKey, color) {
  const svgEl = createSVGElement(iconKey, { size: 18, color });
  if (!svgEl) return null;

  return createElement('div', {
    style: {
      width: '18px',
      height: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto',
    },
    dangerouslySetInnerHTML: { __html: svgEl.outerHTML },
  });
}

export function KeyAnnotationModal({
  isLightApp,
  matrixKey,
  layer = 0,
  isEncoder = false,
  currentAnnotation, // null or { customText, description, iconKey }
  macroId = null,
  macroAlias = '',
  macroContent = '',
  onSave,            // ({ customText, description, iconKey }) => void
  onClear,           // () => void
  onClose,           // () => void
}) {
  const [customText, setCustomText] = useState(currentAnnotation?.customText || '');
  const [description, setDescription] = useState(currentAnnotation?.description || '');
  const [iconKey, setIconKey] = useState(currentAnnotation?.iconKey || '');
  const [alias, setAlias] = useState(macroAlias || '');
  const [activeIconCategory, setActiveIconCategory] = useState('ALL');
  const hasMacro = macroId !== null && macroId !== undefined;

  const bgClass = isLightApp ? 'bg-slate-50 text-slate-800' : 'bg-slate-900 text-slate-100';
  const borderClass = isLightApp ? 'border-slate-200' : 'border-slate-800';
  const labelClass = 'text-[9px] font-black uppercase tracking-wider opacity-60 mb-1 block';
  const mutedTextClass = isLightApp ? 'text-slate-500' : 'text-slate-400';
  const inputBgClass =
    isLightApp ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100';
  const inputFocusClass = 'focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all';
  const iconPreviewColor = isLightApp ? '#1e293b' : '#f8fafc';
  const visibleIconOptions =
    activeIconCategory === 'ALL'
      ? SVG_ICON_OPTIONS
      : SVG_ICON_OPTIONS.filter((icon) => icon.category === activeIconCategory);

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    onSave({
      customText: customText.trim(),
      description: description.trim(),
      iconKey,
      macroAlias: alias.trim(),
    });
  };

  return createElement(
    'div',
    {
      key: 'annotation-modal',
      className:
        'fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md transition-opacity duration-300',
      onClick: onClose,
    },
    [
      createElement(
        'form',
        {
          key: 'modal-form',
          className: `${bgClass} border ${borderClass} rounded-3xl shadow-2xl max-w-md w-full mx-4 p-7 flex flex-col gap-6 font-sans`,
          onClick: (e) => e.stopPropagation(),
          onSubmit: handleSaveSubmit,
        },
        [
          // Header
          createElement('div', { key: 'modal-header', className: 'flex justify-between items-center' }, [
            createElement(
              'h3',
              {
                className: 'text-sm font-black uppercase tracking-widest text-blue-500',
                style: { fontFamily: "'Outfit', sans-serif" },
              },
              `Key Editor (L${layer} / ${matrixKey})`
            ),
            createElement(
              'button',
              {
                type: 'button',
                onClick: onClose,
                className: 'text-xs opacity-50 hover:opacity-100 transition-opacity',
              },
              '✕'
            ),
          ]),

          // Input field: Custom Text
          createElement('div', { key: 'field-custom-text' }, [
            createElement('label', { className: labelClass, style: { fontFamily: "'Outfit', sans-serif" } }, 'Custom Text (📌 Displayed at top)'),
            createElement('input', {
              type: 'text',
              value: customText,
              onChange: (e) => setCustomText(e.target.value),
              placeholder: 'e.g. Figma: Design Mode',
              className: `w-full px-4 py-3 rounded-xl border ${inputBgClass} ${inputFocusClass} text-xs font-semibold`,
              maxLength: 60,
              autoFocus: true,
            }),
          ]),

          // Input field: Description
          createElement('div', { key: 'field-description' }, [
            createElement('label', { className: labelClass, style: { fontFamily: "'Outfit', sans-serif" } }, 'Detailed Description'),
            createElement('textarea', {
              value: description,
              onChange: (e) => setDescription(e.target.value),
              placeholder: 'e.g. Switch to Design mode in Figma',
              className: `w-full px-4 py-3 rounded-xl border ${inputBgClass} ${inputFocusClass} text-xs font-semibold h-20 resize-none`,
              maxLength: 200,
            }),
          ]),

          hasMacro &&
            createElement('div', { key: 'field-macro', className: 'flex flex-col gap-3' }, [
              createElement(
                'div',
                {
                  key: 'macro-card',
                  className:
                    'rounded-2xl border px-4 py-3 ' +
                    (isLightApp ? 'bg-blue-50/70 border-blue-100' : 'bg-slate-950 border-slate-800'),
                },
                [
                  createElement(
                    'div',
                    {
                      key: 'macro-heading',
                      className: 'text-[10px] font-black uppercase tracking-widest text-blue-500',
                      style: { fontFamily: "'Outfit', sans-serif" },
                    },
                    `Macro M(${macroId})`
                  ),
                  createElement(
                    'div',
                    {
                      key: 'macro-content',
                      className:
                        'mt-1 text-[11px] leading-relaxed break-all whitespace-pre-wrap ' +
                        (isLightApp ? 'text-slate-600' : 'text-slate-400'),
                    },
                    macroContent || 'Empty'
                  ),
                ]
              ),
              createElement('div', { key: 'macro-alias-wrap' }, [
                createElement(
                  'label',
                  { className: labelClass, style: { fontFamily: "'Outfit', sans-serif" } },
                  'Macro Alias'
                ),
                createElement('input', {
                  type: 'text',
                  value: alias,
                  onChange: (e) => setAlias(e.target.value),
                  placeholder: 'e.g. TASK VIEW',
                  className: `w-full px-4 py-3 rounded-xl border ${inputBgClass} ${inputFocusClass} text-xs font-semibold`,
                  maxLength: 60,
                }),
              ]),
            ]),

          !isEncoder &&
            createElement('div', { key: 'field-icon' }, [
              createElement('label', { className: labelClass, style: { fontFamily: "'Outfit', sans-serif" } }, 'SVG Icon'),
              createElement(
                'div',
                {
                  className: `rounded-2xl border ${inputBgClass} px-4 py-4`,
                },
                [
                  createElement(
                    'div',
                    {
                      key: 'icon-toolbar',
                      className: 'mb-3 flex items-center justify-between gap-3',
                    },
                    [
                      createElement(
                        'div',
                        { key: 'icon-current', className: 'min-w-0' },
                        [
                          createElement(
                            'div',
                            {
                              key: 'icon-current-label',
                              className: `text-[10px] font-black uppercase tracking-[0.18em] ${mutedTextClass}`,
                              style: { fontFamily: "'Outfit', sans-serif" },
                            },
                            'Current Override'
                          ),
                          createElement(
                            'div',
                            {
                              key: 'icon-current-value',
                              className: 'mt-1 flex items-center gap-2 text-[11px] font-semibold',
                            },
                            iconKey
                              ? [
                                  renderIconPreview(iconKey, iconPreviewColor),
                                  createElement(
                                    'span',
                                    {
                                      key: 'icon-current-key',
                                      className: 'min-w-0 truncate',
                                    },
                                    iconKey
                                  ),
                                ]
                              : createElement(
                                  'span',
                                  {
                                    className: mutedTextClass,
                                  },
                                  'Use current key display'
                                )
                          ),
                        ]
                      ),
                      createElement(
                        'button',
                        {
                          key: 'icon-reset',
                          type: 'button',
                          onClick: () => setIconKey(''),
                          disabled: !iconKey,
                          className:
                            'rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all shadow-sm ' +
                            (iconKey
                              ? isLightApp
                                ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-400'
                                : 'border-amber-500/40 bg-amber-500/12 text-amber-200 hover:bg-amber-500/20 hover:border-amber-400/60'
                              : isLightApp
                                ? 'cursor-not-allowed border-slate-200 text-slate-300'
                                : 'cursor-not-allowed border-slate-800 text-slate-600'),
                          style: { fontFamily: "'Outfit', sans-serif" },
                        },
                        'RESET'
                      ),
                    ]
                  ),
                  createElement(
                    'div',
                    {
                      key: 'icon-category-tabs',
                      className: 'mb-3 flex flex-wrap gap-2',
                    },
                    SVG_ICON_CATEGORIES.map((category) => {
                      const isActive = category === activeIconCategory;
                      return createElement(
                        'button',
                        {
                          key: category,
                          type: 'button',
                          onClick: () => setActiveIconCategory(category),
                          className:
                            'rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] transition-all ' +
                            (isActive
                              ? isLightApp
                                ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm'
                                : 'border-blue-500 bg-blue-500/10 text-blue-200 shadow-sm'
                              : isLightApp
                                ? 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200'),
                          style: { fontFamily: "'Outfit', sans-serif" },
                        },
                        category
                      );
                    })
                  ),
                  createElement(
                    'div',
                    {
                      key: 'icon-grid',
                      className:
                        'grid max-h-64 grid-cols-4 gap-2 overflow-y-auto rounded-2xl border p-2 sm:grid-cols-5 ' +
                        (isLightApp ? 'border-slate-200 bg-white/70' : 'border-slate-800 bg-slate-950/60'),
                    },
                    visibleIconOptions.map((icon) => {
                      const isSelected = icon.key === iconKey || icon.aliases.includes(iconKey);
                      const iconTitle = icon.aliases.length
                        ? `${icon.key} (aliases: ${icon.aliases.join(', ')})`
                        : icon.key;
                      return createElement(
                        'button',
                        {
                          key: icon.key,
                          type: 'button',
                          onClick: () => setIconKey(icon.key),
                          title: iconTitle,
                          'aria-label': iconTitle,
                          className:
                            'relative flex aspect-square items-center justify-center rounded-xl border transition-all ' +
                            (isSelected
                              ? isLightApp
                                ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm'
                                : 'border-blue-500 bg-blue-500/10 text-blue-200 shadow-sm'
                              : isLightApp
                                ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                : 'border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700 hover:bg-slate-800'),
                        },
                        [
                          createElement(
                            'div',
                            {
                              key: `${icon.key}-preview-wrap`,
                              className: 'flex h-full w-full items-center justify-center p-3',
                            },
                            renderIconPreview(icon.key, isSelected ? '#2563eb' : iconPreviewColor)
                          ),
                          isSelected &&
                            createElement('div', {
                              key: `${icon.key}-selected-dot`,
                              className: 'absolute right-2 top-2 h-2 w-2 rounded-full bg-current opacity-80',
                            }),
                        ]
                      );
                    })
                  ),
                ]
              ),
            ]),

          // Actions
          createElement('div', { key: 'modal-actions', className: 'flex gap-3 mt-2' }, [
            // Delete Annotation Button (Visible only if currentAnnotation exists)
            currentAnnotation &&
              createElement(
                'button',
                {
                  key: 'btn-clear',
                  type: 'button',
                  onClick: onClear,
                  className:
                    'flex-1 py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-2xs font-black uppercase tracking-widest transition-all text-center',
                  style: { fontFamily: "'Outfit', sans-serif" },
                },
                'CLEAR'
              ),

            // Cancel Button
            createElement(
              'button',
              {
                key: 'btn-cancel',
                type: 'button',
                onClick: onClose,
                className:
                  'flex-1 py-2.5 px-4 rounded-xl border border-slate-300/60 bg-transparent opacity-70 hover:opacity-100 text-2xs font-black uppercase tracking-widest transition-all text-center',
                style: { fontFamily: "'Outfit', sans-serif" },
              },
              'CANCEL'
            ),

            // Save Button
            createElement(
              'button',
              {
                key: 'btn-save',
                type: 'submit',
                className:
                  'flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-2xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 text-center',
                style: { fontFamily: "'Outfit', sans-serif" },
              },
              'SAVE'
            ),
          ]),
        ]
      ),
    ]
  );
}
