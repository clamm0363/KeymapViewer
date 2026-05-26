const { createElement } = React;

import { createSVGElement } from '../svg-icons.js';

function renderHeaderSvgIcon(iconKey, size, color) {
    const svgEl = createSVGElement(iconKey, { size, color });
    if (!svgEl) return null;

    return createElement('div', {
        style: {
            width: `${size}px`,
            height: `${size}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        dangerouslySetInnerHTML: { __html: svgEl.outerHTML }
    });
}

export function Header({ isLightApp, layoutMode, deviceCount, onShowHelp, onShowLinks, onMatchKeySize, onSetLayoutMode, onSetAppTheme, appTheme }) {
    const inactiveLayoutColor = isLightApp ? '#64748b' : '#94a3b8';
    const activeLayoutColor = '#ffffff';

    return createElement('header', { key: 'header', className: 'sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center gap-6 w-full py-4 md:py-6 mb-12 border-b backdrop-blur-md transition-all duration-300 ' + (isLightApp ? 'bg-slate-50/80 border-slate-200/50' : 'bg-slate-950/80 border-slate-900/50') }, [
        createElement('div', { key: 'logo', className: 'flex items-center gap-6', onClick: () => window.location.reload(), style: { cursor: 'pointer' } }, [
            createElement('div', { key: 'kv-box', className: 'bg-blue-600 w-14 h-14 rounded-3xl flex items-center justify-center shadow-2xl font-black text-white text-2xl tracking-tighter' }, 'KV'),
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
        createElement('div', { key: 'actions', className: 'flex items-stretch gap-4 ' + (isLightApp ? 'bg-white/80 border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-800') + ' p-2 rounded-2xl border backdrop-blur-sm transition-all' }, [
            createElement('button', { key: 'help-btn', onClick: onShowHelp, className: (isLightApp ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-700 hover:bg-slate-600 text-white') + ' flex items-center justify-center text-center px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest mr-1' }, 'HOW TO USE'),
            createElement('button', { key: 'links-btn', onClick: onShowLinks, className: (isLightApp ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-700 hover:bg-slate-600 text-white') + ' flex items-center justify-center text-center px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest mr-1' }, 'LINKS'),
            createElement('button', { key: 'match-btn', onClick: onMatchKeySize, className: (isLightApp ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white') + ' flex items-center justify-center text-center px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest mr-2' }, 'MATCH KEY SIZE'),
            createElement('div', { key: 'layout-separator', className: 'w-px self-stretch ' + (isLightApp ? 'bg-slate-200' : 'bg-slate-800') }),
            createElement('div', { key: 'layout-toggle', className: 'flex self-stretch items-stretch p-1 rounded-xl gap-1 ' + (isLightApp ? 'bg-slate-100' : 'bg-slate-800/50') }, [
                createElement('button', {
                    key: 'grid-btn',
                    onClick: () => onSetLayoutMode('grid'),
                    className: (layoutMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : (isLightApp ? 'text-slate-500 hover:bg-white hover:text-slate-700' : 'text-slate-500 hover:bg-slate-700/70 hover:text-slate-300')) + ' w-9 h-full min-h-[45px] rounded-lg flex items-center justify-center transition-all',
                    title: 'Grid Layout'
                }, renderHeaderSvgIcon('KC_MISSION_CONTROL', 18, layoutMode === 'grid' ? activeLayoutColor : inactiveLayoutColor)),
                createElement('button', {
                    key: 'stack-btn',
                    onClick: () => onSetLayoutMode('stack'),
                    className: (layoutMode === 'stack' ? 'bg-blue-600 text-white shadow-sm' : (isLightApp ? 'text-slate-500 hover:bg-white hover:text-slate-700' : 'text-slate-500 hover:bg-slate-700/70 hover:text-slate-300')) + ' w-9 h-full min-h-[45px] rounded-lg flex items-center justify-center transition-all',
                    title: 'Stack Layout'
                }, renderHeaderSvgIcon('KC_MENU', 18, layoutMode === 'stack' ? activeLayoutColor : inactiveLayoutColor))
            ]),
            createElement('div', { key: 'theme-toggle', className: 'flex self-stretch items-stretch p-1 rounded-xl gap-1 ' + (isLightApp ? 'bg-slate-100' : 'bg-slate-800/50') }, [
                createElement('button', {
                    key: 'light-btn',
                    onClick: () => onSetAppTheme('light'),
                    className: (isLightApp ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-400') + ' w-9 h-full min-h-[45px] rounded-lg flex items-center justify-center transition-all',
                    title: 'Light Mode'
                }, renderHeaderSvgIcon('KC_KB_BRIGHTNESS_UP', 18, isLightApp ? '#f59e0b' : '#94a3b8')),
                createElement('button', {
                    key: 'dark-btn',
                    onClick: () => onSetAppTheme('dark'),
                    className: (appTheme === 'dark' ? 'bg-slate-700 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-400') + ' w-9 h-full min-h-[45px] rounded-lg flex items-center justify-center transition-all',
                    title: 'Dark Mode'
                }, renderHeaderSvgIcon('ic_fluent_weather_moon_24_regular', 18, appTheme === 'dark' ? '#60a5fa' : '#94a3b8'))
            ])
        ])
    ]);
}
