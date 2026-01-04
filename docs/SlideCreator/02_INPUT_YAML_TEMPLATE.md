version: "run-0.3"

notebooklm:
  slide_deck:
    format: presenter_slides      # presenter_slides | detailed_deck
    language: ja                  # ja | en | ...
    slide_count_range:
      min: 8
      max: 14
      target: 10                  # 任意（無ければGemがmin/maxから自動）

deck_brief:
  title: ""                       # 任意（未指定なら記事から推定）
  audience: ""                    # 例: "社内エンジニア向け" / "非技術者向け"

style_choice:
  audience_level: beginner        # beginner | intermediate | expert
  tone: business                  # business | academic | friendly | playful_bold
  japanese_writing_style: desu_masu # desu_masu | dearu | mixed_minimal
  design: clean_corporate         # minimal | clean_corporate | bold_playful | research_report

sources:
  urls:
    - ""                          # 例: "https://..."
