# 実装計画

## 目的

ホバー中のキーについて、表示調整や辞書メンテに必要な内部情報をすぐ確認できる「簡易インスペクタ」を追加する。

- キーコード
- 解決後ラベル
- 入力コードと正規化後キーコード
- アイコン表示の有無と対象アイコンキー
- カテゴリ判定
- マクロ内容

今回のゴールは、既存の描画ロジックを壊さず、既存ツールチップの下部にデバッグ向け情報を追記できる状態にすること。

## 現状認識

- `js/components/Keycap.js`
  - `parseKeyLabel()` と `getIconRenderState()` を使い、キーごとの表示解決をほぼ完了させている
  - 既存の `title` にはツールチップ文字列を入れているが、構造化されたデバッグ情報の受け渡しはしていない
- `js/components/Keyboard.js`
  - キー配列生成と `Keycap` の反復描画を担当している
  - 現時点では tooltip 文字列の生成には関与していない
- `js/components/DeviceSlot.js`
  - スロット単位の設定 UI とキーボード領域を持っている
  - 今回の tooltip 追記案では新規 state を持たせずに済む可能性が高い
- `js/components/keycapTooltip.js`
  - 既存の tooltip 用に、マクロ内容の展開やキーコード説明の整形ロジックを持っている
- `js/keymap-dictionary.js`
  - `getKeycodeTooltipInfo()` により、正規化済みコード、説明、エイリアス情報を引ける
- `js/components/keycapIconUtils.js`
  - `getKeyCategory()` と `getIconRenderState()` により、カテゴリ判定と SVG / 下部ラベル系の判定を引ける

## 方針

### 1. インスペクタ情報の生成を tooltip 拡張用に一元化する

- `Keycap.js` ですでに算出している値を再利用し、キーごとの「インスペクタ用データ」を 1 つのオブジェクトへまとめる
- ただし `Keycap.js` に整形ロジックを増やしすぎないよう、純粋なデータ整形は `js/utils/` 配下へ逃がす
- 候補:
  - `js/utils/keyInspector.js`
  - もしくは `js/utils/keyInspectorData.js`

### 2. 表示先は既存 tooltip の下部に統合する

- 画面領域が厳しいため、独立した小パネルは追加しない
- 既存の `title` に入れている tooltip 文字列へ、セパレータを挟んでインスペクタ情報を追記する
- まずはブラウザ標準 tooltip を前提に、複数行文字列として自然に読める並びを優先する
- これにより `Keyboard` や `DeviceSlot` に hover 専用 state を持たせずに済む

### 3. tooltip 本文は「通常情報」と「デバッグ情報」を分離する

- 先頭には既存どおり `officialCode` や説明文、マクロ内容を残す
- その下に空行または罫線相当のセパレータ文字列を入れて、インスペクタ情報を追記する
- セパレータ候補:
  - `----`
  - `Inspector`
  - `DEBUG`
- 標準 tooltip は装飾できないため、記号と行順だけで読みやすさを確保する

### 4. 既存 tooltip / macro ロジックは再利用し、重複整形を避ける

- マクロ本文や説明文は `keycapTooltip.js` / `keymap-dictionary.js` の既存ロジックを活用する
- 追加のインスペクタ情報も、最終的には tooltip 用の複数行文字列へ整形する
- 項目順は固定し、比較時に視線移動が少なくなるようにする

## 予定する tooltip 追記項目

- `Input`
  - 元の入力コード。例: `EE_CLR`, `MACRO(3)`, `LCTL_T(KC_ESC)`
- `Official`
  - `getKeycodeTooltipInfo()` が返す正規化済みコード。例: `KC_EE_CLR`
- `Label`
  - 現在モードで最終的に採用された表示ラベル
- `Category`
  - `getKeyCategory()` によるカテゴリ。例: `QK`, `RGB`, `WIRE`, `MACRO`
- `Icon`
  - 対象アイコンキー、および SVG 表示中かどうか
- `Render`
  - `text`, `center-svg`, `icon-bottom-label` などの表示系
- `Bottom`
  - 下部ラベルやカテゴリキャプションがあれば表示
- `Macro`
  - 対象が `MACRO(n)` の場合、ID と内容を表示

## 変更対象

- `js/components/Keycap.js`
  - インスペクタ用データ生成呼び出し
- `js/components/keycapTooltip.js`
  - 既存 tooltip にインスペクタ情報を追記する整形処理の追加
- `js/components/Keyboard.js`
  - 原則変更なし、必要なら props 中継のみ
- `js/utils/`
  - インスペクタ用の純粋データ整形 helper を追加
- 必要に応じて
  - `js/components/keycapIconUtils.js`
  - `js/keymap-dictionary.js`

## 実装順

1. `Keycap.js` で利用中の表示解決値を棚卸しし、tooltip 追記に必要な最小データ構造を定義する
2. `js/utils/` にインスペクタ用データ整形 helper を追加する
3. `keycapTooltip.js` で既存 tooltip の下部へセパレータ付き情報を連結する
4. `Keycap.js` から新しい tooltip builder を呼ぶ
5. 複数種別のキーで tooltip の行数と読みやすさを確認する
6. `node --check` で関連ファイルの構文確認を行う

## 検証観点

- 通常キー、修飾キー、レイヤーキー、マクロキー、マウスキー、RGB キーで内容が破綻しない
- `Fluent` / `Text` 切替時に `Label` / `Icon` / `Render` 表示が追従する
- マクロキー hover 時に、マクロ ID と内容が確認できる
- `GRID` / `STACK` の両方で追加 UI を必要としない
- 標準 tooltip の文字量が極端に長くなりすぎない
- 既存のクリック動作
  - マクロキークリックで Macro Modal を開く
  - 既存 tooltip 表示
  が壊れない

## 現時点の判断

- まずは独立パネル案を採らず、既存 tooltip へ統合する
- 純粋ロジックは `js/utils/` に分け、表示コンポーネントに判定分岐を増やしすぎない
- 将来 tooltip では情報量が足りないと判明した場合のみ、専用 UI を再検討する
