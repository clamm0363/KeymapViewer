# 実装計画

## 目的

QMK / VIA の正式キーコードについて、TEXT / FLUENT の両モードで表示が崩れないようにする。今回は特に `KC_MS_UP` などの正式マウスキーで SVG アイコンが欠ける問題と、`KC_GRV` / `KC_EQL` などの記号キーが略称表示になる問題を修正する。

## 今回の対象

- `js/keymap-dictionary.js`
- `js/components/keycapIconUtils.js`
- `js/components/keycapStandardSection.js`
- `js/utils/labelParser.js`

## 現状把握

- `KC_MS_UP` などは TEXT モードでは正しく見えるが、FLUENT モードでは SVG icon key への正規化が不十分だと欠落する。
- `KC_GRV` や `KC_EQL` などは辞書の汎用フォールバックが先に働き、最終的な記号変換よりも `GRV` / `EQL` が優先されてしまう。
- さらに、カテゴリ別の下ラベル付き SVG 描画では canonical key ではなく生の `displayRawForRGB` を渡しており、`KC_MS_UP` のような正式名がそこで再び取りこぼされている。

## 方針

- SVG 解決前に、辞書と同じ alias 正規化を通して canonical key へ寄せる。
- 記号キーは辞書側のフォールバックでも必ず記号を返せるよう、短縮形 canonical key も明示的にシンボルへ対応付ける。
- 代表的な `KC_MS_*` と `KC_GRV` / `KC_EQL` などで両モードの表示を検証する。

## 実施手順

1. マウス系正式名の SVG 解決と記号キーのテキスト解決を再確認する。
2. 必要な正規化と記号マッピングを辞書・描画側へ反映する。
3. `KC_MS_*` と `KC_GRV` / `KC_EQL` などで表示結果を検証する。

## 実施済み

- [x] SVG 解決経路で canonical 化されていない箇所を確認した。
- [x] `keycapIconUtils.js` などに alias 正規化を適用した。
- [x] 記号キーの短縮 canonical key を辞書側でシンボル表示へ統一した。
- [x] 下ラベル付き SVG 描画でも canonical icon key を使うよう統一した。
- [x] `KC_MS_*` と `KC_GRV` / `KC_EQL` などで表示結果を再検証した。

## 完了条件

- `KC_MS_BTN1`、`KC_MS_UP`、`KC_MS_LEFT` などの正式名で正しい SVG アイコンが出る。
- `KC_GRV`、`KC_EQL`、`KC_MINS` などが略称ではなく記号で表示される。
- エイリアス名と正式名で同じ icon key / 表示テキストに解決される。
- 代表キーコードの静的検証が通る。
