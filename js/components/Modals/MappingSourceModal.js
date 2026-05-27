const { createElement } = React;

export function MappingSourceModal({
    isLightApp,
    slotLabel,
    isDeviceLoading,
    errorMessage,
    canChooseDefinition,
    pendingDeviceInfo,
    onChooseFile,
    onChooseDevice,
    onChooseDefinition,
    onClose
}) {
    const panelClass = (isLightApp ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700');
    const mutedTextClass = isLightApp ? 'text-slate-500' : 'text-slate-400';
    const titleClass = isLightApp ? 'text-slate-900' : 'text-white';
    const secondaryButtonClass = (isLightApp
        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
        : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700') + ' w-full rounded-xl border px-4 py-4 text-left transition-all';
    const primaryButtonClass = 'w-full rounded-xl border border-blue-500/40 bg-blue-600 px-4 py-4 text-left text-white transition-all hover:bg-blue-500';

    return createElement('div', {
        className: 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm',
        onClick: () => !isDeviceLoading && onClose()
    }, [
        createElement('div', {
            key: 'mapping-source-content',
            className: panelClass + ' mx-4 flex w-full max-w-lg flex-col rounded-2xl border shadow-2xl',
            onClick: (event) => event.stopPropagation()
        }, [
            createElement('div', {
                key: 'header',
                className: 'flex items-center justify-between border-b px-6 py-4 ' + (isLightApp ? 'border-slate-200' : 'border-slate-800')
            }, [
                createElement('div', { key: 'titles', className: 'min-w-0' }, [
                    createElement('h3', {
                        key: 'title',
                        className: titleClass + ' text-lg font-black uppercase tracking-wide'
                    }, 'Mapping Source'),
                    createElement('p', {
                        key: 'subtitle',
                        className: mutedTextClass + ' mt-1 text-xs font-bold uppercase tracking-widest'
                    }, `${slotLabel} を置き換えます`)
                ]),
                createElement('button', {
                    key: 'close',
                    onClick: onClose,
                    disabled: isDeviceLoading,
                    className: 'text-xl font-bold text-slate-500 transition-colors hover:text-blue-500 disabled:cursor-not-allowed disabled:opacity-40'
                }, '✕')
            ]),
            createElement('div', { key: 'body', className: 'flex flex-col gap-4 px-6 py-6' }, [
                createElement('button', {
                    key: 'file-option',
                    onClick: onChooseFile,
                    disabled: isDeviceLoading,
                    className: secondaryButtonClass + ' disabled:cursor-not-allowed disabled:opacity-50'
                }, [
                    createElement('div', {
                        key: 'file-label',
                        className: 'text-[11px] font-black uppercase tracking-[0.2em] text-blue-500'
                    }, 'JSON'),
                    createElement('div', {
                        key: 'file-title',
                        className: 'mt-1 text-sm font-black uppercase tracking-wide'
                    }, 'JSONファイルを読み込む'),
                    createElement('p', {
                        key: 'file-desc',
                        className: mutedTextClass + ' mt-2 text-xs leading-relaxed'
                    }, '既存どおり、QMK/VIA 形式のマッピング JSON を選択してこのスロットへ反映します。')
                ]),
                createElement('button', {
                    key: 'device-option',
                    onClick: onChooseDevice,
                    disabled: isDeviceLoading,
                    className: primaryButtonClass + ' disabled:cursor-not-allowed disabled:opacity-60'
                }, [
                    createElement('div', {
                        key: 'device-label',
                        className: 'text-[11px] font-black uppercase tracking-[0.2em] text-blue-100'
                    }, 'WebHID'),
                    createElement('div', {
                        key: 'device-title',
                        className: 'mt-1 text-sm font-black uppercase tracking-wide'
                    }, isDeviceLoading ? '接続デバイスを読み込み中...' : '接続デバイスから取得する'),
                    createElement('p', {
                        key: 'device-desc',
                        className: 'mt-2 text-xs leading-relaxed text-blue-100/90'
                    }, 'ブラウザのデバイス選択ダイアログから 1 台選び、このスロットの現在マッピングを読み込みます。定義が未知の場合は続けて定義JSONを指定できます。')
                ]),
                canChooseDefinition ? createElement('button', {
                    key: 'definition-option',
                    onClick: onChooseDefinition,
                    disabled: isDeviceLoading,
                    className: secondaryButtonClass + ' disabled:cursor-not-allowed disabled:opacity-50'
                }, [
                    createElement('div', {
                        key: 'definition-label',
                        className: 'text-[11px] font-black uppercase tracking-[0.2em] text-blue-500'
                    }, 'Definition'),
                    createElement('div', {
                        key: 'definition-title',
                        className: 'mt-1 text-sm font-black uppercase tracking-wide'
                    }, '定義JSONを選択して続行'),
                    createElement('p', {
                        key: 'definition-desc',
                        className: mutedTextClass + ' mt-2 text-xs leading-relaxed'
                    }, pendingDeviceInfo
                        ? `${pendingDeviceInfo.productName || 'Connected Device'} / ${pendingDeviceInfo.vendorId?.toString(16).toUpperCase().padStart(4, '0')} / ${pendingDeviceInfo.productId?.toString(16).toUpperCase().padStart(4, '0')} に対応する VIA 定義 JSON を選択します。`
                        : '接続済みデバイスに対応する VIA 定義 JSON を選択して、このまま読み込みを続行します。')
                ]) : null,
                errorMessage ? createElement('div', {
                    key: 'error',
                    className: (isLightApp
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-red-500/30 bg-red-500/10 text-red-200') + ' rounded-xl border px-4 py-3 text-sm leading-relaxed'
                }, errorMessage) : null
            ])
        ])
    ]);
}
