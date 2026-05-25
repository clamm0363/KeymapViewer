# 実装計画

## 目的

肥大化した `js/components/Keycap.js` を、既存挙動を保ちながら責務ごとに段階的に分割し、今後の SVG / 表示ロジック追加時に安全に修正できる状態へ近づける。

## 今回の修正ブランチ

- ブランチ名: `fix/svg-tooling-followup`

## 現状把握

- `Keycap.js` は 1500 行超で、キー判定、表示文言整形、スタイル計算、特殊カテゴリ SVG 描画、エンコーダ分岐、最終レンダリングを 1 ファイルで抱えている。
- すでに一度分割された形跡はあるが、特殊キーごとの SVG + 下部ラベル描画が横並びで重複しており、仕様差分の混入や修正漏れを起こしやすい。
- `RGB` `MAGIC` `WIRELESS` `WEB` `MOUSE` `MACRO` はほぼ同型の描画を個別実装しており、保守コストの割に差分が小さい。
- 既存 UI はユーザー側ブラウザで問題なしとの確認があるため、今回の優先事項は「見た目の変更」ではなく「ロジックの整理と重複除去」。

## 分割方針

- `Keycap.js` から純粋関数として切り出せるものを先に抽出する。
- 抽出先は責務単位で分ける。
  - `keycapStyles.js`: スタイル計算
  - `keycapIconUtils.js`: 表示ラベル整形、カテゴリ判定、SVG 表示条件判定
- `keycapRenderers.js`: SVG を使う共通レンダラー
- `keycapEncoder.js`: エンコーダ専用の tooltip / 見た目 / クリック処理
- `keycapSections.js`: `Layer` / `Mod` / 通常キー表示の専用 renderer
- 本体コンポーネント内では「条件分岐」と「レイアウト組み立て」に集中させる。
- 一度に大規模再設計はせず、まずは重複レンダリングの除去を優先する。

## 修正対象

- `js/components/Keycap.js`
  - ローカル helper を削減し、抽出済みモジュールを使うよう整理する。
  - 特殊カテゴリごとの SVG + 下部ラベル描画を共通レンダラーへ集約する。
  - 可能であれば通常 Fluent SVG 描画も共通 renderer を使う。
- `js/components/keycapStyles.js`
  - `Keycap.js` から移したスタイル計算関数を保持する。
- `js/components/keycapIconUtils.js`
  - ラベル短縮、カテゴリ判定、アイコン表示条件判定を保持する。
- `js/components/keycapRenderers.js`
  - 特殊カテゴリ向け共通描画関数、通常 SVG 描画関数を保持する。
- `js/components/keycapEncoder.js`
  - エンコーダ専用 UI を `Keycap.js` から分離する。
- `js/components/keycapSections.js`
  - `Layer` / `Mod` / 通常キー表示の分岐を `Keycap.js` から分離する。

## 実施済み

- [x] `Keycap.js` の肥大化要因を確認し、分割対象を洗い出す。
- [x] スタイル計算関数群を `keycapStyles.js` へ抽出する。
- [x] ラベル整形とカテゴリ判定を `keycapIconUtils.js` へ抽出する。
- [x] SVG レンダリングの共通 helper を `keycapRenderers.js` として作成する。
- [x] `Keycap.js` から抽出済み helper を import する形へ切り替える。
- [x] `displayRaw` 正規化やカテゴリ別表示状態判定を共通 utility 経由へ寄せる。
- [x] `RGB` `MAGIC` `WIRELESS` `WEB` `MOUSE` `MACRO` の重複 SVG 描画を共通レンダラーへ統合する。
- [x] 通常 Fluent SVG 描画を共通 inline renderer へ寄せる。
- [x] キー外枠スタイル計算を `keycapStyles.js` へ移す。
- [x] エンコーダ描画と tooltip 構築を `keycapEncoder.js` へ切り出す。
- [x] `Layer` / `Mod` / 通常キー描画を `keycapSections.js` へ切り出す。

## これからやること

- [ ] 分割後の helper 間依存が過剰になっていないかレビューする。
- [ ] 新規分割後のファイル群に対して構文チェックを実施する。
- [ ] 差分をレビューし、挙動変更のリスクが高い箇所を洗い出す。

## 完了条件

- `Keycap.js` から重複した特殊 SVG 描画ブロックが除去されている。
- `Keycap.js` からエンコーダ専用処理が分離されている。
- `Keycap.js` から `Layer` / `Mod` / 通常キー描画分岐が分離されている。
- 抽出した helper ファイルが責務ごとに分かれ、`Keycap.js` の見通しが改善している。
- 少なくとも構文チェックで新規分割ファイルと `Keycap.js` が正常に通る。
- 今後のカテゴリ追加や表示調整時に、共通部を 1 箇所修正すれば済む状態になっている。

## 注意点

- 挙動差分が出やすいのは `MAGIC` のようにラベルが動的計算されるキー、`Mod-Tap` や `Layer-Tap` など複合表示キー。
- UI の見た目変更は目的ではないため、共通化しても既存サイズ・位置・配色は基本的に維持する。
- `AGENTS.md` は未追跡のまま存在しているため、今回のコミット対象に含めない。
