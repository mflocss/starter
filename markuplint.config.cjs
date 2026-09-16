module.exports = {
  extends: ['markuplint:recommended-static-html'],
  rules: {
    'performance/head-element-order': {
      // preset 既定のメタ情報を引き継ぐ（浅いマージで消えるため明示）
      specConformance: 'non-normative',
      rules: {
        // CUSTOMIZE: head の並び順ルール。既定値との違いは 1 点だけで、
        // 既定の `{ selector: 'meta', order: 'alphabetical', attr: 'name' }` を素の 'meta'
        // に置き換えている（= meta 同士のアルファベット順チェックを無効化）。
        // 理由: 既定値は `name` 属性をソートキーにするため、`property` しか持たない og:* が
        // キー空文字として全 name 付き meta より前に要求され、`description` より前へ寄る。
        // twitter:* は `name` を持つので color-scheme / format-detection と混ざって散る。
        // 結果として「基本 meta → OGP → Twitter」というまとまりが崩れ、テンプレートとしての
        // 可読性を失う。並び順による性能差は無いため、まとまりを優先した。
        // charset → viewport → title → meta → link → style → script の保証は維持している。
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
      // 装飾要素の aria-hidden="true" を免除する（src 内 7 箇所: ハンバーガーの空 span 3 /
      // アコーディオンの装飾 svg 4）。
      // <summary> 配下の 4 件は、markuplint が独自に role=button を付与していることに由来する。
      // markuplint 自身が「ARIA in HTML は "No corresponding role" とするが、many, but not all,
      // user agents が implicit role=button を公開する」と注記している（@markuplint/html-spec の
      // spec.summary.jsonc）。<button> 配下の 3 件は ARIA 仕様上つねに presentational children
      // なので aria-hidden は冗長だが無害。
      // セレクタを狭めない理由: 狭めてもこの規則の偽陰性は減らず（同じ要素に別の ARIA が付いた
      // 場合は role-supports-aria-prop / no-redundant-accessible-name が捕捉する）、クラス名で
      // 絞るとサンプル実装のクラス名に結合してテンプレートとして劣化するため。
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
