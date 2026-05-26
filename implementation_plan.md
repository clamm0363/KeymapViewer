# 実装計画

## 目的

入力デバイスの表現を `ENCODER` 一段ではなく、`入力デバイス種別` と `見た目バリエーション` の二段構造へ整理し、`Pointing Device` を独立した概念として扱えるようにする。

## 今回の対象

- `js/app.js`
- `js/components/DeviceSlot.js`
- `js/components/keycapEncoder.js`
- `js/components/keycapStyles.js`
- `SampleLayouts/sample_numpad.json`
- `SampleLayouts/sample_numpad_mapping.json`

## 現状把握

- 現在は `encoderStyles` だけで `Dial` / `Wheel` / `Trackball` を切り替えている。
- ただし `Trackball` は QMK / VIA の意味論では回転体より `Pointing Device` に近い。
- 将来的に `Touchpad` などを増やすなら、`Encoder` と `Pointing Device` を同列に扱える構造のほうが自然である。
- 既存データや共有URLとの互換のため、旧 `encoderStyles` は当面読み取れる必要がある。

## 方針

- 新しい設定構造として `inputDeviceSettings` を導入し、各入力位置ごとに `kind` と `variant` を持たせる。
- UI はまず `Encoder` / `Pointing Device` を選び、その後に対応する見た目候補を選ぶ二段構造へ変える。
- 描画側は新構造を優先して解釈し、旧 `encoderStyles` は読み込み時や参照時に吸収して後方互換を保つ。
- `Pointing Device` では少なくとも `Trackball` と `Touchpad` を選べるようにし、既存の `Trackball` はそこへ移動する。

## 実施手順

1. 新旧設定を吸収できる入力デバイス解決ロジックを追加する。
2. サンプル読込・JSON読込・共有状態で `inputDeviceSettings` を扱えるようにする。
3. 設定 UI を二段構造へ変更する。
4. 描画ロジックとフレームロジックを `kind` / `variant` ベースへ移行する。
5. サンプル JSON を新構造へ更新する。
6. 構文チェックと JSON 妥当性確認を行う。

## 実施済み

- [x] 新旧設定を吸収できる入力デバイス解決ロジックを追加した。
- [x] サンプル読込・JSON読込・共有状態で `inputDeviceSettings` を扱えるようにした。
- [x] 設定 UI を二段構造へ変更した。
- [x] 描画ロジックとフレームロジックを `kind` / `variant` ベースへ移行した。
- [x] サンプル JSON を新構造へ更新した。
- [x] 構文チェックと JSON 妥当性確認を行った。

## 完了条件

- `Encoder` と `Pointing Device` を別種別として選択できる。
- `Pointing Device` 配下で `Trackball` と少なくとも 1 つ以上の別候補を選択できる。
- 既存の `encoderStyles` ベースデータも破綻なく表示される。
- サンプル JSON と主要 JavaScript の整合が確認できる。
