module.exports = {
  extends: ['markuplint:recommended-static-html'],
  nodeRules: [
    {
      // viewport.js はレンダリングブロック必須のため defer を付けてはいけない
      selector: 'script[src*="viewport"]',
      rules: {
        'required-attr': false,
      },
    },
  ],
};
