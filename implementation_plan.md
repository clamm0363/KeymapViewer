# キーカスタムアノテーション機能 実装計画（確定版 v2）

> **このドキュメントは別エージェントが実装を担当するための引き継ぎ文書です。**
> 本計画はプロジェクトのコードを精査した上で策定されています。実装前に `AGENTS.md` を必ず読んでください。

---

## 概要

任意のキーに対してユーザーが「カスタムテキスト」「詳細説明」「SVGアイコン（将来拡張）」を設定できる機能を追加する。
カスタムデータは以下の 2 箇所で表示される:

1. **ツールチップ**: キーをホバーした際、ツールチップの最上部に表示
2. **コールアウト（引き出し線）**: キーから引き出し線を伸ばし、テキストボックスを常時表示。ヘッダーのトグルで一括表示/非表示

---

## プロジェクト技術スタック（確認済み）

- React（CDN）+ htm を使わず `React.createElement` を直接使用（**htm を使ってはいけない**）
- Tailwind CSS（CDN）
- ビルドツールなし（ES Modules 直接ロード）
- `npm start` → `scripts/dev-static-server.js` でローカルサーバー起動（ポート 5501）
- 使用フォント: **Outfit**（`index.html` で Google Fonts 読み込み済み）

---

## アーキテクチャ上の重要な設計変更（v1 からの変更点）

### 旧計画の問題点

`KeyCalloutOverlay` を `keyboard-inner` の内側に配置する計画だったが、実際の DOM は以下の通り **3 層の `overflow-hidden` がある**:

```
DeviceSlot
  └── kbd-area
        └── kbd-wrap (overflow-hidden)
              └── div.w-full.overflow-hidden   ← DeviceSlot.js 内
                    └── keyboard-container (overflow-hidden)  ← Keyboard.js
                          └── keyboard-inner (scale transform)
                                └── kbd-container (overflow-hidden)
```

---

## 【追補計画】CALLOUTS フォローアップ修正（2026-06-01）

### 対象ブランチ

- `callout-followup-issues`

### 対象 Issue

- `#20` 長文注記でタイトルが消える
- `#21` 狭い画面幅で下方向フォールバックが崩れる
- `#22` `CALLOUTS` の ON/OFF 状態がリロード後に保持されない
- `#23` Light テーマでアノテーションボックスのコントラストが低い

---

## 修正方針（今回の設計判断）

今回の 4 件は一括実装できるが、責務は以下の 3 系統に分かれる。

1. **コールアウト配置・寸法ロジック**
   - `KeyCalloutOverlay.js`
   - Issue `#20`, `#21`
2. **CALLOUTS 表示状態の永続化**
   - `DeviceSlot.js`, `app.js`
   - Issue `#22`
3. **Light テーマの視認性調整**
   - `KeyCalloutOverlay.js`
   - Issue `#23`

このうち **最初に直すべきなのは `KeyCalloutOverlay.js` の構造問題** である。  
長文タイトル欠落と狭幅時の再配置崩れは、どちらも「固定サイズの `foreignObject` を前提にした位置決め」と
「実際のテキスト量に対して下方向の必要スペースを正しく見積もっていないこと」が根にあるため、同じフェーズで扱う。

---

## 実装順（推奨）

### フェーズ A: コールアウトレイアウトの正常化（最優先）

対象: Issue `#20`, `#21`

#### 目的

- 長文でもタイトルが先頭に残ること
- 画面幅が狭い場合に下方向フォールバックが安定すること
- 下方向に配置された場合の必要高さを `kbd-area` 側で正しく確保すること

#### 実装方針

1. **タイトル行を本文行とレイアウト上分離する**
   - タイトルを常に先頭ブロックとして描画し、本文とは別要素として扱う
   - タイトルが空の場合のみタイトル領域を省略する
   - 本文の長さに影響されてタイトルが押し出されない構造にする

2. **コールアウト寸法を「固定巨大サイズ」前提から整理する**
   - `FO_WIDTH`, `FO_HEIGHT`, `ESTIMATED_BOX_W` の関係を見直す
   - 「描画領域の大きさ」と「実際のボックス最大幅」を混同しない
   - 下方向フォールバック判定には、実ボックス幅に近い値を使う

3. **下方向フォールバック時の必要高さを計算に反映する**
   - 現在の `svgHeight = keyboardHeight + 140` は、`FO_HEIGHT = 380` と釣り合っていない
   - 下方向配置の最大ボックス高さと余白を加味して、`kbd-area` 内で必要な描画高さを確保する
   - これにより「クリップを避けるために overflow を広げた結果、隣接 UI に食い込む」状態を防ぐ

4. **狭幅時の再配置条件を再定義する**
   - 左右配置の可否を `foreignObject` の大きさではなく、実際のボックス最大幅と余白で判定する
   - `screenCenterX` 基準の下方向配置時に、左右 clamp が過剰に窮屈にならないよう確認する

#### 変更候補ファイル

- `js/components/KeyCalloutOverlay.js`
- 必要に応じて `js/components/DeviceSlot.js`

#### 完了条件

- 長文注記でもタイトルが消えない
- 狭い幅で左右配置不能な場合に安定して下方向に落ちる
- stack / grid 両レイアウトで、隣接スロットや後続 UI への不自然な食い込みがない

---

### フェーズ B: CALLOUTS 状態の永続化

対象: Issue `#22`

#### 推奨仕様

- **`CALLOUTS` の ON/OFF は slot 単位で保持する**
- localStorage 復元対象に含める
- **共有 URL には含めない**（今回の修正では仕様を広げすぎない）

#### 理由

- 既存 UI は `CALLOUTS` ボタンを各 `DeviceSlot` に持っているため、責務は slot 単位が自然
- URL 共有にまで含めると「表示プリファレンス」まで共有する意味付けが増え、今回の不具合修正範囲を超えやすい

#### 実装方針

1. `DeviceSlot.js` のローカル `useState(false)` をやめる
2. `dev.showCallouts` のような device state に昇格する
3. `createEmptyDevice()` と復元処理にデフォルト値を追加する
4. `DeviceSlot` のトグル操作を `onUpdateDevice` 経由に切り替える

#### 変更候補ファイル

- `js/app.js`
- `js/components/DeviceSlot.js`

#### 完了条件

- リロード後も各 slot の `CALLOUTS` 状態が復元される
- 他の display state と同じ流れで保存・復元される

---

### フェーズ C: Light テーマの視認性調整

対象: Issue `#23`

#### 目的

- Light テーマ時に、スロット背景からコールアウトボックスを十分に分離する

#### 実装方針

1. `bgCol` を単純な白近傍の半透明から見直す
2. `borderCol` と `boxShadow` を Light 専用に少し強める
3. テキスト色とのバランスを壊さない範囲で、背景・枠線・影の 3 点で視認性を上げる

#### 変更候補ファイル

- `js/components/KeyCalloutOverlay.js`

#### 完了条件

- Light テーマで長文ボックスでも境界が読み取りやすい
- Dark テーマの既存バランスを損なわない

---

## 実装タスク

### タスク 1: レイアウト基盤修正
- [x] `KeyCalloutOverlay.js` のタイトル/本文構造を分離
- [x] 左右配置と下方向フォールバック条件を整理
- [x] 下方向配置時の必要高さを `svgHeight` または親レイアウト側で確保
- [x] 長文ケースと狭幅ケースを優先して確認

### タスク 2: 状態永続化
- [x] `app.js` の device state に `showCallouts` を追加
- [x] 復元処理・初期状態・保存状態を統一
- [x] `DeviceSlot.js` のローカル state を device state に置換

### タスク 3: テーマ調整
- [x] Light テーマ用の背景色・枠線・影を調整
- [x] Dark テーマ回帰確認

### タスク 4: 検証
- [x] `npm run lint`
- [x] `npm run test`
- [x] ブラウザ確認: 長文タイトルあり
- [x] ブラウザ確認: Light / Dark
- [x] ブラウザ確認: リロード後の `CALLOUTS` 状態復元
- [x] ブラウザ確認: 狭幅での下方向フォールバックを追加サンプル込みで再確認

### 実装結果メモ

- `KeyCalloutOverlay` は `foreignObject` ベースの固定高レイアウトをやめ、**SVG で引き出し線、HTML absolute box で注記カード**を描画する構成に変更
- 配置計算は `js/utils/calloutLayout.js` に切り出し、`test/utils/calloutLayout.test.js` を追加
- `showCallouts` は slot ローカル state ではなく device state として保持するよう変更
- Playwright 上で `CALLOUTS` ON → リロード後も ON のまま復元されることを確認
- 長文タイトル + 長文本文を localStorage 注入で表示し、タイトルと本文が同時に DOM 上へ出ることを確認
- 狭幅時のフォールバック先は「キーの下」ではなく「キーボード全体の下」へ変更し、キーボード本体やボタン帯との重なりを避ける方向へ調整
- side placement でも上端が `kbd-area` をはみ出す場合は強制的にフォールバックへ送る
- 下方向フォールバック群は、キーボード下で **左から右へ並べ、足りなければ次の段へ折り返す** 配置に変更
- side placement は「即フォールバック」ではなく、可能な限り上下にスライドして収まる位置へ寄せるよう変更
- 下方向フォールバック群は単純な行詰めではなく、**キーの x 座標に近い列を優先して選ぶ** 方式へ変更し、線の交差を減らす方向へ調整

---

## 備考

- 前回レビューで見つかった **共有 URL に `keyAnnotations` が含まれていない問題** は今回の 4 Issue には含めないが、別途扱う価値が高い
- エンコーダー tooltip に注記が反映されていない点も、今回の 4 Issue とは別件として整理するのが安全

`keyboard-inner` 内の SVG が `overflow: visible` を持っていても、**外側の 3 層がすべてクリップする**ため引き出し線が外側に伸びることはできない。これらを全部 `overflow-visible` に変えると既存レイアウトが崩れるリスクが非常に高い。

### 新方針: DeviceSlot レベルのオーバーレイ

`KeyCalloutOverlay` を `DeviceSlot` が直接レンダリングし、`kbd-area` 全体を覆う `position:absolute` の SVG として描画する。

```
DeviceSlot (position:relative)
  └── kbd-area (position:relative ← 追加)
        ├── kbd-wrap (overflow:hidden のまま変更不要)
        │     └── keyboard-container (Keyboard コンポーネント)
        └── <svg position:absolute top:0 left:0 w:100% h:100%>  ← KeyCalloutOverlay
              └── 引き出し線・テキストボックス（kbd-area の座標系で描画）
```

**利点**:
- `overflow:hidden` を一切変更しない → レイアウト崩れゼロ
- DeviceSlot をまたいで引き出し線が飛び出ることがない
- エクスポート用 `Keyboard` には関与しないため export 問題も自動解決

---

## 座標変換の設計

`Keyboard.js` の `onScaleMetricsChange` を拡張して `containerWidth` も通知する:

```js
// Keyboard.js の ResizeObserver 内
onScaleMetricsChange({
  autoFitScale,
  finalScale,
  maxWidth,
  maxHeight,
  containerWidth: entry.contentRect.width,  // 追加
});
```

`DeviceSlot` はこれを自身のステート `localScaleMetrics` として保持し、`KeyCalloutOverlay` に渡す。

### キー座標 → kbd-area スクリーン座標の変換式

```js
const renderedKeyboardWidth = scaleMetrics.maxWidth * scaleMetrics.finalScale;
// keyboard-container は w-full かつ justify-center なのでキーボードは中央揃え
const innerOffsetX = Math.max(0, (scaleMetrics.containerWidth - renderedKeyboardWidth) / 2);
// keyboard-container の py-1 = 4px 上パディング
const innerOffsetY = 4;

// キーの中央スクリーン座標
const screenCenterX = innerOffsetX + (k.x + k.w / 2) * scaleMetrics.finalScale;
const screenCenterY = innerOffsetY + (k.y + k.h / 2) * scaleMetrics.finalScale;
```

---

## コールアウト配置ロジック（確定仕様）

### 左右判定と配置

```js
const centerX = k.x + k.w / 2;  // スケール前座標
const isLeftSide = centerX < maxWidth / 2;

const BOX_W = 140;
const BOX_H = 60;
const LINE_LEN = 60;

const screenKeyLeftEdge  = innerOffsetX + k.x * finalScale;
const screenKeyRightEdge = innerOffsetX + (k.x + k.w) * finalScale;
const lineY = screenCenterY;
const boxY  = lineY - BOX_H / 2;

let lineStartX, lineEndX, boxX;

if (isLeftSide) {
  lineStartX = screenKeyLeftEdge;
  lineEndX   = lineStartX - LINE_LEN;
  boxX       = lineEndX - BOX_W;
} else {
  lineStartX = screenKeyRightEdge;
  lineEndX   = lineStartX + LINE_LEN;
  boxX       = lineEndX;
}
```

### フォールバック: 左右スペースが足りない場合はキーの下に配置

```js
// svgWidth = kbd-area の幅（SVG の width 属性）
const needsFallback = isLeftSide ? boxX < 0 : boxX + BOX_W > svgWidth;

if (needsFallback) {
  const BELOW_OFFSET = 12;
  const screenKeyBottomY = innerOffsetY + (k.y + k.h) * finalScale;
  boxX = Math.max(0, Math.min(screenCenterX - BOX_W / 2, svgWidth - BOX_W));
  boxY = screenKeyBottomY + BELOW_OFFSET;
  // 線: キー下端中央 → ボックス上端中央（垂直線）
  lineStartX = screenCenterX;
  lineEndX   = screenCenterX;
  lineY      = screenKeyBottomY;
}
```

---

## エクスポート機能への対応（確定仕様）

**コールアウト・引き出し線は画像エクスポートに含めない。**

- `app.js` の export 用 `Keyboard`（L1096 付近）には `showCallouts` を渡さない（デフォルト `false`）
- `KeyCalloutOverlay` は `DeviceSlot` レベルのため export 用 `Keyboard` には一切関与しない
- `foreignObject` の `html-to-image` 非互換問題は構造上発生しない

> [!IMPORTANT]
> 最終検証で「EXPORT 時にコールアウトが画像に含まれないこと」を必ず確認すること。

---

## データ構造

```js
// createEmptyDevice() に追加するフィールド
{
  keyAnnotations: {
    "0,3": {
      customText: "Figma: デザインモード切替",
      description: "ソフトウェア Figma のショートカット",
      iconKey: "",  // 将来拡張用（現在は空文字で保持するだけ）
    }
  }
}
```

```js
// matrixKey の決定ロジック（Keycap, KeyCalloutOverlay 内で使用）
function getMatrixKey(k) {
  if (k.matrix) return `${k.matrix[0]},${k.matrix[1]}`;
  return k.id;
}
```

---

## ファイル変更一覧

### 新規ファイル

#### [NEW] `js/utils/keyAnnotations.js`

純粋ロジック。副作用なし。エクスポートする関数:
- `getAnnotation(keyAnnotations, matrixKey)` → `{ customText, description, iconKey } | null`
- `setAnnotation(keyAnnotations, matrixKey, data)` → 新 keyAnnotations（イミュータブル）
- `clearAnnotation(keyAnnotations, matrixKey)` → 新 keyAnnotations（イミュータブル）
- `hasAnnotation(keyAnnotations, matrixKey)` → boolean
- `getAnnotatedKeys(keyAnnotations)` → string[]

**テストファイル `test/utils/keyAnnotations.test.js` を必ず作成すること（AGENTS.md のルール）。**

---

#### [NEW] `js/components/KeyAnnotationModal.js`

```js
export function KeyAnnotationModal({
  isLightApp,
  matrixKey,
  currentAnnotation,  // null = 新規
  onSave,   // ({ customText, description, iconKey }) => void
  onClear,  // () => void
  onClose,  // () => void
})
```

UI: フルスクリーンオーバーレイ（backdrop blur）、`customText` input、`description` textarea、
アイコン選択エリア（「将来実装予定」の無効化表示）、削除/キャンセル/保存ボタン。
既存 DeviceSlot 設定パネルの Tailwind スタイルに準拠。

---

#### [NEW] `js/components/KeyCalloutOverlay.js`

```js
export function KeyCalloutOverlay({
  keys,           // Keyboard から onKeysChange で受け取った filteredKeys
  keyAnnotations,
  scaleMetrics,   // { finalScale, maxWidth, maxHeight, containerWidth }
  svgWidth,       // kbd-area の実際の幅
  svgHeight,      // kbd-area の実際の高さ
  isLight,
  isAppDark,
})
```

配置: `position:absolute, top:0, left:0, width:'100%', height:'100%', pointerEvents:'none'`
座標計算・フォールバック: 前述の「コールアウト配置ロジック」を参照。

**スタイル仕様**:

フォント: `'Outfit', 'Noto Sans JP', sans-serif`

| 要素 | Dark | Light |
|---|---|---|
| テキストボックス背景 | `rgba(15,23,42,0.92)` | `rgba(255,255,255,0.95)` |
| テキストボックス枠線 | `rgba(100,116,139,0.6)` | `rgba(148,163,184,0.8)` |
| テキスト色 | `#e2e8f0` | `#1e293b` |
| 引き出し線色 | `rgba(100,116,139,0.7)` | `rgba(148,163,184,0.9)` |

引き出し線: `strokeWidth:1.5`、`strokeDasharray:"4 3"`（破線）
テキストボックス（`foreignObject` 内 `div`）: `width:140px; height:60px; padding:6px 8px; border-radius:8px; overflow:hidden`
`customText`: `font-size:9px; font-weight:700; line-height:1.3; margin-bottom:2px`
`description`: `font-size:8px; font-weight:400; opacity:0.8; line-height:1.3`

---

### 変更ファイル

#### [MODIFY] `js/app.js`

1. `createEmptyDevice()` に `keyAnnotations: {}` を追加
2. `const [showCallouts, setShowCallouts] = useState(false);` を追加
3. `handleShare` の `shareData` は変更不要（`keyAnnotations` を URL 共有に含めない）
4. URL `?data=` 復元時、`keyAnnotations: saved.keyAnnotations || {}` で初期化
5. `Header` に `showCallouts` と `onToggleCallouts: () => setShowCallouts(v => !v)` を渡す
6. `DeviceSlot` に `showCallouts` と `onToggleCallouts` を渡す

---

#### [MODIFY] `js/components/Header.js`

- props: `showCallouts`, `onToggleCallouts` を追加
- 既存アクションボタン群に「CALLOUTS」トグルボタンを追加（アクティブ時は青系ハイライト）

---

#### [MODIFY] `js/components/DeviceSlot.js`

**props 追加**: `showCallouts`, `onToggleCallouts`

**ステート追加**:
```js
const [annotatingKey, setAnnotatingKey] = useState(null);
const [localScaleMetrics, setLocalScaleMetrics] = useState(null);
const [localFilteredKeys, setLocalFilteredKeys] = useState([]);
```

**インポート追加**:
```js
import { setAnnotation, clearAnnotation } from '../utils/keyAnnotations.js';
import { KeyAnnotationModal } from './KeyAnnotationModal.js';
import { KeyCalloutOverlay } from './KeyCalloutOverlay.js';
```

**ハンドラ追加**:
```js
const handleAnnotationSave = (data) => {
  onUpdateDevice(dev.id, {
    keyAnnotations: setAnnotation(dev.keyAnnotations || {}, annotatingKey, data)
  });
  setAnnotatingKey(null);
};
const handleAnnotationClear = () => {
  onUpdateDevice(dev.id, {
    keyAnnotations: clearAnnotation(dev.keyAnnotations || {}, annotatingKey)
  });
  setAnnotatingKey(null);
};
```

**`Keyboard` 呼び出しに追加**:
```js
keyAnnotations: dev.keyAnnotations || {},
showCallouts,
onAnnotateKey: (matrixKey) => setAnnotatingKey(matrixKey),
onScaleMetricsChange: (metrics) => {
  setLocalScaleMetrics(metrics);
  onScaleMetricsChange(metrics);  // 上位ハンドラも呼ぶ
},
onKeysChange: setLocalFilteredKeys,
```

**`kbd-area` div に `position: 'relative'` を追加**（className に `relative` を追加するか style で指定）。

**`KeyCalloutOverlay` のレンダリング** (`kbd-area` の children に追加):
```js
showCallouts && localScaleMetrics && localFilteredKeys.length > 0 &&
  createElement(KeyCalloutOverlay, {
    key: 'callout-overlay',
    keys: localFilteredKeys,
    keyAnnotations: dev.keyAnnotations || {},
    scaleMetrics: localScaleMetrics,
    isLight,    // dev.theme と appTheme から計算
    isAppDark,
  })
```

`annotatingKey` が非 null の場合、`KeyAnnotationModal` をレンダリング。

---

#### [MODIFY] `js/components/Keyboard.js`

**props 追加**: `keyAnnotations = {}`, `showCallouts = false`, `onAnnotateKey = null`, `onKeysChange = null`

**`filteredKeys` 変化を通知**:
```js
useEffect(() => {
  if (typeof onKeysChange === 'function') onKeysChange(filteredKeys);
}, [filteredKeys, onKeysChange]);
```

**`onScaleMetricsChange` に `containerWidth` を追加**:
```js
useEffect(() => {
  if (typeof onScaleMetricsChange === 'function') {
    onScaleMetricsChange({
      autoFitScale, finalScale, maxWidth, maxHeight,
      containerWidth: containerRef.current?.getBoundingClientRect().width ?? 0,
    });
  }
}, [autoFitScale, finalScale, maxWidth, maxHeight, onScaleMetricsChange]);
```

**`Keycap` 呼び出しに追加**:
```js
matrixKey: mK,  // k.matrix ? `${k.matrix[0]},${k.matrix[1]}` : k.id
annotation: keyAnnotations[mK] || null,
onAnnotateKey,
```

**`overflow-hidden` の変更は不要。`KeyCalloutOverlay` の import も不要。**

---

#### [MODIFY] `js/components/Keycap.js`

**props 追加**: `matrixKey`, `annotation`, `onAnnotateKey`

ルート div の props に追加:
```js
onContextMenu: (e) => {
  if (onAnnotateKey) { e.preventDefault(); onAnnotateKey(matrixKey); }
},
```

アノテーション設定済みインジケータ（キー右上の青点）:
```js
annotation && (annotation.customText || annotation.description) &&
  createElement('div', {
    style: {
      position: 'absolute', right: '4px', top: '4px',
      width: '5px', height: '5px', borderRadius: '50%',
      backgroundColor: '#60a5fa', zIndex: 50, pointerEvents: 'none',
    },
  })
```

`buildStandardKeyTooltip` の呼び出しに `annotation` を第5引数として追加。

**エンコーダーキー対応** (`renderEncoderKeycap` をラッパー div で包む):
```js
if (k.isEncoder) {
  return createElement('div', {
    key: 'encoder-wrapper',
    style: { position: 'relative' },
    onContextMenu: (e) => {
      if (onAnnotateKey) { e.preventDefault(); onAnnotateKey(matrixKey); }
    },
  }, [
    renderEncoderKeycap({ ... }),
    annotation && (annotation.customText || annotation.description) &&
      createElement('div', {
        key: 'annotation-dot',
        style: {
          position: 'absolute', right: '4px', top: '4px',
          width: '5px', height: '5px', borderRadius: '50%',
          backgroundColor: '#60a5fa', zIndex: 50, pointerEvents: 'none',
        },
      }),
  ]);
}
```

> [!WARNING]
> `keycapEncoder.js` の最外要素の `position` スタイルを事前確認し、ラッパー div のスタイルを調整すること。

---

#### [MODIFY] `js/components/keycapTooltip.js`

`buildStandardKeyTooltip` に `annotation = null`（第5引数）を追加:

```js
export function buildStandardKeyTooltip(
  code, keyStyle = 'Windows', macros = [], inspectorData = null, annotation = null
) {
  const lines = [];
  if (annotation) {
    if (annotation.customText) lines.push(`📌 ${annotation.customText}`);
    if (annotation.description) lines.push(`   ${annotation.description}`);
    if (annotation.customText || annotation.description) lines.push('');
  }
  // 以降は既存ロジックをそのまま維持
  ...
}
```

---

#### [MODIFY] `index.html`

Outfit の Google Fonts リンク近くに追加:
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
```

---

## 実装フェーズ（タスクリスト）

### フェーズ 1: データ構造とロジック基盤
- [ ] `js/utils/keyAnnotations.js` 新規作成（全5関数）
- [ ] `test/utils/keyAnnotations.test.js` 新規作成
- [ ] `js/app.js`: `createEmptyDevice()` に `keyAnnotations: {}` 追加
- [ ] `js/app.js`: `showCallouts` ステート追加
- [ ] `js/app.js`: URL 復元時の `keyAnnotations: {}` 初期化
- [ ] `npm run test` で既存テストが通ることを確認

### フェーズ 2: ツールチップ統合
- [ ] `js/components/keycapTooltip.js`: `annotation` パラメータ追加
- [ ] `js/components/Keyboard.js`: 新規 props 追加・`onKeysChange`・`containerWidth` 拡張・Keycap 受け渡し
- [ ] `js/components/Keycap.js`: 新規 props 追加・ツールチップ呼び出し更新
- [ ] `npm run lint` 確認

### フェーズ 3: アノテーション編集 UI
- [ ] `js/components/KeyAnnotationModal.js` 新規作成
- [ ] `js/components/Keycap.js`: 右クリック・インジケータ・エンコーダーラッパー追加
- [ ] `js/components/DeviceSlot.js`: `annotatingKey` ステート・ハンドラ・モーダル表示追加
- [ ] ローカルサーバーで確認: 右クリック → モーダル → 保存 → ツールチップ確認

### フェーズ 4: コールアウトオーバーレイ
- [ ] `index.html`: Noto Sans JP リンク追加
- [ ] `js/components/KeyCalloutOverlay.js` 新規作成
- [ ] `js/components/DeviceSlot.js`: `localScaleMetrics`・`localFilteredKeys` ステート追加・`KeyCalloutOverlay` 組み込み・`kbd-area` に `relative` 追加
- [ ] ローカルサーバーで確認: 引き出し線表示・左右フォールバック・スケール追従

### フェーズ 5: ヘッダートグルと仕上げ
- [ ] `js/components/Header.js`: CALLOUTS トグルボタン追加
- [ ] `js/app.js`: Header・DeviceSlot への props 渡し完成
- [ ] `npm run lint` と `npm run test` で全通過確認

### フェーズ 6: 最終検証
- [ ] Light / Dark テーマ両方でコールアウトが適切に見える
- [ ] スケール変更時にコールアウトがキーと連動する
- [ ] 左右フォールバック（下方向配置）が正しく動作する
- [ ] ページリロード後も localStorage からアノテーションが復元される
- [ ] `sample_numpad.json`・`sample_tkl_jp.json` で手動確認
- [ ] エンコーダーキーにもアノテーション設定・表示が動作する
- [ ] **EXPORT 時にコールアウトが画像に含まれないことを確認**
- [ ] **隣 DeviceSlot へのはみ出しがないことを確認（stack / grid 両レイアウト）**
- [ ] **ウィンドウを狭めた際に横スクロールバーが出ないことを確認**

---

## 注意事項

> [!NOTE]
> **`overflow-hidden` は一切変更しない。** 新アーキテクチャにより変更不要。

> [!WARNING]
> `Keyboard.js` の `onScaleMetricsChange` に `containerWidth` を追加すると `app.js` の
> `slotScaleMetricsRef` の形が変わる。`followScale` 機能（`handleMatchKeySize` 等）が
> `containerWidth` を誤使用しないよう確認すること。

> [!WARNING]
> `keycapEncoder.js` の最外要素の `position` スタイルを確認してからエンコーダーラッパーを実装すること。

> [!NOTE]
> `foreignObject` はモダンブラウザで問題なく動作する。新アーキテクチャでは export 用 `Keyboard` に
> `KeyCalloutOverlay` が関与しないため、エクスポートへの影響は発生しない。

> [!NOTE]
> `keyAnnotations.js` は純粋ロジックのため `test/utils/keyAnnotations.test.js` を必ず作成すること。

---

最終更新: 2026-06-01
策定者: AI Agent（アノテーションボックス自動拡張バグ修正設計追加）
実装担当: 別エージェント

---

## 【追加設計】アノテーションボックスの動的自動サイズ調整とクリッピング問題の解消

レビュー担当者からの指摘に基づき、アノテーションボックスのテキストが途中で見切れる問題を以下の設計で解消します。

### 1. 問題の原因分析
- 日本語などの長文テキストや複数行のテキストを設定した場合、従来の固定サイズ（`FO_HEIGHT = 200px`）ではボックス全体の高さが足りず、下部が見切れてしまうケースがありました。
- また、`y` 座標が負になるケース（キーボード上部のキーなど）において、SVG コンテナ自体の `overflow: hidden` （ブラウザのデフォルト挙動）や `foreignObject` 自体の境界によってクリップされることがありました。

### 2. 解決策設計（十分に大きな描画領域の確保と CSS `fit-content` の活用）
レビューでの提案通り、「十分に大きな描画領域を確保した上で CSS `fit-content` 等を用いて背景枠を描画する」アプローチを採用します。

1. **`foreignObject` の描画領域（Viewport）の大幅な拡張**
   - 従来の `FO_WIDTH = 280`, `FO_HEIGHT = 200` を、**`FO_WIDTH = 360`**, **`FO_HEIGHT = 380`** に大幅に拡張します。
   - これにより、20〜30行の長文説明であってもスクロールバーを出さずに完全に表示できる領域を確保します。

2. **SVG コンテナおよび `foreignObject` への `overflow: visible` 設定**
   - `KeyCalloutOverlay.js` が生成する `svg` 要素、および `<foreignObject>` 要素の双方の `style` に **`overflow: 'visible'`** を明示的に追加します。
   - これにより、キーボードの最上部/最下部付近でアノテーションボックスが SVG の物理境界（`height` や `top`）をわずかに超えてはみ出した場合でも、ブラウザがクリップせずに全体を美しく描画します。

3. **テキストボックスの最大幅の調整**
   - テキストボックスの `maxWidth` を従来の `200px` から **`240px`** に拡大し、より多くの文字を横方向に収められるようにします。これにより縦方向の不必要な行数を抑え、バランスの良い premium なカードアスペクト比を維持します。

4. **動的接続点（コネクション）の維持**
   - 描画領域を拡張しても、従来の「Flexbox による縦横アライメント」を維持するため、引き出し線の端点（`lineEndX`）とテキストボックスの接続位置はピクセル単位で正確に維持されます。
     - 左側：`alignItems: 'flex-end'`（右端を dashed line に吸い付かせる）
     - 右側：`alignItems: 'flex-start'`（左端を dashed line に吸い付かせる）
     - 上下：`justifyContent: 'center'`（テキスト量に応じたカードの縦方向中心に dashed line が完璧に一致する）

### 3. KeyCalloutOverlay.js の変更詳細

```js
// foreignObject container sizes
const FO_WIDTH = 360;  // 320から360に拡張し十分な余白を確保
const FO_HEIGHT = 380; // 200から380に大幅拡張し、長文対応

...

// SVGルート要素のスタイル
style: {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: `${svgHeight}px`,
  pointerEvents: 'none',
  zIndex: 50,
  overflow: 'visible', // ← 追加：SVGの境界外でもクリップさせない
}

...

// foreignObject要素
createElement(
  'foreignObject',
  {
    key: 'box',
    x: c.boxX,
    y: c.boxY,
    width: FO_WIDTH,
    height: FO_HEIGHT,
    style: {
      overflow: 'visible', // ← 追加：foreignObjectの境界外でも念のためクリップさせない
    }
  },
  ...
  // 内側のテキストボックス div
  style: {
    width: 'fit-content',
    maxWidth: '240px', // ← 200pxから240pxに拡張（横方向のバランス改善）
    height: 'fit-content',
    ...
  }
)
```
