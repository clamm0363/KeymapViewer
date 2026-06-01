# CALLOUTS Layer Annotation Progress

## 目的
- レイヤー切替時に他レイヤーの注釈 callout / 注釈ドットが残る問題を修正する
- `KC_TRNS` 透過時でも注釈は継承表示しない仕様へ揃える

## 方針
- 注釈保存構造を `layer -> matrixKey -> annotation` に変更
- 表示側は現在レイヤーの注釈マップだけを参照
- 旧形式の `matrixKey -> annotation` は互換のため layer 0 として読めるようにする

## 進捗
- 2026-06-01: 原因調査完了。現状は `matrixKey` 単位保存のためレイヤー非依存で表示されていることを確認。
- 2026-06-01: `implementation_plan.md` にレイヤー対応方針を追記。
- 2026-06-01: `keyAnnotations` utilities を layer-aware 化し、旧形式を layer 0 として扱う後方互換を追加。
- 2026-06-01: `DeviceSlot` で現在レイヤーの注釈だけを `Keyboard` / callout に渡すよう更新。
- 2026-06-01: モーダル見出しへ layer 表示を追加。テスト更新中。
- 2026-06-01: `npm run test` 成功 (`72 passed`)。
- 2026-06-01: `npm run lint` 成功 (`0 errors / 10 warnings`)。warning は既存分のみ。

## 次の作業
- 手動確認: 別レイヤーへ切り替えた際に callout と注釈ドットが残らないこと
- 手動確認: `KC_TRNS` 表示キーでも他レイヤー注釈が継承表示されないこと
