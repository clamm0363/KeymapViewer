const { createElement } = React;

export function MacroModal({ isLightApp, device, macroModalState, onClose, onUpdateDevice }) {
    if (!device) return null;
    const allMacros = (device.keymapJson && device.keymapJson.macros) || [];
    const specificMacroId = macroModalState.macroId;
    const macrosToShow = specificMacroId !== null && specificMacroId !== undefined
        ? [{ id: specificMacroId, content: allMacros[specificMacroId] }]
        : allMacros.map((content, id) => ({ id, content }));

    return createElement('div', { key: 'macro-modal', className: 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm', onClick: onClose }, [
        createElement('div', { key: 'macro-content', className: (isLightApp ? 'bg-white' : 'bg-slate-900') + ' border ' + (isLightApp ? 'border-slate-200' : 'border-slate-700') + ' rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col', onClick: (e) => e.stopPropagation() }, [
            createElement('div', { key: 'macro-header', className: (isLightApp ? 'bg-slate-50' : 'bg-slate-900') + ' sticky top-0 border-b ' + (isLightApp ? 'border-slate-200' : 'border-slate-800') + ' px-6 py-4 flex justify-between items-center rounded-t-2xl z-10' }, [
                createElement('h3', { key: 'h3', className: (isLightApp ? 'text-slate-900' : 'text-white') + ' text-lg font-black uppercase tracking-wide' }, 'Macro Aliases'),
                createElement('button', { key: 'close', onClick: onClose, className: 'text-slate-500 hover:text-blue-500 transition-colors text-xl font-bold' }, '✕')
            ]),
            createElement('div', { key: 'macro-body', className: 'px-6 py-5 overflow-y-auto' }, [
                    macrosToShow.length > 0 ? 
                        macrosToShow.map(m => createElement('div', { key: m.id, className: (isLightApp ? 'bg-slate-50' : 'bg-slate-950/50') + ' grid grid-cols-[80px_1fr_2fr] gap-4 items-center p-3 rounded-xl border ' + (isLightApp ? 'border-slate-200' : 'border-slate-800/50') }, [
                            createElement('div', { key: 'id', className: 'text-xs font-black text-blue-500' }, 'M(' + m.id + ')'),
                            createElement('input', { 
                                key: 'input', 
                                type: 'text', 
                                value: (device.macroAliases && device.macroAliases[m.id]) || '', 
                                onInput: (e) => onUpdateDevice(device.id, { macroAliases: { ...(device.macroAliases || {}), [m.id]: e.target.value } }), 
                                className: 'bg-transparent border-b border-slate-700 outline-none text-sm font-bold w-full', 
                                placeholder: 'Alias...' 
                            }),
                            createElement('div', { key: 'content', className: 'text-[10px] text-slate-500 font-mono truncate', title: m.content }, m.content || 'Empty')
                        ])) :
                        createElement('p', { 
                            className: 'text-center py-12 ' + (isLightApp ? 'text-slate-500' : 'text-slate-400') + ' text-xs font-bold uppercase tracking-widest leading-relaxed px-6' 
                        }, 'マクロが登録されていません。MAPPINGファイルを先に読み込んでください。')

            ])
        ])
    ]);
}
