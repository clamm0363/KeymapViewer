const { createElement, useState } = React;

export function HelpModal({ isLightApp, onClose }) {
    const [lang, setLang] = useState('ja');

    const titleColor = isLightApp ? 'text-slate-900' : 'text-white';
    const descColor = isLightApp ? 'text-slate-600' : 'text-slate-300';
    const subTitleColor = 'text-blue-500 font-black text-xs uppercase tracking-widest mb-2';
    const itemTitleClass = 'font-bold ' + (isLightApp ? 'text-slate-900' : 'text-slate-100');

    const content = {
        ja: {
            title: '使い方ガイド',
            sec1Title: '📂 キーマップの読み込み & 管理',
            sec1_1: 'LAYOUT',
            sec1_1Desc: ' — キーボードの物理レイアウト（配列定義）JSONを読み込みます。',
            sec1_2: 'MAPPING',
            sec1_2Desc: ' — レイヤーごとのキーアサインJSON（QMK/VIA形式）を読み込みます。',
            sec1_3: 'ドラッグ＆ドロップ',
            sec1_3Desc: ' — スロットにJSONファイルをドロップして即座に適用できます。',
            
            sec2Title: '⚙️ 表示カスタマイズ (メニューバーから切替)',
            sec2_1: 'DISPLAY MODE',
            sec2_1Desc: ' — アイコン重視の「Fluent」と、テキスト記述の「Text」を切り替え。',
            sec2_2: 'STYLE',
            sec2_2Desc: ' — Windows / Mac 表示を切り替えて、修飾キーのアイコン（Win/Cmd, Alt/Opt）を最適化。',
            sec2_3: 'THEME',
            sec2_3Desc: ' — ダーク / ライト / システム連動の各スロット個別テーマ設定。',
            
            sec3Title: '🔗 共有 & 画像出力',
            sec3_1: 'SHARE (共有)',
            sec3_1Desc: ' — 状態をURL自体に圧縮して保存し、サーバー不要で全く同じ環境URLをコピー・共有可能です。',
            sec3_2: 'EXPORT (書き出し)',
            sec3_2Desc: ' — 高解像度の美しいキーボードチートシートをPNG画像としてエクスポートします。',
            
            sec4Title: '🤖 マクロ & レイヤータップ機能',
            sec4_1: 'MACROS',
            sec4_1Desc: ' — スロットに読み込まれたマクロの確認やエイリアス（別名）の設定が可能です。',
            sec4_2: '特殊表示対応',
            sec4_2Desc: ' — レイヤータップ（LT）やモディファイアタップ（MT）、JISのL字エンターキーが自動的に専用グラフィックで描画されます。',
            
            footer: '※ 編集中の設定状態はブラウザの localStorage にリアルタイムで自動保存されるため、タブを閉じても安全に作業を継続できます。'
        },
        en: {
            title: 'Usage Guide',
            sec1Title: '📂 Load & Manage Keymaps',
            sec1_1: 'LAYOUT',
            sec1_1Desc: ' — Load physical keyboard layout JSON definition.',
            sec1_2: 'MAPPING',
            sec1_2Desc: ' — Load layer key assignment mapping JSON (QMK/VIA format).',
            sec1_3: 'Drag & Drop',
            sec1_3Desc: ' — Drop JSON files directly onto slots for instant loading.',
            
            sec2Title: '⚙️ Display Customization (Switch via Settings Menu)',
            sec2_1: 'DISPLAY MODE',
            sec2_1Desc: ' — Toggle between icon-centric "Fluent" and text-label "Text".',
            sec2_2: 'STYLE',
            sec2_2Desc: ' — Switch between Windows and Mac keycaps to optimize modifier labels (Win/Cmd, Alt/Opt).',
            sec2_3: 'THEME',
            sec2_3Desc: ' — Set individual dark, light, or system-integrated themes per slot.',
            
            sec3Title: '🔗 Share & Export',
            sec3_1: 'SHARE',
            sec3_1Desc: ' — Compress and embed keyboard state into the URL for easy, serverless link-sharing.',
            sec3_2: 'EXPORT',
            sec3_2Desc: ' — Render and download a high-resolution keyboard cheatsheet as a PNG image.',
            
            sec4Title: '🤖 Macros & Advanced Features',
            sec4_1: 'MACROS',
            sec4_1Desc: ' — View macros loaded into the slot and customize their aliases.',
            sec4_2: 'Special Renderings',
            sec4_2Desc: ' — Automatically renders advanced keycaps like Layer-Tap (LT), Mod-Tap (MT), and L-shaped JIS Enter keys in high-fidelity graphics.',
            
            footer: '* All edits are saved automatically to the browser\'s localStorage, allowing you to resume your work safely anytime.'
        }
    };

    const t = content[lang];

    return createElement('div', { key: 'help-modal', className: 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm', onClick: onClose }, [
        createElement('div', { key: 'help-content', className: (isLightApp ? 'bg-white' : 'bg-slate-900') + ' border ' + (isLightApp ? 'border-slate-200' : 'border-slate-700') + ' rounded-2xl shadow-2xl max-w-xl w-full mx-4 max-h-[85vh] overflow-y-auto', onClick: (e) => e.stopPropagation() }, [
            createElement('div', { key: 'help-header', className: (isLightApp ? 'bg-slate-50' : 'bg-slate-900') + ' sticky top-0 border-b ' + (isLightApp ? 'border-slate-200' : 'border-slate-800') + ' px-6 py-4 flex justify-between items-center rounded-t-2xl z-10' }, [
                createElement('h3', { key: 'h3', className: titleColor + ' text-lg font-black uppercase tracking-wide' }, t.title),
                createElement('div', { key: 'header-actions', className: 'flex items-center gap-4' }, [
                    // Language Selector Capsule Toggle
                    createElement('div', { key: 'lang-toggle', className: 'flex items-center p-0.5 rounded-lg border ' + (isLightApp ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/40 border-slate-700/50') }, [
                        createElement('button', { 
                            key: 'ja', 
                            onClick: () => setLang('ja'), 
                            className: 'px-2 py-1 text-[9px] font-black rounded-md transition-all ' + 
                                (lang === 'ja' 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-400')
                        }, 'JA'),
                        createElement('button', { 
                            key: 'en', 
                            onClick: () => setLang('en'), 
                            className: 'px-2 py-1 text-[9px] font-black rounded-md transition-all ' + 
                                (lang === 'en' 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-400')
                        }, 'EN')
                    ]),
                    // Close Button
                    createElement('button', { key: 'close', onClick: onClose, className: 'text-slate-500 hover:text-blue-500 transition-colors text-xl font-bold' }, '✕')
                ])
            ]),
            createElement('div', { key: 'help-body', className: 'px-6 py-6 space-y-6 text-sm ' + descColor + ' leading-relaxed' }, [
                // 📂 データの読み込み & 管理
                createElement('div', { key: 'h-file' }, [
                    createElement('h4', { key: 'h4', className: subTitleColor }, t.sec1Title),
                    createElement('ul', { key: 'ul', className: 'space-y-1.5 list-disc list-inside text-slate-500' }, [
                        createElement('li', { key: 'li1' }, [createElement('span', { className: itemTitleClass }, t.sec1_1), t.sec1_1Desc]),
                        createElement('li', { key: 'li2' }, [createElement('span', { className: itemTitleClass }, t.sec1_2), t.sec1_2Desc]),
                        createElement('li', { key: 'li3' }, [createElement('span', { className: itemTitleClass }, t.sec1_3), t.sec1_3Desc])
                    ])
                ]),
                // ⚙️ 表示カスタマイズ
                createElement('div', { key: 'h-custom' }, [
                    createElement('h4', { key: 'h4', className: subTitleColor }, t.sec2Title),
                    createElement('ul', { key: 'ul', className: 'space-y-1.5 list-disc list-inside text-slate-500' }, [
                        createElement('li', { key: 'li1' }, [createElement('span', { className: itemTitleClass }, t.sec2_1), t.sec2_1Desc]),
                        createElement('li', { key: 'li2' }, [createElement('span', { className: itemTitleClass }, t.sec2_2), t.sec2_2Desc]),
                        createElement('li', { key: 'li3' }, [createElement('span', { className: itemTitleClass }, t.sec2_3), t.sec2_3Desc])
                    ])
                ]),
                // 🔗 共有 & 出力
                createElement('div', { key: 'h-share' }, [
                    createElement('h4', { key: 'h4', className: subTitleColor }, t.sec3Title),
                    createElement('ul', { key: 'ul', className: 'space-y-1.5 list-disc list-inside text-slate-500' }, [
                        createElement('li', { key: 'li1' }, [createElement('span', { className: itemTitleClass }, t.sec3_1), t.sec3_1Desc]),
                        createElement('li', { key: 'li2' }, [createElement('span', { className: itemTitleClass }, t.sec3_2), t.sec3_2Desc])
                    ])
                ]),
                // 🤖 マクロ & 高度な機能
                createElement('div', { key: 'h-macro' }, [
                    createElement('h4', { key: 'h4', className: subTitleColor }, t.sec4Title),
                    createElement('ul', { key: 'ul', className: 'space-y-1.5 list-disc list-inside text-slate-500' }, [
                        createElement('li', { key: 'li1' }, [createElement('span', { className: itemTitleClass }, t.sec4_1), t.sec4_1Desc]),
                        createElement('li', { key: 'li2' }, [createElement('span', { className: itemTitleClass }, t.sec4_2), t.sec4_2Desc])
                    ])
                ]),
                // 💾 保存仕様
                createElement('div', { key: 'h-storage', className: 'pt-2 border-t ' + (isLightApp ? 'border-slate-100' : 'border-slate-800') + ' text-xs text-slate-500' }, 
                    t.footer
                )
            ])
        ])
    ]);
}
