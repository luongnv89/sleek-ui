import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'node_modules/',
      'video/',
      'coverage/',
      'scripts/**',
      'tests/**',
      'jest.setup.cjs',
    ],
  },
  ...tseslint.configs.recommended
);
