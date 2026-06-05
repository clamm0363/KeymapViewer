const { createElement, useState } = React;

const HELP_CONTENT = {
  ja: {
    title: '使い方ガイド',
    pages: [
      {
        label: '1 / 4',
        sections: [
          {
            title: '📂 読み込みとスロット管理',
            items: [
              {
                title: 'LOAD',
                desc:
                  ' スロットごとの読込入口です。ファイル読込か、接続済みデバイスからの読込かを選べます。',
              },
              {
                title: 'ファイルから読み込む',
                desc:
                  ' 先に LAYOUT 用 JSON を読み込み、その後必要に応じて MAPPING 用 JSON を続けて読み込みます。',
              },
              {
                title: 'ドラッグ＆ドロップ',
                desc:
                  ' JSON ファイルをスロットへドロップすると、その場で内容を適用できます。',
              },
              {
                title: 'デバイスから読み込む',
                desc:
                  ' WebHID 経由で現在のキーマップを読み込みます。レイアウト定義はキャッシュ、現在スロット、既知定義、手動指定 JSON の順で補完されます。',
              },
            ],
          },
          {
            title: '🧩 レイアウトの並べ方',
            items: [
              {
                title: 'スロット',
                desc:
                  ' 複数のキーボードを同時に並べて比較できます。ドラッグで並び順の変更も可能です。',
              },
              {
                title: 'Grid / Stack',
                desc:
                  ' 表示レイアウトを切り替えて、横並び重視か縦スクロール重視かを選べます。',
              },
            ],
          },
        ],
        footer:
          'レイアウト読込に成功した定義はブラウザ内へ保存されるため、同じ環境では次回以降の再読込がスムーズです。',
      },
      {
        label: '2 / 4',
        sections: [
          {
            title: '🎛️ 表示設定',
            items: [
              {
                title: 'DISPLAY MODE',
                desc:
                  ' アイコン中心の Fluent 表示と、ラベル中心の Text 表示を切り替えられます。',
              },
              {
                title: 'STYLE',
                desc:
                  ' Windows / Mac の見た目を切り替え、修飾キーの表記やアイコンも最適化します。',
              },
              {
                title: 'THEME',
                desc:
                  ' 各スロットごとに Light / Dark / System を設定できます。',
              },
              {
                title: '表示倍率',
                desc:
                  ' キーボードごとの拡大率を調整できます。必要なら他スロットとサイズを合わせることもできます。',
              },
            ],
          },
          {
            title: '🗂️ レイヤーと表示補助',
            items: [
              {
                title: 'LAYER',
                desc:
                  ' 表示中のレイヤーを切り替えられます。レイヤー数が多い場合はページ送り付きで表示されます。',
              },
              {
                title: 'CALLOUTS',
                desc:
                  ' キーごとの注釈をキーボード外側へ一覧表示します。説明が多いときの確認に便利です。',
              },
              {
                title: 'ホバー情報',
                desc:
                  ' キーにマウスを重ねると、キーコードや注釈内容などの補足情報を確認できます。',
              },
            ],
          },
        ],
        footer:
          '表示系の設定はスロット単位で保持されるため、同じデータでも用途別に見た目を変えて比較できます。',
      },
      {
        label: '3 / 4',
        sections: [
          {
            title: '✏️ キー編集と注釈',
            items: [
              {
                title: 'キーをクリック',
                desc:
                  ' キーをクリックすると編集モーダルが開き、注釈や表示上書きを設定できます。',
              },
              {
                title: 'Custom Text / Detailed Description',
                desc:
                  ' 短い補助ラベルと詳細説明を保存できます。詳細説明は CALLOUT やツールチップでも使われます。',
              },
              {
                title: 'SVG Icon',
                desc:
                  ' エンコーダ以外のキーでは、既存表示をサービス内の SVG アイコンへ置き換えられます。カテゴリタブで絞り込みもできます。',
              },
              {
                title: 'RESET',
                desc:
                  ' 設定した SVG アイコン上書きを解除し、元のキー表示へ戻します。',
              },
            ],
          },
          {
            title: '⌨️ 特殊キー表示',
            items: [
              {
                title: 'Layer-Tap / Mod-Tap',
                desc:
                  ' LT や MT などの複合キーは、内容に応じた専用レイアウトで描画されます。',
              },
              {
                title: 'JIS Enter / 特殊形状キー',
                desc:
                  ' JIS の L 字 Enter など、形状の違うキーも見た目を保ったまま表示します。',
              },
            ],
          },
        ],
        footer:
          '注釈ドットが付いているキーは、テキスト説明または SVG アイコン上書きが保存されているキーです。',
      },
      {
        label: '4 / 4',
        sections: [
          {
            title: '🔗 共有・出力・補助機能',
            items: [
              {
                title: 'SHARE',
                desc:
                  ' 現在の状態を URL に圧縮して埋め込み、サーバー不要で共有できます。',
              },
              {
                title: 'EXPORT',
                desc:
                  ' 現在の表示を高解像度 PNG として書き出し、配布用のチートシートを作れます。',
              },
              {
                title: 'MACROS',
                desc:
                  ' 読み込まれたマクロ内容の確認と、表示用エイリアスの設定ができます。',
              },
            ],
          },
          {
            title: '💾 保存される内容',
            items: [
              {
                title: 'ブラウザ保存',
                desc:
                  ' 読み込み済みレイアウト定義、表示設定、注釈などの一部状態はブラウザ内に保存され、次回の作業再開を助けます。',
              },
            ],
          },
        ],
        footer:
          'このガイドは最新機能に合わせて更新されます。表示や操作が増えた場合は、まずここを確認してください。',
      },
    ],
  },
  en: {
    title: 'Usage Guide',
    pages: [
      {
        label: '1 / 4',
        sections: [
          {
            title: '📂 Loading and Slot Management',
            items: [
              {
                title: 'LOAD',
                desc:
                  ' The main entry point for each slot. Choose between file-based loading or reading from a connected device.',
              },
              {
                title: 'Load From File',
                desc:
                  ' Load a LAYOUT JSON first, then optionally load a MAPPING JSON right after it.',
              },
              {
                title: 'Drag and Drop',
                desc:
                  ' Drop JSON files directly onto a slot to apply them immediately.',
              },
              {
                title: 'Read From Device',
                desc:
                  ' Reads the current keymap through WebHID. Layout definitions fall back through cache, the current slot, bundled definitions, and manually provided JSON files.',
              },
            ],
          },
          {
            title: '🧩 Arranging Layouts',
            items: [
              {
                title: 'Slots',
                desc:
                  ' Compare multiple keyboards side by side and reorder them with drag and drop.',
              },
              {
                title: 'Grid / Stack',
                desc:
                  ' Switch between a denser side-by-side layout and a vertically stacked layout.',
              },
            ],
          },
        ],
        footer:
          'Successfully resolved layout definitions are cached in the browser, so reconnecting in the same environment is faster later.',
      },
      {
        label: '2 / 4',
        sections: [
          {
            title: '🎛️ Display Settings',
            items: [
              {
                title: 'DISPLAY MODE',
                desc:
                  ' Toggle between icon-focused Fluent mode and label-focused Text mode.',
              },
              {
                title: 'STYLE',
                desc:
                  ' Switch between Windows and Mac keycap styles, including modifier labeling.',
              },
              {
                title: 'THEME',
                desc:
                  ' Set each slot to Light, Dark, or System independently.',
              },
              {
                title: 'Display Scale',
                desc:
                  ' Adjust keyboard scale per slot and align sizes across slots when needed.',
              },
            ],
          },
          {
            title: '🗂️ Layers and Reading Aids',
            items: [
              {
                title: 'LAYER',
                desc:
                  ' Change the currently displayed layer. Large layer counts are paged automatically.',
              },
              {
                title: 'CALLOUTS',
                desc:
                  ' Show saved key annotations outside the keyboard for easier reading when notes become dense.',
              },
              {
                title: 'Hover Details',
                desc:
                  ' Hovering a key reveals extra information such as keycode details and saved annotations.',
              },
            ],
          },
        ],
        footer:
          'Display-related settings are stored per slot, so the same data can be reviewed in multiple visual styles.',
      },
      {
        label: '3 / 4',
        sections: [
          {
            title: '✏️ Key Editing and Annotations',
            items: [
              {
                title: 'Click a Key',
                desc:
                  ' Clicking a key opens the editor modal, where you can add notes and override the displayed icon.',
              },
              {
                title: 'Custom Text / Detailed Description',
                desc:
                  ' Save a short label and a longer explanation. These are reused in callouts and hover tooltips.',
              },
              {
                title: 'SVG Icon',
                desc:
                  ' For non-encoder keys, you can replace the normal rendering with a built-in SVG icon. Category tabs help narrow the list.',
              },
              {
                title: 'RESET',
                desc:
                  ' Removes the SVG override and restores the original key rendering.',
              },
            ],
          },
          {
            title: '⌨️ Special Key Rendering',
            items: [
              {
                title: 'Layer-Tap / Mod-Tap',
                desc:
                  ' Composite keys such as LT and MT are rendered with dedicated layouts that match their behavior.',
              },
              {
                title: 'JIS Enter and Other Shapes',
                desc:
                  ' Non-standard key shapes, including the L-shaped JIS Enter key, keep their visual form in the preview.',
              },
            ],
          },
        ],
        footer:
          'A small annotation dot means that text notes or an SVG icon override are saved on that key.',
      },
      {
        label: '4 / 4',
        sections: [
          {
            title: '🔗 Sharing, Exporting, and Utility Features',
            items: [
              {
                title: 'SHARE',
                desc:
                  ' Compress the current state into the URL so you can share it without a server.',
              },
              {
                title: 'EXPORT',
                desc:
                  ' Export the current view as a high-resolution PNG keyboard cheatsheet.',
              },
              {
                title: 'MACROS',
                desc:
                  ' Review loaded macro contents and assign friendlier display aliases.',
              },
            ],
          },
          {
            title: '💾 What Gets Saved',
            items: [
              {
                title: 'Browser Storage',
                desc:
                  ' Cached layout definitions, display preferences, and some annotation-related state are kept in the browser to make future sessions easier.',
              },
            ],
          },
        ],
        footer:
          'This guide is updated as the app grows. When new controls appear, this modal should be the first place to check.',
      },
    ],
  },
};

function renderHelpItem(item, itemTitleClass) {
  return createElement('li', { key: item.title }, [
    createElement('span', { className: itemTitleClass }, item.title),
    item.desc,
  ]);
}

export function HelpModal({ isLightApp, onClose }) {
  const [lang, setLang] = useState('ja');
  const [pageIndex, setPageIndex] = useState(0);

  const titleColor = isLightApp ? 'text-slate-900' : 'text-white';
  const descColor = isLightApp ? 'text-slate-600' : 'text-slate-300';
  const listColor = isLightApp ? 'text-slate-600' : 'text-slate-300';
  const subTitleColor = 'text-blue-500 font-black text-xs uppercase tracking-widest mb-2';
  const itemTitleClass = 'font-bold ' + (isLightApp ? 'text-slate-900' : 'text-slate-100');

  const localized = HELP_CONTENT[lang];
  const totalPages = localized.pages.length;
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const page = localized.pages[safePageIndex];

  const goPrevPage = () => setPageIndex((prev) => Math.max(0, prev - 1));
  const goNextPage = () => setPageIndex((prev) => Math.min(totalPages - 1, prev + 1));

  return createElement(
    'div',
    {
      key: 'help-modal',
      className:
        'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm',
      onClick: onClose,
    },
    [
      createElement(
        'div',
        {
          key: 'help-content',
          className:
            (isLightApp ? 'bg-white' : 'bg-slate-900') +
            ' border ' +
            (isLightApp ? 'border-slate-200' : 'border-slate-700') +
            ' rounded-2xl shadow-2xl max-w-xl w-full mx-4 max-h-[85vh] overflow-y-auto',
          onClick: (e) => e.stopPropagation(),
        },
        [
          createElement(
            'div',
            {
              key: 'help-header',
              className:
                (isLightApp ? 'bg-slate-50' : 'bg-slate-900') +
                ' sticky top-0 border-b ' +
                (isLightApp ? 'border-slate-200' : 'border-slate-800') +
                ' px-6 py-4 flex justify-between items-center rounded-t-2xl z-10 gap-4',
            },
            [
              createElement(
                'div',
                { key: 'header-title-wrap', className: 'flex min-w-0 items-center gap-3' },
                [
                  createElement(
                    'h3',
                    {
                      key: 'h3',
                      className: titleColor + ' text-lg font-black uppercase tracking-wide',
                    },
                    localized.title
                  ),
                  createElement(
                    'div',
                    {
                      key: 'page-nav',
                      className:
                        'flex items-center gap-1 rounded-xl border px-2 py-1 ' +
                        (isLightApp
                          ? 'border-slate-200 bg-white'
                          : 'border-slate-700 bg-slate-800/40'),
                    },
                    [
                      createElement(
                        'button',
                        {
                          key: 'prev-page',
                          type: 'button',
                          onClick: goPrevPage,
                          disabled: safePageIndex === 0,
                          className:
                            'h-6 w-6 rounded-md text-xs font-black transition-all ' +
                            (safePageIndex === 0
                              ? isLightApp
                                ? 'cursor-not-allowed text-slate-300'
                                : 'cursor-not-allowed text-slate-600'
                              : isLightApp
                                ? 'text-slate-600 hover:bg-slate-100'
                                : 'text-slate-200 hover:bg-slate-700/60'),
                        },
                        '‹'
                      ),
                      createElement(
                        'span',
                        {
                          key: 'page-indicator',
                          className:
                            'min-w-[56px] text-center text-[10px] font-black uppercase tracking-[0.2em] ' +
                            (isLightApp ? 'text-slate-500' : 'text-slate-300'),
                          style: { fontFamily: "'Outfit', sans-serif" },
                        },
                        page.label
                      ),
                      createElement(
                        'button',
                        {
                          key: 'next-page',
                          type: 'button',
                          onClick: goNextPage,
                          disabled: safePageIndex >= totalPages - 1,
                          className:
                            'h-6 w-6 rounded-md text-xs font-black transition-all ' +
                            (safePageIndex >= totalPages - 1
                              ? isLightApp
                                ? 'cursor-not-allowed text-slate-300'
                                : 'cursor-not-allowed text-slate-600'
                              : isLightApp
                                ? 'text-slate-600 hover:bg-slate-100'
                                : 'text-slate-200 hover:bg-slate-700/60'),
                        },
                        '›'
                      ),
                    ]
                  ),
                ]
              ),
              createElement(
                'div',
                { key: 'header-actions', className: 'flex items-center gap-4' },
                [
                  createElement(
                    'div',
                    {
                      key: 'lang-toggle',
                      className:
                        'flex items-center p-0.5 rounded-lg border ' +
                        (isLightApp
                          ? 'bg-slate-100 border-slate-200'
                          : 'bg-slate-800/40 border-slate-700/50'),
                    },
                    [
                      createElement(
                        'button',
                        {
                          key: 'ja',
                          type: 'button',
                          onClick: () => setLang('ja'),
                          className:
                            'px-2 py-1 text-[9px] font-black rounded-md transition-all ' +
                            (lang === 'ja'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-400'),
                        },
                        'JA'
                      ),
                      createElement(
                        'button',
                        {
                          key: 'en',
                          type: 'button',
                          onClick: () => setLang('en'),
                          className:
                            'px-2 py-1 text-[9px] font-black rounded-md transition-all ' +
                            (lang === 'en'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-400'),
                        },
                        'EN'
                      ),
                    ]
                  ),
                  createElement(
                    'button',
                    {
                      key: 'close',
                      type: 'button',
                      onClick: onClose,
                      className:
                        'text-slate-500 hover:text-blue-500 transition-colors text-xl font-bold',
                    },
                    '✕'
                  ),
                ]
              ),
            ]
          ),
          createElement(
            'div',
            {
              key: 'help-body',
              className: 'px-6 py-6 space-y-6 text-sm ' + descColor + ' leading-relaxed',
            },
            [
              ...page.sections.map((section) =>
                createElement('div', { key: section.title }, [
                  createElement('h4', { key: `${section.title}-title`, className: subTitleColor }, section.title),
                  createElement(
                    'ul',
                    {
                      key: `${section.title}-list`,
                      className: 'space-y-1.5 list-disc list-inside ' + listColor,
                    },
                    section.items.map((item) => renderHelpItem(item, itemTitleClass))
                  ),
                ])
              ),
              createElement(
                'div',
                {
                  key: 'help-footer',
                  className:
                    'pt-2 border-t ' +
                    (isLightApp ? 'border-slate-100' : 'border-slate-800') +
                    ' text-xs text-slate-500',
                },
                page.footer
              ),
            ]
          ),
        ]
      ),
    ]
  );
}
