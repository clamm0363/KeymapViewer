const { createElement } = React;

export function LinksModal({ isLightApp, onClose }) {
    const titleColor = isLightApp ? 'text-slate-900' : 'text-white';
    const descColor = isLightApp ? 'text-slate-600' : 'text-slate-300';
    const itemTitleClass = 'font-bold ' + (isLightApp ? 'text-slate-900' : 'text-slate-100');

    const links = [
        {
            name: 'VIA (caniusevia.com)',
            url: 'https://caniusevia.com/',
            favicon: 'https://www.google.com/s2/favicons?sz=64&domain=caniusevia.com'
        },
        {
            name: 'Remap (remap-keys.app)',
            url: 'https://remap-keys.app/',
            favicon: 'https://www.google.com/s2/favicons?sz=64&domain=remap-keys.app'
        },
        {
            name: 'Vial (get.vial.today)',
            url: 'https://get.vial.today/',
            favicon: 'https://www.google.com/s2/favicons?sz=64&domain=vial.rocks'
        }
    ];

    return createElement('div', { 
        key: 'links-modal', 
        className: 'fixed inset-0 z-[100] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-28 md:pt-32 overflow-y-auto', 
        onClick: onClose 
    }, [
        createElement('div', { 
            key: 'links-content', 
            className: (isLightApp ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700') + ' border rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200', 
            onClick: (e) => e.stopPropagation() 
        }, [
            // Header
            createElement('div', { 
                key: 'links-header', 
                className: (isLightApp ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800') + ' border-b px-6 py-4 flex justify-between items-center z-10' 
            }, [
                createElement('h3', { 
                    key: 'h3', 
                    className: titleColor + ' text-sm font-black uppercase tracking-widest' 
                }, 'Configurator Links'),
                // Close button (X icon)
                createElement('button', { 
                    key: 'close', 
                    onClick: onClose, 
                    className: 'text-slate-500 hover:text-red-500 transition-colors text-xl font-bold p-1 leading-none',
                    title: '閉じる'
                }, '✕')
            ]),
            // Body
            createElement('div', { 
                key: 'links-body', 
                className: 'p-6 space-y-4' 
            }, [
                links.map((link, idx) => 
                    createElement('a', {
                        key: idx,
                        href: link.url,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        className: (isLightApp 
                            ? 'bg-slate-50 hover:bg-blue-50/50 border-slate-200 hover:border-blue-300 text-slate-700 shadow-sm' 
                            : 'bg-slate-800/40 hover:bg-blue-950/20 border-slate-800 hover:border-blue-900/60 text-slate-200') + 
                            ' flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group hover:scale-[1.01] hover:shadow-md'
                    }, [
                        // Favicon Container
                        createElement('div', {
                            key: 'favicon-wrap',
                            className: (isLightApp ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700') + ' w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm p-1.5 shrink-0 group-hover:scale-105 transition-transform duration-200'
                        }, [
                            createElement('img', {
                                key: 'favicon-img',
                                src: link.favicon,
                                alt: link.name,
                                className: 'w-full h-full object-contain rounded-md',
                                onError: (e) => {
                                    e.target.style.display = 'none';
                                }
                            })
                        ]),
                        createElement('div', { key: 'text-grp', className: 'flex-1 min-w-0' }, [
                            createElement('div', { 
                                key: 'name', 
                                className: 'font-black text-xs uppercase tracking-wider text-blue-500 flex items-center gap-1.5' 
                            }, [
                                link.name,
                                createElement('svg', { 
                                    key: 'ext-icon', 
                                    width: 12, 
                                    height: 12, 
                                    viewBox: '0 0 24 24', 
                                    fill: 'none', 
                                    stroke: 'currentColor', 
                                    strokeWidth: 2.5, 
                                    className: 'opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' 
                                }, [
                                    createElement('path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }),
                                    createElement('polyline', { points: '15 3 21 3 21 9' }),
                                    createElement('line', { x1: 10, y1: 14, x2: 21, y2: 3 })
                                ])
                            ])
                        ])
                    ])
                )
            ])
        ])
    ]);
}
