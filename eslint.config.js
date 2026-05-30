import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // 外部のリポジトリや生成アセット、不要なディレクトリを無視する
  {
    ignores: [
      'fluentui-system-icons/**',
      'font-extractor/**',
      'legacy/**',
      'scratch/**',
      'node_modules/**',
      'json_private/**',
    ],
  },
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // グローバル変数（React, ReactDOM, htm）を定義
        React: 'readonly',
        ReactDOM: 'readonly',
        htm: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
];
