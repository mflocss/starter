export default {
  extends: ['stylelint-config-standard', 'stylelint-config-recess-order'],
  rules: {
    'block-no-empty': [true, { severity: 'warning' }],
    'selector-class-pattern': null,
    'custom-property-pattern': '^([a-z][a-z0-9]*(-[a-z0-9]+)*|_[a-z0-9]+(-[a-z0-9]+)*)$',
    'at-rule-no-unknown': [true, { ignoreAtRules: ['layer'] }],
    'import-notation': 'string',
  },
};
