import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      // Existing CMS/local and legacy remote images intentionally use native img elements.
      '@next/next/no-img-element': 'off',
      '@next/next/no-page-custom-font': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'public/**',
    'node_modules/**',
    'coverage/**',
    'data/**',
    'test-results/**',
    'playwright-report/**',
  ]),
]);
