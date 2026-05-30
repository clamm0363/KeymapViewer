# 実装計画 - Issue #5: ESLint/Prettier & Vitest の導入
## 概要
コードの品質維持、開発効率の向上、そして今後のリファクタリング（一方向データフローの導入やアイコン辞書の統合など）をデグレなく安全に進めるために、静的解析ツール（ESLint / Prettier）およびテストランナー（Vitest）を導入します。

本プロジェクトはVanilla JS（ブラウザ環境、ES Modules）で記述されているため、フロントエンドライブラリ（ReactやVueなど）に依存しない軽量なWeb環境に適した設定を行います。

## 実装ステップ

### 1. `package.json` の初期化と依存関係のインストール
- `npm init -y` にて `package.json` を新規作成。
- 以下の開発依存関係（devDependencies）をインストール。
  - `vitest` (高速・軽量なユニットテストランナー)
  - `eslint` (静的解析Linter)
  - `eslint-config-prettier` (Prettierとの競合を避けるための設定)
  - `prettier` (コードフォーマッタ)

### 2. 静的解析の設定
- **ESLint設定 (`eslint.config.js`)**
  - ブラウザ環境 (`globals.browser`) および ES Modules (`sourceType: "module"`) に対応したフラット設定 (Flat Config) を作成。
  - 推奨ルール (`@eslint/js`) を適用。
- **Prettier設定 (`.prettierrc`)**
  - プロジェクト標準のコード整形ルール（シングルクォート、セミコロンあり、インデント幅2など）を定義。

### 3. テスト環境の設定 (`vitest.config.js`)
- `vitest.config.js` を作成。
- Vanilla JSのピュアロジックが安全に動作・テストできるシンプルな設定を行う。

### 4. npm scripts の整備
`package.json` に以下のスクリプトを定義。
- `npm run lint`: ESLint によるコード品質チェック。
- `npm run format`: Prettier によるコードの整形。
- `npm run test`: Vitest によるテストの実行。
- `npm run test:watch`: テストの変更監視実行。

### 5. ユニットテストの作成
もっともロジックが複雑でバグが混入しやすい `js/utils/labelParser.js` および `helpers.js` に対するユニットテストを記述する。
- `test/utils/labelParser.test.js`
- `test/utils/helpers.test.js`
---

## 期待される効果

1. **品質の自動チェック**:
   AIエージェントや人間がコードを編集した際、`npm run lint` や `npm run test` を実行することで、バグやフォーマットの乱れ、構文エラーを即座にチェックできるようになります。
2. **リファクタリングの安全性確保**:
   以降の Issue #6（辞書の統合）や Issue #7（Storeの導入）といった複雑なロジック改修を行う際に、テストが通っていることでデグレがないことを保証できます。
## 検証プラン
1. **静的解析の実行**:
   `npm run lint` および `npm run format` を実行し、既存コードの問題点を検出し、フォーマットが動作することを確認します。
2. **テストの実行**:
   `npm run test` を実行し、作成したテストが正常にパスすることを確認します。

## 追加作業：ローカル開発サーバーの導入と動作確認
Issue #5 の改修に伴い、ブラウザでアプリケーションが正常に描画され、エラーが発生しないかを検証するためにローカルサーバーを起動できるようにします。

### 1. サーバーの要件
- ホスト: `127.0.0.1`
- ポート: `5501`
- ES Modules (`type="module"`) などの適切な MIME タイプがブラウザに返されること。

### 2. サーバーの起動手段
Node.js 環境でゼロ依存で動作するシンプルなHTTPサーバープログラム `scripts/server.js` を作成するか、あるいは標準的な `http-server` パッケージを利用します。
今回は依存関係を極力シンプルに保つため、Node.js 組み込みの `http` / `fs` / `path` モジュールを使用した軽量なローカルサーバースクリプト `scripts/server.js` を作成し、`npm start` で起動できるようにします。
これにより追加パッケージのダウンロードを伴わずに高速かつ安定して `127.0.0.1:5501` で起動可能です。

### 3. 検証方法
1. `npm start` コマンドでサーバーを起動。
2. ブラウザで `http://127.0.0.1:5501` にアクセスし、開発者ツールのコンソールにエラーが表示されていないこと、およびキーボードレイアウトが正常に描画されることを確認します。

