# 実装計画

## 目的

SVG 分割後の `.js` 群をレビューし、場当たり的な修正や古い運用前提が残っている補助スクリプト・検証スクリプトを現行構成に合わせて整備する。

## 今回の修正ブランチ

- ブランチ名: `fix/svg-tooling-followup`

## 現状把握

- 本体の `js/icons/*.js` と `js/svg-icons.js` は、構文チェック・代表キー解決・カテゴリ重複確認の範囲では大きな破綻は見つかっていない。
- `js/svg-icons.js` は `system` `media` `wireless` `mouse` `keyboard` `edit` `rgb` `web` `utility` の順で統合されている。
- `scripts/add-svg-icon.js` は新カテゴリ構成に追従済みで、`edit` `web` `rgb` への dry-run も確認済み。
- 一方で `scripts/add-svg-icon.sh` は旧構成前提のままで、`keyboard` `edit` `web` `rgb` を個別ファイルへ振り分けられない。
- `scripts/add-mouse-icons-robust.js` は `js/svg-icons.js` へ直接追記する旧式スクリプトで、モジュール分割後の構成と矛盾している。
- `js/test-svg-validation.js` は ESM export を import せずグローバル変数前提で書かれており、現在の構成では信頼できる検証になっていない。

## 修正対象

- `scripts/add-svg-icon.sh`
  - 現行のカテゴリ分割と一致するように振り分けロジックを更新する。
  - 20px / 24px の Fluent SVG 探索挙動を `scripts/add-svg-icon.js` に合わせる。
- `scripts/add-mouse-icons-robust.js`
  - 現行運用に不要なら廃止候補として扱う。
  - 残す場合は `js/icons/mouse.js` などのカテゴリモジュールへ出力する形へ改修する。
- `js/test-svg-validation.js`
  - 現在の ESM 構成で実行可能な検証スクリプトへ組み替える。
  - 少なくとも import、主要 API、代表アイコン解決を自動で確認できる状態にする。

## 実施済み

- [x] `.js` ファイル群の棚卸しを行う。
- [x] `js/svg-icons.js` とカテゴリモジュール間の重複キー有無を確認する。
- [x] `ICON_ALIASES` の参照先がすべて解決できることを確認する。
- [x] 補助スクリプトと検証スクリプトのうち、旧構成に依存している候補を洗い出す。
- [x] 修正用ブランチ `fix/svg-tooling-followup` を作成する。
- [x] `scripts/add-svg-icon.sh` を Node 実装への互換ラッパーとして整理し、カテゴリ二重管理を解消する。
- [x] `scripts/add-mouse-icons-robust.js` を現行 `add-svg-icon.js` へ委譲する互換ラッパーへ置き換える。
- [x] `scripts/add-svg-icon.js` に `KC_ACL*` を含むマウスカテゴリ判定を追加する。
- [x] `js/icons/mouse.js` の `KC_ACL*` カテゴリ表記を `mouse` に揃える。
- [x] `js/test-svg-validation.js` を ESM ベースの現行検証スクリプトへ更新する。
- [x] Node ベースで構文確認と代表ケース検証を実施する。

## これからやること

- [ ] 必要であれば Bash 実行環境上でも `scripts/add-svg-icon.sh` の委譲動作を spot check する。

## 完了条件

- `add-svg-icon.sh` と `add-svg-icon.js` が同じカテゴリ方針で動作する。
- 古い `js/svg-icons.js` 直接追記フローが残らない、または残す理由が明確に説明できる。
- `test-svg-validation.js` が現在の構成でそのまま実行でき、主要 API と代表アイコンを検証できる。

## 注意点

- `AGENTS.md` の運用ルール上、SVG 追加は手動編集ではなく自動化スクリプト経由で成立する必要がある。
- 補助スクリプトの放置は、次回のアイコン追加時に静かに旧構成へ逆戻りするリスクがある。
- 本体 UI は現状大きく壊れていない前提なので、今回は「補助ツールと検証基盤の整合性回復」を優先する。
