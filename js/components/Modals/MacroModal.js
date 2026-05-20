const { createElement } = React;

export function MacroModal({ isLightApp, device, macroModalState, onClose, onUpdateDevice }) {
    if (!device) return null;
    const [copiedId, setCopiedId] = React.useState(null);
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
                                onKeyDown: (e) => {
                                    if (e.key === 'Enter') {
                                        onClose();
                                    }
                                },
                                className: 'bg-transparent border-b border-slate-700 outline-none text-sm font-bold w-full', 
                                placeholder: 'Alias...' 
                            }),
                            createElement('div', { key: 'content-container', className: 'flex items-center justify-between gap-3 min-w-0' }, [
                                createElement('div', { 
                                    key: 'content', 
                                    className: 'text-[11px] text-slate-500 break-all whitespace-pre-wrap leading-relaxed flex-1',
                                    style: { fontFamily: "'Outfit', sans-serif" },
                                    title: m.content 
                                }, m.content || 'Empty'),
                                m.content ? createElement('button', {
                                    key: 'copy',
                                    onClick: () => {
                                        navigator.clipboard.writeText(m.content)
                                            .then(() => {
                                                setCopiedId(m.id);
                                                setTimeout(() => setCopiedId(null), 1500);
                                            })
                                            .catch(err => console.error('Failed to copy macro content:', err));
                                    },
                                    className: 'p-1.5 rounded-lg border transition-all flex-shrink-0 flex items-center justify-center ' + 
                                               (copiedId === m.id 
                                                   ? (isLightApp ? 'bg-green-50 border-green-200 text-green-600' : 'bg-green-500/10 border-green-500/30 text-green-400')
                                                   : (isLightApp 
                                                       ? 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 border-slate-200 hover:border-blue-300' 
                                                       : 'text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 border-slate-800 hover:border-blue-500/30')),
                                    title: 'Copy Macro'
                                }, [
                                    copiedId === m.id 
                                        ? createElement('svg', {
                                            key: 'check-icon',
                                            width: '14',
                                            height: '14',
                                            viewBox: '0 0 24 24',
                                            fill: 'none',
                                            stroke: 'currentColor',
                                            strokeWidth: '2.5',
                                            strokeLinecap: 'round',
                                            strokeLinejoin: 'round',
                                            className: 'animate-pulse'
                                        }, [
                                            createElement('polyline', { points: '20 6 9 17 4 12' })
                                        ])
                                        : createElement('svg', {
                                            key: 'copy-icon',
                                            width: '14',
                                            height: '14',
                                            viewBox: '0 0 24 24',
                                            fill: 'none',
                                            stroke: 'currentColor',
                                            strokeWidth: '2',
                                            strokeLinecap: 'round',
                                            strokeLinejoin: 'round'
                                        }, [
                                            createElement('rect', { x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' }),
                                            createElement('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' })
                                        ])
                                ]) : null
                            ])
                        ])) :
                        createElement('p', { 
                            className: 'text-center py-12 ' + (isLightApp ? 'text-slate-500' : 'text-slate-400') + ' text-xs font-bold uppercase tracking-widest leading-relaxed px-6' 
                        }, 'マクロが登録されていません。MAPPINGファイルを先に読み込んでください。')

            ])
        ])
    ]);
}
