const { createElement } = React;

export function HelpModal({ isLightApp, onClose }) {
    return createElement('div', { key: 'help-modal', className: 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm', onClick: onClose }, [
        createElement('div', { key: 'help-content', className: (isLightApp ? 'bg-white' : 'bg-slate-900') + ' border ' + (isLightApp ? 'border-slate-200' : 'border-slate-700') + ' rounded-2xl shadow-2xl max-w-xl w-full mx-4 max-h-[80vh] overflow-y-auto', onClick: (e) => e.stopPropagation() }, [
            createElement('div', { key: 'help-header', className: (isLightApp ? 'bg-slate-50' : 'bg-slate-900') + ' sticky top-0 border-b ' + (isLightApp ? 'border-slate-200' : 'border-slate-800') + ' px-6 py-4 flex justify-between items-center rounded-t-2xl' }, [
                createElement('h3', { key: 'h3', className: (isLightApp ? 'text-slate-900' : 'text-white') + ' text-lg font-black uppercase tracking-wide' }, '使い方ガイド'),
                createElement('button', { key: 'close', onClick: onClose, className: 'text-slate-500 hover:text-blue-500 transition-colors text-xl font-bold' }, '✕')
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
    ]);
}
