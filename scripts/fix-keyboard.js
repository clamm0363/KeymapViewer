// [MAINTENANCE] fix-keyboard.js
//
// このスクリプトは Keyboard.js の特定コードブロックを文字列マッチで置換する
// 一時的なパッチスクリプトです。
//
// ⚠️  現在の Keyboard.js はリファクタリング済みのため、このスクリプトは
//     適用できない状態です（対象コードが存在しない）。
//     過去の修正経緯の記録として保存しています。
//
// 使用する場合は、適用前に必ずターゲットコードが存在するか確認してください。
// npm scripts には登録されていません。直接 `node scripts/fix-keyboard.js` で実行します。

const fs = require('fs');
const path = require('path');


const targetFile = path.resolve(__dirname, '..', 'js', 'components', 'Keyboard.js');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. スラッシュ自動改行とスケール計算の追加
const searchWrap = `                    // 特殊記号での自動折り返し試行
                    if (centerText.length > 5 && (centerText.includes('_') || centerText.includes('-'))) {
                        const splitIdx = Math.max(centerText.lastIndexOf('_'), centerText.lastIndexOf('-'));
                        if (splitIdx > 1 && splitIdx < centerText.length - 2) {
                            finalDisplayText = centerText.substring(0, splitIdx) + '\\n' + centerText.substring(splitIdx);
                            manualWrap = true;
                        }
                    }`;

const replaceWrap = `                    // 特殊記号での自動折り返し試行
                    if (centerText.length > 5 && (centerText.includes('_') || centerText.includes('-') || centerText.includes(' / '))) {
                        if (centerText.includes(' / ')) {
                            // スラッシュの前後で分割し、スラッシュを消去して2行にする
                            const parts = centerText.split(' / ');
                            finalDisplayText = parts[0] + '\\n' + parts[1];
                            manualWrap = true;
                        } else {
                            const splitIdx = Math.max(centerText.lastIndexOf('_'), centerText.lastIndexOf('-'));
                            if (splitIdx > 1 && splitIdx < centerText.length - 2) {
                                finalDisplayText = centerText.substring(0, splitIdx) + '\\n' + centerText.substring(splitIdx);
                                manualWrap = true;
                            }
                        }
                    }`;

// 2. 改行時のスケール計算
const searchScale = `                    // スケール計算: visualWeightに基づき、かつ1u(56px)基準で調整
                    let visualWeightForScale = centerText.length;
                    if (isFluentCenter) {
                        visualWeightForScale = 1.2;
                    } else if (isModKey && modType !== 'base') {
                        visualWeightForScale += 0.5;
                    }`;

const replaceScale = `                    // スケール計算: visualWeightに基づき、かつ1u(56px)基準で調整
                    let visualWeightForScale = centerText.length;
                    if (manualWrap) {
                        // 改行されている場合は、1行あたりの最大文字数を基準にする
                        const lines = finalDisplayText.split('\\n');
                        visualWeightForScale = Math.max(...lines.map(l => l.length));
                    }
                    if (isFluentCenter) {
                        visualWeightForScale = 1.2;
                    } else if (isModKey && modType !== 'base') {
                        visualWeightForScale += 0.5;
                    }`;

// 3. MAGICアイコンの縮小スケール
const searchMagicScale = `                                                        transform: 'scale(0.55)',`;
const replaceMagicScale = `                                                        transform: 'scale(0.46)', // スワップ系テキスト全体の均一スッキリ化のために0.55 ➔ 0.46に縮小して美しい余白を確保`;

// 4. MAGIC表記への変更
const searchMag = `    // MAGIC category
    if (
        upper.includes('MAGIC_') || 
        ['KC_AG_TOGG', 'AG_TOGG', 'KC_CG_TOGG', 'CG_TOGG'].includes(upper)
    ) {
        return 'MAG';
    }`;
const replaceMag = `    // MAGIC category
    if (
        upper.includes('MAGIC_') || 
        ['KC_AG_TOGG', 'AG_TOGG', 'KC_CG_TOGG', 'CG_TOGG'].includes(upper)
    ) {
        return 'MAGIC';
    }`;

// 置換の適用（CRLFとLFの両方に対応できるように正規化してから置換）
function normalizeNewlines(str) {
  return str.replace(/\r\n/g, '\n');
}

// ターゲットのファイルを読み込んで正規化
let result = normalizeNewlines(content);

// 各置換を実行
result = result.replace(normalizeNewlines(searchWrap), normalizeNewlines(replaceWrap));
result = result.replace(normalizeNewlines(searchScale), normalizeNewlines(replaceScale));
result = result.replace(normalizeNewlines(searchMagicScale), normalizeNewlines(replaceMagicScale));
result = result.replace(normalizeNewlines(searchMag), normalizeNewlines(replaceMag));

// 🌟 通常のキーのレンダリング全体を囲む、絶対に重複しない巨大な一意のブロックを置換 🌟
const targetStart =
  "return createElement('div', {\n                                            style: {\n                                                display: 'flex',\n                                                alignItems: 'center',\n                                                justifyContent: 'center',\n                                                width: '100%',\n                                                height: '100%',\n                                                padding: '2px',\n                                                boxSizing: 'border-box',\n                                                position: 'relative' // 右下バッジのための相対配置基準点";

const targetEnd =
  'keyCategory)\n                                            )\n                                        ]);\n                                    })()';

const startIndex = result.indexOf(normalizeNewlines(targetStart));
if (startIndex !== -1) {
  const endIndex = result.indexOf(normalizeNewlines(targetEnd), startIndex);
  if (endIndex !== -1) {
    const fullMatch = result.substring(startIndex, endIndex + normalizeNewlines(targetEnd).length);

    // 置き換え後のコード (改行時のフレックス2行レンダリング + カテゴリバッジの bottom: -4.5px を両方綺麗に含んでいます)
    const replaceMultiline = `return createElement('div', {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '100%',
                                                height: '100%',
                                                padding: '2px',
                                                boxSizing: 'border-box',
                                                position: 'relative' // 右下バッジのための相対配置基準点
                                            }
                                        }, [
                                            // ① SVG or Text rendering
                                            (() => {
                                                const modeCheck = (displayMode === 'Fluent');
                                                const svgCheck = isSVGAvailable(displayRaw);

                                                // SVG icon rendering: create SVG at effective size directly
                                                if (modeCheck && svgCheck) {
                                                    const effectiveSvgSize = Math.max(8, Math.round(24 * combinedScale));
                                                    const svgEl = createSVGElement(displayRaw, { size: effectiveSvgSize, color: isLight ? '#1e293b' : '#fff' });
                                                    if (svgEl) {
                                                        return createElement('div', {
                                                            key: 'svg-render',
                                                            style: {
                                                                width: effectiveSvgSize + 'px',
                                                                height: effectiveSvgSize + 'px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            },
                                                            dangerouslySetInnerHTML: { __html: svgEl.outerHTML }
                                                        });
                                                    }
                                                }
                                                
                                                // Text rendering: use effective fontSize directly (no CSS transform)
                                                const effectiveFontSize = 22 * combinedScale;
                                                const needsScaleBypass = effectiveFontSize < 14;
                                                return createElement('div', {
                                                    className: "legend-text",
                                                    style: getMainLegendStyle(isLight, finalDisplayText, isFluentIcon, (k.w || 56) / 56, {
                                                        transform: 'none',
                                                        fontSize: needsScaleBypass ? '16px' : (effectiveFontSize + 'px'),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        height: '100%',
                                                        maxHeight: 'none',
                                                        ...(canWrap ? { whiteSpace: 'pre-wrap', lineHeight: '1.1' } : {})
                                                     })
                                                 }, finalDisplayText ? (
                                                     finalDisplayText.includes('\\n') ? (
                                                         createElement('div', {
                                                             style: {
                                                                 display: 'flex',
                                                                 flexDirection: 'column',
                                                                 alignItems: 'center',
                                                                 justifyContent: 'center',
                                                                 lineHeight: '1.15',
                                                                 width: '100%',
                                                                 height: '100%'
                                                             }
                                                         },
                                                             finalDisplayText.split('\\n').map((line, idx) => (
                                                                 createElement('span', {
                                                                     key: idx,
                                                                     style: { display: 'block', whiteSpace: 'nowrap' }
                                                                 }, line)
                                                             ))
                                                         )
                                                     ) : (
                                                         createElement('span', {
                                                             style: needsScaleBypass ? {
                                                                 transform: \`scale(\${effectiveFontSize / 16})\`,
                                                                 transformOrigin: 'center center',
                                                                 display: 'inline-block',
                                                                 whiteSpace: 'nowrap'
                                                             } : null
                                                         }, finalDisplayText)
                                                     )
                                                 ) : null);
                                            })(),
                                            // ② 右下カテゴリバッジ (TEXTモード時のみ、かつカテゴリが存在する場合に描画)
                                            keyCategory && (displayMode !== 'Fluent') && createElement('div', {
                                                key: 'category-corner-label',
                                                style: {
                                                    position: 'absolute',
                                                    right: '3px',
                                                    bottom: '-4.5px', // パディングやフレックスの干渉をねじ伏せ、キートップの下端ギリギリに密着させるため -1px ➔ -4.5px に調整
                                                    zIndex: 10,
                                                    pointerEvents: 'none',
                                                    userSelect: 'none'
                                                }
                                            }, 
                                                createElement('span', {
                                                    style: {
                                                        fontSize: '15px', // 最小フォント制限を回避する安全なサイズ
                                                        fontWeight: '500', 
                                                        color: isLight ? '#64748b' : '#94a3b8',
                                                        opacity: 0.7,
                                                        fontFamily: '"Outfit", "Arial", "Helvetica", sans-serif',
                                                        letterSpacing: '0.05em', 
                                                        lineHeight: '1',
                                                        textTransform: 'uppercase',
                                                        transform: 'scale(0.5)', // 15px ➔ 7.5px 相当に縮小して極小でシャープに描画
                                                        transformOrigin: 'bottom right',
                                                        display: 'inline-block',
                                                        whiteSpace: 'nowrap'
                                                    }
                                                }, keyCategory)
                                            )
                                        ]);
                                    })()`;

    result = result.replace(fullMatch, replaceMultiline);
    console.log('✨ Ultimate range match succeeded for multiline rendering!');
  } else {
    console.error('❌ Failed to find targetEnd in file.');
  }
} else {
  console.error('❌ Failed to find targetStart in file.');
}

// 保存（ファイルの元の改行コードに合わせて出力）
const isCRLF = content.includes('\r\n');
const finalOutput = isCRLF ? result.replace(/\n/g, '\r\n') : result;

fs.writeFileSync(targetFile, finalOutput, 'utf8');
console.log('✅ Successfully applied replacements in Keyboard.js!');
