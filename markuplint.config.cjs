module.exports = {
  extends: ['markuplint:recommended-static-html'],
  rules: {
    'performance/head-element-order': {
      // preset 既定のメタ情報を引き継ぐ（浅いマージで消えるため明示）
      specConformance: 'non-normative',
      rules: {
        'head-element-order': [
          'meta[charset]',
          'meta[http-equiv]',
          'meta[name="viewport"]',
          'title',
          'meta',
          'link',
          'style',
          'script',
        ],
      },
    },
  },
  nodeRules: [
    {
      // 装飾要素の aria-hidden="true" は presentational children の冗長な指定だが、
      // UA 差分に対する防御として残す。祖先ロールが子孫を公開しない場合でも無害。
      selector: '[aria-hidden="true"]',
      rules: { 'no-aria-on-presentational-children': false },
    },
    {
      selector: 'script[src*="viewport"]',
      rules: { 'require-attr': false },
    },
  ],
};
