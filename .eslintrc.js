module.exports = {
    env: {
        browser: true,
        node: true,
    },
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: {
        'no-console': 'off',
        'prefer-const': 'warn',
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'indent': ['error', 2],
    },
};