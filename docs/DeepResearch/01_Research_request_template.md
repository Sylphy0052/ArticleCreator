# 01_Research_Request_Template.md
>
> Tech Deep Research（Evidence-first）用：入力テンプレ（YAML）
>
> - これをコピペして埋めてGemに渡してください。
> - 足りない情報がある場合、Gemは最大3問だけ質問して補完します。

```yaml
topic: ""                 # 調査テーマ（短く具体的に）
article_goal: ""          # 記事で達成したいこと（例: 比較/導入判断/手順化/落とし穴収集）

article:
  audience: ""            # 想定読者（例: backend中級, SRE, security担当）
  intent: ""              # 任意：inform | evaluate | guide | troubleshoot など（空ならGemが推定）

research:
  depth: "standard"       # quick | standard | deep

constraints:
  time_range: ""          # 例: "最新優先" / "3日以内" / "2024-01以降" / "2023-10〜2024-06"
  languages: ["ja","en"]  # 情報源の言語（出力言語ではない）

deliverable:
  type: "research_report" # research_report | comparison | howto | outline | faq
  length: ""              # 例: "A4 2〜3枚相当" / "落とし穴20個" / "見出し+要点10項目"

citation:
  required: true
  style: "inline_links"   # inline_links | footnote_like | references_only

quality_bar:
  prioritize_primary_sources: true
  min_independent_sources_for_key_claims: 2
  allow_blogs_as_secondary: true

questions_to_answer: []   # 推奨：3〜10個（空ならGemが5〜8個を提案）
```
