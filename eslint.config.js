import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist/', 'coverage/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-properties': [
        'error',
        { property: 'innerHTML', message: 'innerHTML ist verboten, nutze textContent.' },
        { property: 'outerHTML', message: 'outerHTML ist verboten, nutze textContent.' },
        { property: 'insertAdjacentHTML', message: 'insertAdjacentHTML ist verboten.' },
        { object: 'document', property: 'write', message: 'document.write ist verboten.' },
        { object: 'document', property: 'writeln', message: 'document.writeln ist verboten.' },
      ],
    },
  },
);
