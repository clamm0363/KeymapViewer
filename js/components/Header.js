const { createElement } = React;

export function Header({ isLightApp, layoutMode, deviceCount, onShowHelp, onAddSlot, onSetLayoutMode, onSetAppTheme, appTheme }) {
    return createElement('header', { key: 'header', className: 'flex flex-col md:flex-row justify-between items-center mb-12 gap-6 w-full' }, [
        createElement('div', { key: 'logo', className: 'flex items-center gap-6', onClick: () => window.location.reload(), style: { cursor: 'pointer' } }, [
            createElement('div', { key: 'km-box', className: 'bg-blue-600 w-14 h-14 rounded-3xl flex items-center justify-center shadow-2xl font-black text-white text-2xl tracking-tighter' }, 'KM'),
            createElement('div', { key: 'title-box' }, [
                createElement('h1', { key: 'title', className: 'text-3xl font-black tracking-tighter ' + (isLightApp ? 'text-slate-900' : 'text-white') + ' uppercase italic leading-none' }, [
                    'Keymap ',
                    createElement('span', { key: 'viewer-span', className: 'text-blue-500 not-italic' }, 'Viewer')
                ]),
                createElement('p', { key: 'meta', className: 'text-[10px] ' + (isLightApp ? 'text-slate-400' : 'text-slate-500') + ' font-bold uppercase tracking-[0.3em] mt-2' }, [
                    'Mode: ',
                    createElement('span', { key: 'mode', className: 'text-blue-400' }, layoutMode.toUpperCase()),
                    ' | ',
                    createElement('span', { key: 'slots', className: isLightApp ? 'text-slate-900' : 'text-white' }, deviceCount),
                    ' Slot' + (deviceCount !== 1 ? 's' : '')
                ])
            ])
        ]),
        createElement('div', { key: 'actions', className: 'flex items-center gap-4 ' + (isLightApp ? 'bg-white/80 border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-800') + ' p-2 rounded-2xl border backdrop-blur-sm transition-all' }, [
            createElement('button', { key: 'help-btn', onClick: onShowHelp, className: (isLightApp ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-700 hover:bg-slate-600 text-white') + ' px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest mr-1' }, 'HOW TO USE'),
            deviceCount < 4 ? createElement('button', { key: 'add-btn', onClick: onAddSlot, className: 'bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest text-white mr-2' }, 'ADD SLOT') : null,
            createElement('div', { key: 'layout-toggle', className: 'flex gap-1 border-r ' + (isLightApp ? 'border-slate-200' : 'border-slate-800') + ' pr-4 mr-2' }, [
                createElement('button', { key: 'grid-btn', onClick: () => onSetLayoutMode('grid'), className: (layoutMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : (isLightApp ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300')) + ' px-4 py-2 rounded-xl text-xs font-bold transition-all' }, 'GRID'),
                createElement('button', { key: 'stack-btn', onClick: () => onSetLayoutMode('stack'), className: (layoutMode === 'stack' ? 'bg-blue-600 text-white shadow-lg' : (isLightApp ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300')) + ' px-4 py-2 rounded-xl text-xs font-bold transition-all' }, 'STACK')
            ]),
            createElement('div', { key: 'theme-toggle', className: 'flex p-1 rounded-xl gap-1 ' + (isLightApp ? 'bg-slate-100' : 'bg-slate-800/50') }, [
                createElement('button', { key: 'light-btn', onClick: () => onSetAppTheme('light'), className: (isLightApp ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-400') + ' w-9 h-9 rounded-lg flex items-center justify-center transition-all', title: 'Light Mode', style: { fontFamily: 'Segoe Fluent Icons' } }, String.fromCharCode(0xE706)),
                createElement('button', { key: 'dark-btn', onClick: () => onSetAppTheme('dark'), className: (appTheme === 'dark' ? 'bg-slate-700 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-400') + ' w-9 h-9 rounded-lg flex items-center justify-center transition-all', title: 'Dark Mode', style: { fontFamily: 'Segoe Fluent Icons' } }, String.fromCharCode(0xE708))
            ])
        ])
    ]);
}
