# Unified Key Edit Modal Progress

## 目的
- アノテーション編集とマクロ別名編集の入口を左クリックに統一する
- キーごとの編集体験を単一モーダルへ集約する

## 現状確認
- `Keycap.js` / `keycapEncoder.js`
  - `MACRO(n)` キーのみ左クリックで `onMacroClick`
  - 注釈編集は右クリックで `onAnnotateKey`
- `MacroModal.js`
  - マクロ一覧または単一マクロの alias 編集を担当
- `KeyAnnotationModal.js`
  - 注釈入力のみを担当

## 合意した方向性
- 左クリックで単一のキー編集モーダルを開く
- アノテーション欄は常に表示
- そのキーが `MACRO(n)` の場合のみ alias フィールド等を追加表示
- 右クリック導線は廃止

## 実装前の計画メモ
- まずは既存 `MacroModal` を完全廃止せず、全マクロ一覧編集 UI として残す方針が安全
- 個別キーからの alias 編集は統合モーダルで扱う
- 必要なら統合モーダル内から既存 `MacroModal` へ遷移する補助導線を残す

## 状態
- 2026-06-01: 現行導線を確認し、実装計画を `implementation_plan.md` に追記
- 2026-06-01: 専用ブランチ `feature/unified-key-edit-modal` を作成
- 2026-06-01: `KeyAnnotationModal` 拡張による統合モーダル化、`MacroModal` は全体一覧用として残す方針で実装開始
- 2026-06-01: `Keycap` / `keycapEncoder` の左クリックを統合モーダル起動へ変更、右クリック導線を廃止
- 2026-06-01: `DeviceSlot` のモーダル state をキー編集用に拡張し、注釈保存と macro alias 保存を同時処理化
- 2026-06-01: `KeyAnnotationModal` に macro alias フィールド、本文表示、`Open Macro` 導線を追加
- 2026-06-01: `npm run test` 成功 (`72 passed`)、`npm run lint` 成功 (`0 errors / 10 warnings`)
