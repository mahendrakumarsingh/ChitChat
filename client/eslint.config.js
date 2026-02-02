import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import { FlatCompat } from '@eslint/eslintrc'
import { defineConfig, globalIgnores } from 'eslint/config'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname, recommendedConfig: js.configs.recommended })

export default defineConfig([
  globalIgnores(['dist', 'server/']),
  ...compat.extends(
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ),
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: globals.browser,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // ensure JSX element usage is recognized by core no-unused-vars
      'react/jsx-uses-vars': 'error',
      // disable jsx-uses-react (not needed with the new JSX transform)
      'react/jsx-uses-react': 'off',
      // React 17+ uses the new JSX transform — don't require React in scope
      'react/react-in-jsx-scope': 'off',
      // disable prop-types checks since this repo was migrated from TypeScript
      'react/prop-types': 'off',
      // enforce fast refresh constraint (files should only export components)
      'react-refresh/only-export-components': 'error',
    },
  },
  {
    files: ['tailwind.config.js', 'vite.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
