# 実装計画 - Issue #4: RGB Mode キーのアイコン・専用表示対応

## 概要

WebHIDやJSONからロードされた QMK / VIA 公式の `RGB_M_*`（RGBアニメーションモード直接指定）系キーコード（10種類）について、他の `KC_RGB_*` コントロールキー（`KC_RGB_MOD` など）と同様に、美しいパレット風アイコンと整った下部表示ラベルでレンダリングされるように対応します。

ユーザーのご要望に基づき、表示されるテキストは `FLUENT`（アイコン）モードと `TEXT` モードのどちらでも **`"MODE P"`**, **`"MODE B"`** などの `"MODE <一文字>"` 形式（`RGB_M_SW`, `RGB_M_TW` は `"MODE SW"`, `"MODE TW"`）にします。

## ユーザー確認・レビュー必要事項

> [!NOTE]
> TEXTモード時も `MODE P` などの表示になりますが、文字数が多い（特に `MODE SW`, `MODE TW` など）ため、表示エリアからはみ出す可能性があります。
> 実装および動作確認完了後、ユーザーに実際の画面の見た目を確認していただき、フォントサイズやレイアウトの調整指示をいただきます。

## 提案する変更と現在のステータス

すでに以下の変更を実装し、構文エラーがないことを確認済みです。

---

### 1. [MODIFY] [rgb.js](file:///c:/Git/KeymappingViewer/js/icons/rgb.js) (実装完了)

`RGB_ICONS` に `KC_RGB_M_*` 系キーコード（10種類）の定義を追加しました。
各キーは「RGBモード」を操作するものであるため、統一感と判別のしやすさを考慮し、`KC_RGB_MOD` と同一の「ペイントパレット」風のSVGアイコンを流用して定義しました。

* **対象キーコード**:
  * `KC_RGB_M_P` (Plain) -> `"MODE P"`
  * `KC_RGB_M_B` (Breathe) -> `"MODE B"`
  * `KC_RGB_M_R` (Rainbow) -> `"MODE R"`
  * `KC_RGB_M_SW` (Swirl) -> `"MODE SW"`
  * `KC_RGB_M_SN` (Snake) -> `"MODE SN"`
  * `KC_RGB_M_K` (Knight) -> `"MODE K"`
  * `KC_RGB_M_X` (Xmas) -> `"MODE X"`
  * `KC_RGB_M_G` (Gradient) -> `"MODE G"`
  * `KC_RGB_M_T` (Test) -> `"MODE T"`
  * `KC_RGB_M_TW` (Twinkle) -> `"MODE TW"`

---

### 2. [MODIFY] [keymap-dictionary.js](file:///c:/Git/KeymappingViewer/js/keymap-dictionary.js) (実装完了)

`KeymapDictionary.keys` 内 of `KC_RGB_M_*` 系の定義を更新し、Webフォント（Fluent）表示モード用の `fluent` プロパティ（`\uF2F6`：パレット風アイコン）を追加し、テキストを `"MODE P"` 〜 `"MODE TW"` に書き換えました。

---

### 3. [MODIFY] [keycapIconUtils.js](file:///c:/Git/KeymappingViewer/js/components/keycapIconUtils.js) (実装完了)

`RGB_LABELS` に定義されている各キーコードに対応するラベルを `"MODE P"` などの新しい形式に更新しました。

---

## 期待される効果と挙動

1. **自動判定の有効化**:
   `js/components/keycapIconUtils.js` の既存ロジックにより、キーコードが `KC_RGB_` で始まり、かつ `isSVGAvailable` が `true` になるため、自動的に `isRGBKey` および `isRGBFluent` が `true` と判定されます。
2. **美しいUIの実現**:
   `Fluent` 表示モード時には、キーキャップの中央に「ペイントパレット」のSVGアイコンが描画され、下部に小さく `"MODE P"` などのモード名ラベルが整ってレンダリングされます（他の `KC_RGB_*` 系コントロールキーと完全に統一されたデザインになります）。
3. **Textモードとの整合**:
   `Text` 表示モードでも、`keymap-dictionary.js` の `text` 定義に従ってテキスト凡例が綺麗に収まります。

---

## 検証プラン

### 1. 静的検証 (実行済み・パス)
* 構文エラーチェック: `node --check js/icons/rgb.js`
* SVGモジュール検証スクリプト of 実行:
  ```bash
  node --input-type=module -e "import('./js/test-svg-validation.js')"
  ```
  *結果: 260個のアイコンが正常に検証され、rgbカテゴリが21個に増加したことを確認しました。*

### 2. UI表示検証 (未完了)
* ローカル開発サーバーを起動し、ブラウザでレイアウトを確認します。
* `Fluent` モードおよび `Text` モードのそれぞれで `"MODE P"` などの表示崩れがないか、特に `TEXT` モードにおける文字のはみ出しやサイズについて確認し、ユーザーの調整指示を待ちます。
