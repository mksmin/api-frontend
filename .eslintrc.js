module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: {
        'no-console': 'off',
        'prefer-const': 'warn',
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
};
