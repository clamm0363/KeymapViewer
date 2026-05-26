# 実装計画

## 目的

Playwright MCP を用いて、`http://127.0.0.1:5501/` で提供されている KeymapViewer の現在実装について、主要なブラウザ表示に破綻がないかを確認する。
今回は機能追加や修正ではなく、表示健全性の確認と、今後の回帰確認に再利用できるテスト観点の整理を主目的とする。

## 前提

- 対象 URL: `http://127.0.0.1:5501/`
- テスト手段: Playwright MCP
- 既知の React `key` 警告と Tailwind CDN 警告は、今回の表示確認では既知の非ブロッカーとして扱う
- 既存コードや既存データの修正は、表示上の重大な問題を発見した場合のみ別途提案する

## 今回の対象

- 初期表示が成立するか
- 既定サンプル 5 スロットの描画が成立するか
- グローバル表示切替
  - `STACK` / `GRID`
  - アプリ全体のテーマ切替
- スロット単位の表示切替
  - `Fluent` / `Text`
  - `Dark` / `Light` / `System`
  - `Windows` / `Mac`
- 代表的な表示パターン
  - 通常キー
  - Fluent SVG アイコンキー
  - レイヤーキー
  - Mod-Tap / Layer-Tap 系
  - 日本語配列キー
  - Encoder 表示
  - ツールチップ文言

## 今回の非対象

- 既知の軽微コンソール警告の解消
- Export のダウンロード成否の厳密検証
- Share URL のクリップボード書き込み成否の厳密検証
- 手動ドラッグ操作の体験評価
- ブラウザ差異の比較

## テスト方針

1. まず初期ロードと 5 サンプル自動読込の成立を確認する。
2. 次にヘッダの全体切替が表示を壊さないことを確認する。
3. その後、各サンプルの特性ごとに重点ケースを回す。
4. 取得できるものは DOM / accessibility snapshot / title 文言で確認し、視覚依存の箇所はスクリーンショットも補助的に残す。
5. 問題があれば「再現手順」「影響範囲」「重篤度」を添えて記録する。

## テスト観点

### 1. 初期表示

- ページタイトルが正しい
- ヘッダとフッタが描画される
- スロットが 5 件表示される
- サンプル名が期待どおり読み込まれる

### 2. グローバル操作

- `STACK` と `GRID` を切り替えても表示が崩れない
- アプリテーマ切替後もスロット内容が消えない

### 3. サンプル別重点確認

- Slot 1 `Sample Keyboard TKL (JP)`
  - JIS 特有キーが欠落せず描画される
  - 日本語配列ラベルや記号の表示が破綻しない
- Slot 2 `SAMPLE KEYBOARD (100%)`
  - Layer 1 の Fluent アイコン群が表示される
  - Layer 2 の Layer / Mod-Tap 系が表示される
  - Layer 3 の RGB / Wireless / Mouse 系が表示される
  - `KC_EE_CLR` 系の tooltip 文言が自然である
- Slot 3 `SAMPLE KEYBOARD (MAC)`
  - Mac スタイルで `Command` / `Option` 相当が適切に表示される
  - `MO(1)` などのレイヤーキーが破綻しない
- Slot 4 `SAMPLE NUMPAD`
  - Encoder を含む複数入力デバイス表示が成立する
  - ツールチップに Push / CW / CCW または方向別情報が出る
- Slot 5 `SAMPLE DUAL ENCODER`
  - Dual Encoder の表示が欠落しない
  - 片側がメディア、片側がホイール系でも文言が破綻しない

### 4. スロット設定切替

- `Fluent` / `Text` 切替で主要キー表示が成立する
- `Windows` / `Mac` 切替で修飾キーの表記が適切に追従する
- `Dark` / `Light` / `System` 切替で可読性が極端に落ちない

## 実施手順

1. Playwright でトップページへ接続する
2. 初期表示とサンプル読込完了を確認する
3. ヘッダの `GRID` / `STACK` とテーマ切替を確認する
4. 各スロットの代表レイヤーを巡回して title 文言と表示内容を確認する
5. 必要なスロットで `Display Settings` を開き、表示モードとスタイル切替を確認する
6. 結果を本ファイルに追記する

## 完了条件

- 重大な表示崩れの有無を報告できる
- 少なくとも 5 つの既定サンプルについて、主要表示パターンの健全性を確認できる
- 今後の再確認に使える観点が `implementation_plan.md` に残る

## 実施ログ

- 実施前
  - 計画を作成し、Playwright MCP によるブラウザ確認へ移行する
- 実施中
  - 初期ロードで 5 スロットの既定サンプル表示を確認した
  - `GRID` / `STACK` 切替後もヘッダ文言とスロット描画が維持されることを確認した
  - アプリ全体の `Light` / `Dark` 切替後も背景色とカード背景が追従し、内容欠落がないことを確認した
  - Slot 1 で `JP_ZKHK` `JP_YEN` `JP_MHEN` `JP_HENK` `JP_KANA` が描画されることを確認した
  - Slot 2 Layer 1 で System / Media / Brightness / Mission Control 系 tooltip が取得できることを確認した
  - Slot 2 Layer 2 で `MO` `LT` `LGUI_T` `MT` `MEH` `HYPR` 系 tooltip が自然文で成立することを確認した
  - Slot 2 Layer 3 で `KC_RGB_TOG` `KC_OUT_BT` `QK_MOUSE_CURSOR_UP` `QK_CLEAR_EEPROM` `KC_DM_REC1` の tooltip が取得できることを確認した
  - Slot 2 の `Text` / `Fluent` 切替と `Windows` / `Mac` 切替で、`WIN` 表記と `CMD` / `OPT` 表記の切替が成立することを確認した
  - Slot 3 で `Left Command` `Left Option` と `MO(1)` tooltip を確認し、Mac 既定サンプルが破綻していないことを確認した
  - Slot 4 / Slot 5 で encoder tooltip に Push / CW / CCW / 方向別文言が含まれることを確認した
  - フルページの確認用スクリーンショット `playwright-visual-check.png` を取得した

## 実施結果

### 合格観点

- ページ接続、初期ロード、5 スロット自動表示は正常
- 主要サンプル
  - JIS
  - 100% Windows
  - Mac
  - Numpad + Encoder
  - Dual Encoder
  について、重大なレイアウト崩れや表示欠落は確認できなかった
- tooltip は主要パターンで機能しており、説明文の自然さも概ね良好
- `QK_CLEAR_EEPROM` / `KC_EE_CLR` 系 tooltip は期待どおり official 名と説明文に到達している
- `Text` / `Fluent` と `Windows` / `Mac` の切替は表示上成立している

### 要注意事項

- 既知扱いの React `key` 警告は操作のたびに再出力される
- 既知扱いではないエラーとして、SVG path 不正が 1 件確認できた
  - エラー内容
    - `<path> attribute d: Expected number`
  - 該当箇所
    - `js/icons/wireless.js`
    - `ic_fluent_connector_24_regular`
  - 具体的には path 文字列中の `...H14.5059L14.505C14.505...` が不正
  - `js/keymap-dictionary.js` と `js/icons/aliases.js` から見て、影響候補は `KC_OUT_USB`
  - 今回の確認ではアプリ全体が壊れる挙動は見えなかったが、該当アイコン単体は欠損または不正描画の可能性がある

### 判定

- 全体判定: おおむね問題なし
- ただし `KC_OUT_USB` 系の SVG 定義不正は、次の小修正候補として切り出す価値がある

## 追加対応

- `js/icons/wireless.js` の `ic_fluent_connector_24_regular` を、ローカル upstream の Fluent SVG と照合した
- 不正箇所は `L14.505C...` ではなく `L14.5062 4.75139C...` であることを確認した
- 上記 path を修正し、`KC_OUT_USB` 系アイコンの描画エラー解消を試みる
- `node --check js/icons/wireless.js` は通過した
- Playwright で再読込後に Slot 2 Layer 3 を再表示し、`<path> attribute d: Expected number` が再発しないことを確認した
- `KC_OUT_USB` 要素は `title="KC_OUT_USB"` と `svgCount=1` で取得でき、描画経路が生きていることを確認した
- 4 スロット仕様と初期サンプル 5 件読込が不一致だったため、`js/app.js` の初期 `sampleFiles` を 4 件へ調整する
- 当面の初期サンプルは `sample_tkl_jp` `sample_100_win` `sample_hhkb_mac` `sample_numpad` の 4 件とする
- `node --check js/app.js` は通過した
- Playwright では保存済み `localStorage` により旧 5 スロット状態が復元されうることを確認した
- `localStorage` クリア後の再読込と待機後、初期表示が `Mode: STACK | 4 Slots` になり、見出しも 4 件であることを確認した
