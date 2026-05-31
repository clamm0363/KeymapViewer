const { createElement, useState } = React;

export function KeyAnnotationModal({
  isLightApp,
  matrixKey,
  currentAnnotation, // null or { customText, description, iconKey }
  onSave,            // ({ customText, description, iconKey }) => void
  onClear,           // () => void
  onClose,           // () => void
}) {
  const [customText, setCustomText] = useState(currentAnnotation?.customText || '');
  const [description, setDescription] = useState(currentAnnotation?.description || '');
  const [iconKey] = useState(currentAnnotation?.iconKey || '');

  const bgClass = isLightApp ? 'bg-slate-50 text-slate-800' : 'bg-slate-900 text-slate-100';
  const borderClass = isLightApp ? 'border-slate-200' : 'border-slate-800';
  const labelClass = 'text-[9px] font-black uppercase tracking-wider opacity-60 mb-1 block';
  
  const inputBgClass = isLightApp ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100';
  const inputFocusClass = 'focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all';

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    onSave({
      customText: customText.trim(),
      description: description.trim(),
      iconKey,
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
              `Key Annotation (${matrixKey})`
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

          // Field: Icon selection (Future Expansion)
          createElement('div', { key: 'field-icon' }, [
            createElement('label', { className: labelClass, style: { fontFamily: "'Outfit', sans-serif" } }, 'SVG Icon'),
            createElement(
              'div',
              {
                className: `px-4 py-3 rounded-xl border ${inputBgClass} text-xs font-semibold opacity-50 select-none bg-opacity-70 border-dashed`,
              },
              '🎨 SVG Icon Selector (Future Update / 将来実装予定)'
            ),
          ]),

          // Actions
          createElement('div', { key: 'modal-actions', className: 'flex gap-3 justify-end mt-2' }, [
            // Delete Annotation Button (Visible only if currentAnnotation exists)
            currentAnnotation &&
              createElement(
                'button',
                {
                  key: 'btn-clear',
                  type: 'button',
                  onClick: onClear,
                  className: 'mr-auto py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-2xs font-black uppercase tracking-widest transition-all',
                  style: { fontFamily: "'Outfit', sans-serif" },
                },
                'Clear / 削除'
              ),

            // Cancel Button
            createElement(
              'button',
              {
                key: 'btn-cancel',
                type: 'button',
                onClick: onClose,
                className: 'py-2.5 px-4 opacity-70 hover:opacity-100 text-xs font-bold transition-all',
              },
              'Cancel'
            ),

            // Save Button
            createElement(
              'button',
              {
                key: 'btn-save',
                type: 'submit',
                className: 'py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-2xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20',
                style: { fontFamily: "'Outfit', sans-serif" },
              },
              'Save / 保存'
            ),
          ]),
        ]
      ),
    ]
  );
}
