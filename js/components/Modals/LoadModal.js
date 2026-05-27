const { createElement } = React;

function buildButtonClass(isLightApp, tone = 'secondary') {
    if (tone === 'primary') {
        return 'w-full rounded-xl border border-blue-500/40 bg-blue-600 px-4 py-4 text-left text-white transition-all hover:bg-blue-500';
    }

    return (isLightApp
        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
        : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700') + ' w-full rounded-xl border px-4 py-4 text-left transition-all';
}

export function LoadModal({
    isLightApp,
    slotLabel,
    step,
    isBusy,
    errorMessage,
    pendingDeviceInfo,
    onChooseFileFlow,
    onChooseDeviceFlow,
    onChooseMappingFile,
    onSkipMapping,
    onChooseLayoutForDevice,
    onClose
}) {
    const panelClass = (isLightApp ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700');
    const mutedTextClass = isLightApp ? 'text-slate-500' : 'text-slate-400';
    const titleClass = isLightApp ? 'text-slate-900' : 'text-white';
    const secondaryButtonClass = buildButtonClass(isLightApp, 'secondary');
    const primaryButtonClass = buildButtonClass(isLightApp, 'primary');
    const closeDisabled = isBusy && step === 'device';

    const titleMap = {
        root: 'Load',
        'post-layout': 'Layout Loaded',
        device: 'Device Load'
    };

    const subtitleMap = {
        root: `${slotLabel} に読み込みます`,
        'post-layout': `${slotLabel} の LAYOUT を更新しました`,
        device: `${slotLabel} へ現在の MAPPING を反映します`
    };

    return createElement('div', {
        className: 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm',
        onClick: () => !closeDisabled && onClose()
    }, [
        createElement('div', {
            key: 'load-modal-content',
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
                    }, titleMap[step] || 'Load'),
                    createElement('p', {
                        key: 'subtitle',
                        className: mutedTextClass + ' mt-1 text-xs font-bold uppercase tracking-widest'
                    }, subtitleMap[step] || slotLabel)
                ]),
                createElement('button', {
                    key: 'close',
                    onClick: onClose,
                    disabled: closeDisabled,
                    className: 'text-xl font-bold text-slate-500 transition-colors hover:text-blue-500 disabled:cursor-not-allowed disabled:opacity-40'
                }, '✕')
            ]),
            createElement('div', { key: 'body', className: 'flex flex-col gap-4 px-6 py-6' }, [
                step === 'root' ? createElement(React.Fragment, { key: 'root-options' }, [
                    createElement('button', {
                        key: 'file-option',
                        onClick: onChooseFileFlow,
                        disabled: isBusy,
                        className: secondaryButtonClass + ' disabled:cursor-not-allowed disabled:opacity-50'
                    }, [
                        createElement('div', {
                            key: 'file-label',
                            className: 'text-[11px] font-black uppercase tracking-[0.2em] text-blue-500'
                        }, 'FILE'),
                        createElement('div', {
                            key: 'file-title',
                            className: 'mt-1 text-sm font-black uppercase tracking-wide'
                        }, 'ファイルから読み込む'),
                        createElement('p', {
                            key: 'file-desc',
                            className: mutedTextClass + ' mt-2 text-xs leading-relaxed'
                        }, 'まず LAYOUT 用 JSON を読み込み、必要なら続けて MAPPING 用 JSON を追加します。')
                    ]),
                    createElement('button', {
                        key: 'device-option',
                        onClick: onChooseDeviceFlow,
                        disabled: isBusy,
                        className: primaryButtonClass + ' disabled:cursor-not-allowed disabled:opacity-60'
                    }, [
                        createElement('div', {
                            key: 'device-label',
                            className: 'text-[11px] font-black uppercase tracking-[0.2em] text-blue-100'
                        }, 'WebHID'),
                        createElement('div', {
                            key: 'device-title',
                            className: 'mt-1 text-sm font-black uppercase tracking-wide'
                        }, isBusy ? '接続デバイスを読み込み中...' : 'デバイスに接続して現在の情報を読む'),
                        createElement('p', {
                            key: 'device-desc',
                            className: 'mt-2 text-xs leading-relaxed text-blue-100/90'
                        }, '初回接続では LAYOUT 用 JSON が必要になる場合があります。過去に同じブラウザで成功していれば接続だけで復元できます。')
                    ])
                ]) : null,
                step === 'post-layout' ? createElement(React.Fragment, { key: 'post-layout-options' }, [
                    createElement('div', {
                        key: 'post-layout-note',
                        className: mutedTextClass + ' rounded-xl border px-4 py-3 text-sm leading-relaxed ' + (isLightApp ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-950/40')
                    }, '続けて MAPPING 用 JSON を読み込むと、キー割り当てまで反映できます。後で読み込む場合は LAYOUT だけ表示したまま作業を続けられます。'),
                    createElement('button', {
                        key: 'mapping-option',
                        onClick: onChooseMappingFile,
                        disabled: isBusy,
                        className: primaryButtonClass + ' disabled:cursor-not-allowed disabled:opacity-60'
                    }, [
                        createElement('div', {
                            key: 'mapping-label',
                            className: 'text-[11px] font-black uppercase tracking-[0.2em] text-blue-100'
                        }, 'MAPPING'),
                        createElement('div', {
                            key: 'mapping-title',
                            className: 'mt-1 text-sm font-black uppercase tracking-wide'
                        }, '読み込む')
                    ]),
                    createElement('button', {
                        key: 'skip-option',
                        onClick: onSkipMapping,
                        disabled: isBusy,
                        className: secondaryButtonClass + ' disabled:cursor-not-allowed disabled:opacity-50'
                    }, [
                        createElement('div', {
                            key: 'skip-label',
                            className: 'text-[11px] font-black uppercase tracking-[0.2em] text-blue-500'
                        }, 'LATER'),
                        createElement('div', {
                            key: 'skip-title',
                            className: 'mt-1 text-sm font-black uppercase tracking-wide'
                        }, '後で')
                    ])
                ]) : null,
                step === 'device' ? createElement(React.Fragment, { key: 'device-options' }, [
                    createElement('div', {
                        key: 'device-note',
                        className: mutedTextClass + ' rounded-xl border px-4 py-3 text-sm leading-relaxed ' + (isLightApp ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-950/40')
                    }, pendingDeviceInfo
                        ? `${pendingDeviceInfo.productName || 'Connected Device'} の LAYOUT をまだ解決できていません。LAYOUT 用 JSON を与えると、このまま現在の MAPPING 読み込みを続行できます。`
                        : 'LAYOUT を解決したあとで、接続デバイスから現在の MAPPING を読み込みます。'),
                    createElement('button', {
                        key: 'layout-option',
                        onClick: onChooseLayoutForDevice,
                        disabled: isBusy,
                        className: secondaryButtonClass + ' disabled:cursor-not-allowed disabled:opacity-50'
                    }, [
                        createElement('div', {
                            key: 'layout-label',
                            className: 'text-[11px] font-black uppercase tracking-[0.2em] text-blue-500'
                        }, 'LAYOUT'),
                        createElement('div', {
                            key: 'layout-title',
                            className: 'mt-1 text-sm font-black uppercase tracking-wide'
                        }, 'LAYOUT 用 JSON を読み込む')
                    ])
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
