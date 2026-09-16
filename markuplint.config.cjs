module.exports = {
  extends: ['markuplint:recommended-static-html'],
  rules: {
    'performance/head-element-order': {
      // preset 既定のメタ情報を引き継ぐ（浅いマージで消えるため明示）
      specConformance: 'non-normative',
      rules: {
        // CUSTOMIZE: head の並び順。既定値との違いは 1 点で、既定の
        // `{ selector: 'meta', order: 'alphabetical', attr: 'name' }` を素の 'meta' に置換し、
        // meta 同士のアルファベット順チェックだけを無効化している（既定では `property` しか持たない
        // og:* が description より前に要求され、基本 meta / OGP / Twitter のまとまりが崩れるため）。
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
      // 装飾要素の aria-hidden="true" を免除する。<button> / <summary> 配下は
      // presentational children 扱いになるため（markuplint は <summary> にも implicit
      // role=button を付与する — @markuplint/html-spec の spec.summary.jsonc の注記による）。
      selector: '[aria-hidden="true"]',
      rules: { 'no-aria-on-presentational-children': false },
    },
    {
      // CUSTOMIZE: viewport.js を改名・削除した場合はこのセレクタも変更/削除する。
      // viewport.js はレンダリングブロック必須のため defer を付けてはいけない
      // （require-attr は performance preset で error。この免除を外すと error になる）
      selector: 'script[src*="viewport"]',
      rules: { 'require-attr': false },
    },
  ],
};
