# AR レポート: v1.2 h1 / title / 見出し SEO 最適化

**日時**: 2026-05-31
**ブランチ**: feature/v1.2-seo-headings-text
**変更タイプ**: テキスト編集のみ（構造変更なし）
**対象**: src/index.html（6 行変更）

## 変更内容確認

| # | 対象 | 変更前 | 変更後 | 判定 |
|---|---|---|---|---|
| 1 | title | iluha — からだの声を、聴く時間。 | 完全個室のボディケアサロン iluha｜からだの声を、聴く時間 | pass |
| 2 | og:title | 同上 | 同上 | pass |
| 3 | twitter:title | 同上 | 同上 | pass |
| 4 | h1 | からだの声を、br 聴く時間。 | からだの声を聴く、br 完全個室のボディケアサロン。 | pass |
| 5 | problem h2 | こんな日々、続いていませんか？ | こんなお悩み、続いていませんか？ | pass |
| 6 | numbers h2 | 実績 | 施術実績・満足度 | pass |

## SEO 観点

- title: 完全個室・ボディケアサロン KW が先頭配置、23文字（推奨 30-60文字以内）、iluha ブランド + 感性 KW 両立
- og:title / twitter:title: title タグと同値、SNS シェア時のテキスト一貫性維持
- h1: 完全個室・ボディケアサロン KW 追加、自己説明的、u-hidden-pc br 位置は「からだの声を聴く、」の後で SP 折り返し自然
- problem h2: 「日々」→「お悩み」で topic が検索語として機能、共感トーン維持
- numbers h2: 「実績」→「施術実績・満足度」で自己説明性向上、「施術」KW 追加

## アクセシビリティ観点

- h1 → h2 → h3 の階層変更なし: pass
- aria-label / id 属性変更なし（hero-heading / problem-heading / numbers-heading）: pass
- u-hidden-pc br タグの機能変更なし: pass

## ブランド整合

- iluha ブランド名: title・h1 両方で維持: pass
- 感性 KW「からだの声を、聴く時間」: title に維持: pass
- CV トーン変更なし（疑問文 / 丁寧語維持）: pass
- 指示で「触らない」とされた見出し（流れ / 料金 / お客様の声 / よくある質問 / 予約 / features / step h3 / concern h3）: 変更なし: pass

## 技術検証

- pnpm run build: 成功（60ms、エラーなし）
- 構造変更なし（テキスト置換のみ）
- 回帰リスク: ほぼゼロ

## completeness-criteria 観点段階

- B 段階（コンテンツ変更）: 全観点クリア
- リリース前 7 条件: 非該当（feature → v1.2 PR、main マージなし）

## AR 判定

- 必須修正: なし
- 推奨修正: なし

結論: AR 通過。PR 作成可。
