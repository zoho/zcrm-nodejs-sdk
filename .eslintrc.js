module.exports = {
  'extends': 'google',
  'parserOptions': {
    'ecmaVersion': 2018
  },
  rules:{
    'linebreak-style': 0,
    'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
    'comma-dangle': ['error', 'never'],
    'require-jsdoc': 0,
    'new-cap': 0,
    'camelcase': 0,
    'no-extend-native': 'off',
    'one-var': 0,
    'guard-for-in': 0,
    'max-len': ['error', {
      'code': 120,
      'ignoreStrings': true,
      'ignoreTemplateLiterals': true
    }]
  }
};
