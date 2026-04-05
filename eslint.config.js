import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier/flat';
import globals from 'globals';

export default [
  js.configs.recommended,
  prettierConfig,
  {
    files: ['src/**/*.js', 'public/**/*.js'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
];
