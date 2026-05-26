# 実装計画

## 目的

QMK 公式ドキュメントの `Key` / `Aliases` / `Description` 情報を本サービス内へ取り込み、キーキャップのツールチップで表示できるようにする。
既存の「公式キーコードへ正規化して見せる」方針を維持しつつ、キーコードの意味がユーザーに伝わる情報設計へ拡張する。

## ブランチ

- `feature/qmk-via-official-keycodes`

## 今回の対象

- `js/keymap-dictionary.js`
- 追加データファイル
  - 例: `js/qmk-keycode-metadata.js` または `js/qmk-keycode-metadata.json`
- 必要に応じて生成スクリプト
  - 例: `scripts/extract-qmk-keycodes.js`
- `js/components/Keycap.js`
- `js/components/keycapEncoder.js`
- 必要に応じて tooltip 表示用の小さな共通 helper

## 今回の非対象

- SVG アイコンの新規追加
- キーキャップ本体のレイアウト刷新
- QMK 公式に存在しない独自キーコードへの説明文付与
- 多言語翻訳基盤の導入

## QMK 公式情報の前提

- QMK 公式 `Keycodes Overview` にはセクションごとに `Key` / `Aliases` / `Description` の表が存在する。
- 代表例
  - Mouse Keys
    - `QK_MOUSE_CURSOR_UP` / alias `MS_UP` / description `Mouse cursor up`
  - Quantum Keycodes
    - `QK_CLEAR_EEPROM` / alias `EE_CLR` / description `Reinitializes the keyboard's EEPROM (persistent memory)`
- Basic Keycodes は OS 列も持つが、今回の主眼はまず `Description` の取得と表示である。

## 現状認識

- 現在のツールチップはネイティブ `title` 属性ベースで、単一行または改行文字列を直接埋め込んでいる。
- 標準キーは `Keycap.js` で `title` にキーコード文字列を入れている。
- Encoder 系は `keycapEncoder.js` で複数行テキストを構築している。
- 公式キーコードへの正規化はすでに導入済みだが、意味説明のデータソースはまだ持っていない。
- `keymap-dictionary.js` は表示ラベル・icon・alias 解決を担っており、説明文まで混在させると責務が肥大化しやすい。
- Windows / Mac の `keyStyle` はキーキャップ表示には反映されているが、tooltip 文言はまだ OS モード連動していない。

## Tooltip 構造の方針

### 第1段階の推奨構造

- まずは既存の `title` ベースを維持し、内容だけ構造化する。
- 標準キーの tooltip は以下の 2 行構成を基本とする。
  - 1 行目: 正規のキーコード
  - 2 行目: QMK 公式 Description
- alias 入力だった場合のみ、必要に応じて 3 行目を追加する。
  - `Alias input: KC_TRNS`
- Description が無い場合は、無理に独自文言を生成せず、キーコードのみ表示する。

### Encoder の推奨構造

- 既存の方向別 tooltip を維持しつつ、各行を以下へ拡張する。
  - `UP: Volume Up (KC_AUDIO_VOL_UP)`
  - `Description: Audio volume up`
- ただし 1 行ごとに説明を増やすと縦に長くなりすぎるため、まずは次のどちらかで統一する。
  - 推奨案 A
    - 各行を `表示ラベル (正規キーコード)` に留める
    - 最上段または末尾に対象キーの Description を補足する
  - 推奨案 B
    - 各行を 2 行ブロック化する
- 初回実装では案 A を優先する。
  - 理由: ネイティブ `title` の可読性限界に収まりやすい。

### 将来の拡張余地

- ネイティブ `title` ではレイアウト制御が弱いため、将来的にはカスタム tooltip コンポーネントへ移行できる構造にしておく。
- そのため、UI 文字列はコンポーネント内で直接組み立てず、`tooltip model` を返す helper を用意する。

## データ構造の方針

### 推奨配置

- QMK 公式 metadata は `keymap-dictionary.js` から分離する。
- 候補
  - `js/qmk-keycode-metadata.js`
    - コメント付きで管理しやすい
  - `js/qmk-keycode-metadata.json`
    - 自動生成しやすい
- 今後の更新容易性を考えると、生成元は `json`、利用時は `js` import でもよい。

### 推奨スキーマ

- key を「公式の非エイリアス keycode」に統一した map を持つ。
- 値の最小構成
  - `description`
  - `aliases`
  - `section`
- 例
  - `QK_MOUSE_CURSOR_UP`
    - `description: "Mouse cursor up"`
    - `aliases: ["MS_UP"]`
    - `section: "Mouse Keys"`

### lookup 方針

- tooltip 表示前に、入力キーコードを既存の canonical 化ロジックで「公式表示 keycode」へ変換する。
- その結果を metadata lookup key に使う。
- ただし現在の canonical が `KC_*` 系へ寄る箇所と、公式表の `QK_*` / 長名 `KC_*` へ寄せる箇所が混在するため、tooltip 用 metadata lookup は以下の二段構えにする。
  1. `toCanonicalKeycodeDisplay()` の結果で引く
  2. 必要なら内部 canonical から公式表示 key へ変換する補助 map で引く

## データ取得方式の方針

### 推奨案

- QMK docs からの抽出はオフライン生成スクリプトで行い、成果物を repo にコミットする。
- 実行時に docs へアクセスする構造にはしない。

### 理由

- ツールチップ表示のたびに外部依存させたくない。
- GitHub Pages 配信やローカル利用で安定する。
- QMK docs の更新取り込みも「生成スクリプト再実行 + 差分確認」で管理しやすい。

### 生成スクリプトの責務

1. QMK docs の対象ページを入力として受ける。
2. 表から `Key` / `Aliases` / `Description` を抽出する。
3. セクション名付き metadata を生成する。
4. 既存の alias 解決ルールと照合し、未対応の keycode を洗い出せるようにする。

## 実施手順

1. tooltip に必要な metadata スキーマを定義する。
2. QMK 公式 docs の表構造に合わせた抽出元フォーマットを決める。
3. metadata ファイルの置き場所と import 経路を確定する。
4. tooltip 用の metadata lookup helper を実装する。
5. tooltip helper に `keyStyle` を通し、OS 依存語彙を動的化する。
6. 標準キー tooltip を 2 行構成へ更新する。
7. Encoder tooltip は既存構造を保ったまま、正規 keycode と Description を段階的に追加する。
8. Description 未登録時のフォールバックを決める。
9. 代表キーで静的確認を行う。

## 確認観点

- `QK_MOUSE_CURSOR_UP`
  - keycode と description が正しく出ること
- `QK_CLEAR_EEPROM`
  - alias 入力でも official key と official description が出ること
- `KC_TRANSPARENT`
  - `TRNS` 入力時でも tooltip が official key 基準で表示されること
- `KC_AUDIO_VOL_UP`
  - `KC_VOLU` 入力時でも official description に到達できること
- `KC_LEFT_GUI` / `LGUI_T(KC_TAB)` / `MT(MOD_LALT, KC_ESC)`
  - Windows と Mac で tooltip 説明文が適切に変化すること
  - Windows では `GUI` ではなく `Win` 表記になること
- `MACRO(n)`
  - ツールチップにマクロ内容が自然言語の英語で表示されること
- Description 未登録のキー
  - ツールチップが壊れず、キーコードのみで成立すること
- Encoder tooltip
  - 高さが過剰にならず、主要情報が読めること

## 完了条件

- QMK 公式 Description をローカルデータとして参照できる。
- 標準キー tooltip に official keycode と official description が表示される。
- alias 入力でも official keycode / description へ一貫して到達できる。
- Windows / Mac モード切替に応じて tooltip 文言が追従する。
- tooltip 文言生成がコンポーネント直書きではなく、再利用可能な helper 経由になっている。
- 今後の QMK docs 更新を追従しやすい構造になっている。
