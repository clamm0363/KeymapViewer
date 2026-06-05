# 実装計画

## 【計画】CALLOUT向けSVGアイコン置換機能（2026-06-05）

### 作業ブランチ
- `feature/callout-svg-icon-selector`

### 目的
- CALLOUT編集モーダルから、サービス内で利用可能なSVGアイコンを選択できるようにする
- 選択したSVGアイコンで、そのキーの現在表示内容を一時的に置き換えて表示できるようにする
- SVGアイコン置換を解除し、元のキー表示へ安全に戻せるようにする

### 現状整理
- `js/components/KeyAnnotationModal.js`
  - `iconKey` を保存する前提の props / submit 処理はあるが、UI は「将来実装予定」のプレースホルダになっている
- `js/utils/keyAnnotations.js`
  - `iconKey` を含む注釈データの正規化・保存・取得はすでに実装済み
- `js/components/DeviceSlot.js`
  - 注釈モーダルの保存結果を `setAnnotation(...)` へ流す配線はある
- `js/components/Keycap.js`
  - 注釈の存在はドット表示と hover 情報に使っているが、`iconKey` によるキー表示上書きは未実装
- `js/svg-icons.js`
  - `listSVGIcons()` で選択候補に使えるSVGアイコン一覧を取得できる

### 実装方針
- 保存データの主語は既存どおり `annotation.iconKey` とし、新しい永続化フォーマットは増やさない
- アイコン候補一覧は `listSVGIcons()` を起点に構築し、モーダル側では「選択中のアイコン」と「未設定」を扱えるUIにする
- キー表示の置換は `Keycap` 側で行い、通常の表示モデルを壊さず「注釈由来の上書き表示」を最優先で差し込む
- 解除時は `iconKey` を空文字へ戻し、既存の `parseKeyLabel` / display model の流れへ自然復帰させる
- 既存の `customText` / `description` / macro alias 保存フローは維持し、今回の変更範囲を注釈UIと表示分岐に絞る

### 実装ステップ
1. `KeyAnnotationModal` に SVG アイコン選択UIを追加する
2. アイコン候補一覧の生成方法を決める
3. 「未設定に戻す」操作をモーダル内で明示する
4. `onSave` で選択中 `iconKey` を既存の注釈保存フローへ流す
5. `Keycap` に注釈アイコン上書きの表示分岐を追加する
6. 上書き表示中でも既存の hover / annotation dot / callout との整合が崩れないか確認する
7. 必要なら encoder 系表示にも同じ注釈アイコン方針を適用するか切り分ける
8. `npm run lint` と `npm run test`、必要に応じて `node --check` で確認する

### ファイル別の想定変更
- `js/components/KeyAnnotationModal.js`
  - アイコン候補一覧
  - 選択状態の state 化
  - 選択解除UI
  - 保存時の `iconKey` 反映
- `js/components/Keycap.js`
  - 注釈アイコンが設定されている場合の表示上書き判定
  - 既存 display model と競合しない描画分岐の整理
- `js/components/keycapStandardSection.js`
  - 必要なら「注釈由来 iconKey」を受け取れるように調整
- `js/components/keycapRenderers.js`
  - 一覧プレビューや上書き表示で使い回せる描画 helper が不足していれば追加
- `js/components/keycapEncoder.js`
  - encoder にも同一仕様を適用する場合のみ追従
- `test/`
  - pure logic を切り出した場合は対応テストを追加

### 設計上の確認ポイント
- 「現在表示されている内容」との置換対象をどこまで含めるか
  - 通常キーのテキスト
  - Fluent/SVG アイコン表示
  - Mod/Layer の特殊レイアウト
- 注釈アイコン設定時に `customText` / `description` はそのまま併用できる前提でよいか
- 一覧候補数が多い場合、カテゴリ表示・検索・スクロールのどこまで今回入れるか
- icon alias を一覧へ含めるか、実体SVGのみを見せるか

### 推奨する実装の切り方
- まずは通常キーの `Keycap` 表示置換を最優先で成立させる
- Mod / Layer / Encoder の扱いは、現在の表示モデルとの衝突有無を見て段階適用にする
- 候補一覧UIは最初から凝りすぎず、選択・解除・現在値確認が確実にできる構成を優先する

### 検証方針
- `iconKey` 未設定時に既存表示が変わらないこと
- `iconKey` 設定時に、キー本体表示がSVGへ置き換わること
- `iconKey` を解除すると、元の文字または既存アイコン表示へ戻ること
- CALLOUTの有無に関わらず、注釈保存と再表示が崩れないこと
- レイヤー別注釈データで、別レイヤーへ副作用が出ないこと

### 実施メモ
- `listSVGIcons()` は一覧生成の起点に使えるが、UI向けには alias の扱いを整理した補助整形が必要になる可能性がある
- `hasAnnotation(...)` は現在 `customText` / `description` ベースなので、`iconKey` 単独注釈をどう見なすかは確認対象
- 実装前に、注釈アイコン上書きを `Keycap` 直書きで処理するか、`keycapIconUtils.js` 側へ寄せるかを決める
- 影響範囲が複数ファイルにまたがるため、実装着手前に最終方針をユーザー確認する

### 実装開始メモ
- 初回スコープは通常キーの `Keycap` 表示上書きに限定する
- `KeyAnnotationModal` は `listSVGIcons()` ベースの一覧選択 + 未設定解除を先に実装する
- 表示上書きは `buildStandardDisplayModel(...)` の結果を `Keycap` 内で薄く上書きし、既存の Mod / Layer 表示分岐は触らない

### 実施結果
- `KeyAnnotationModal` に SVG アイコン一覧、現在の上書き状態表示、`RESET` による解除操作を追加した
- `RESET` ボタンは視認性を上げるため、アクセント色付きの補助アクションとして強調した
- SVG アイコン一覧は、ラベル主体のカードからアイコン主体の高密度グリッドへ調整した
- SVG アイコン一覧に `ALL` と各カテゴリのフィルタタブを追加し、カテゴリ単位で絞り込めるようにした
- SVG アイコン一覧は alias / 別キーコード由来の重複をたたみ、同一実体アイコンを 1 回だけ表示するようにした
- Bluetooth / 2.4GHz / USB 系の接続アイコンは `keyboard` ではなく `connectivity` カテゴリへ整理した
- `Keycap` では、エンコーダ以外の全キーで `annotation.iconKey` が有効なSVGを指す場合に、キー種別に関係なく中央表示をそのSVGへ置き換えるようにした
- エンコーダではこの機能を使わない前提に合わせ、編集モーダルで SVG アイコン選択欄を非表示にした
- `iconKey` 単独の注釈でも編集済みと分かるよう、注釈ドット表示条件に `iconKey` を含めた
- `listSVGIcons()` 基準でカテゴリ未設定のSVGアイコンがないことを確認したため、今回のカテゴリデータ修正は不要だった
- `node --check js/components/KeyAnnotationModal.js`
- `node --check js/components/Keycap.js`
- `npm run lint`
- `npm run test`

### 今回あえて広げていない範囲
- Encoder の特殊レイアウトへの注釈アイコン置換
- SVG候補一覧の検索、カテゴリ絞り込み、alias 整理
- CALLOUT本文側での `iconKey` 表示ルール追加
