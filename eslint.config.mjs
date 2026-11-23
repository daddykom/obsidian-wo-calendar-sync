import plugin from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['**/*.js'],
  },
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': plugin,
    },
    languageOptions: {
      parser,
    },
    rules: {
      ...plugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
