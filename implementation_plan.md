# 実装計画

## 目的

Antigravity 側の計画を踏まえ、SVG 検証と `utility.js` 分割を破壊的変更なしで引き継ぐ。

## 参照した外部計画の要点

- 目的は 2 つ:
  1. 有効な SVG アイコンを Fluent UI System Icons 基準で見直すこと
  2. 肥大化した `js/icons/utility.js` をカテゴリ別に分割すること
- Antigravity 側では `DEBUG` が唯一の非公式 SVG で、正式な `bug_24_regular` に置換する想定だった。
- 分割対象として `keyboard.js` `edit.js` `web.js` `rgb.js` を作る方針だった。
- `svg-icons.js` と `scripts/add-svg-icon.js` も追従修正する想定だった。

## 現状把握

- `js/icons/edit.js` `js/icons/keyboard.js` `js/icons/rgb.js` `js/icons/web.js` はすでに作成済み。
- 4 ファイルは Node import で構文エラーなく読み込めることを確認済み。
- `js/svg-icons.js` は新規 4 カテゴリを import 済みで、統合順も `UTILITY_ICONS` が最後になるよう整理済み。
- `SVG_ICONS` では `KC_COPY` `KC_ENT` `KC_RGB_TOG` `KC_WWW_HOME` に加えて、`DEBUG` `KC_RESET` `KC_DM_REC1` などの代表キーも解決できることを確認済み。
- `js/icons/utility.js` は縮小済みで、`DEBUG`、Magic 系、マクロ系、未分割ユーティリティのみを残す構成へ整理済み。
- `DEBUG` は非公式の自作 SVG から、Fluent 公式の bug アイコンベースへ置換済み。
- `scripts/add-svg-icon.js` は `keyboard` `edit` `web` `rgb` のカテゴリ振り分けに追従済み。
- ブラウザ上の見た目確認はまだ未実施。

## 実施済み

- [x] Git の現在状態と未コミット差分を確認する。
- [x] 外部の Antigravity 側 `implementation_plan.md` を参照する。
- [x] 新規分割ファイルの構文確認を行う。
- [x] `js/svg-icons.js` で新規カテゴリを読み込める状態にする。
- [x] 代表キーが `SVG_ICONS` から解決できることを確認する。
- [x] `utility.js` に残すキーを Antigravity 計画に沿って整理する。
- [x] `DEBUG` を Fluent 公式の bug アイコンへ置き換える。
- [x] `scripts/add-svg-icon.js` のカテゴリマップと振り分けロジックを更新する。
- [x] 変更後の主要ファイルに対して Node の構文チェックを行う。
- [x] `scripts/add-svg-icon.js` の dry-run で `edit` `web` `rgb` の書き込み先を spot check する。

## これからやること

- [ ] ブラウザ上で主要キーの表示確認を行う。

## 注意点

- `svg-icons.js` の統合順は重複キーの最終定義に影響する。
- 今回は `utility.js` を先に縮小したうえで `UTILITY_ICONS` を最後に配置しているため、重複上書きのリスクはかなり下がっている。
- ただし最終的な品質確認として、UI 上で代表キーの見た目を一度確認したい。
