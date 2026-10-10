import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist', 'dist-e2e', 'dev-dist', 'coverage', 'playwright-report', 'test-results', 'node_modules'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.ts', '*.ts'],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    files: ['*.js', '*.config.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
);
