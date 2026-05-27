# Issue Draft: RGB Mode キーのアイコン・専用表示対応

## 概要

WebHID 経由のマッピング読込で `RGB_M_P` / `RGB_M_B` / `RGB_M_R` などの QMK / VIA 公式キーコードは正しく復元されるようになったが、これらのキーにはまだ専用アイコンや整った表示ラベル割り当てが不足している。

本セッションではキーコード復元と VIA 準拠の表記合わせを優先し、視覚表現の改善はスコープ外としたため、別 Issue として追跡する。

## 背景

- Keychron Q0 Plus の接続読込で `RGB M P` などの表示不一致があった
- 原因は `QK_LIGHTING` 範囲の誤読で、これは修正済み
- ただし `RGB_M_*` 系は、既存の `KC_RGB_*` 系のようなアイコン・下部ラベル設計にまだ十分乗っていない

## 対象候補

- `RGB_M_P`
- `RGB_M_B`
- `RGB_M_R`
- `RGB_M_SW`
- `RGB_M_SN`
- `RGB_M_K`
- `RGB_M_X`
- `RGB_M_G`
- `RGB_M_T`
- `RGB_M_TW`

## やりたいこと

- `RGB_M_*` 系キーの表示方針を決める
- 必要なら `js/keymap-dictionary.js` に専用の短縮表示や説明を追加する
- 必要なら `js/components/keycapIconUtils.js` にカテゴリ別ラベルルールを追加する
- 必要なら `js/icons/` と `js/svg-icons.js` 系の流れで専用 SVG を追加する
- JSON 読込時と WebHID 読込時で見え方が揃うことを確認する

## 受け入れ条件

- `RGB_M_*` 系キーが 16 進数や暫定文字列ではなく、意図した UI 表現で表示される
- `Fluent` / `Text` の両モードで破綻しない
- 既存の `KC_RGB_*` 系表示と見た目の整合が取れている

## 補足

GitHub CLI の認証トークンが現在無効なため、このメモは GitHub Issue の下書きとして repo 内に保存した。
