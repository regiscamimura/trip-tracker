import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier'
import importPlugin from 'eslint-plugin-import'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: {
      prettier: prettier,
      import: importPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      semi: 'off', // Let Prettier handle semicolons
      '@typescript-eslint/semi': 'off', // Let Prettier handle semicolons
      'no-console': 'error', // Prevent console.log statements
      'import/no-relative-parent-imports': 'error', // Prevent relative imports
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
