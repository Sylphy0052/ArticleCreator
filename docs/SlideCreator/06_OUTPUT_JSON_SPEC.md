# NotebookLM貼り付け用 JSON（Prompt JSON）仕様

## 前提

- NotebookLMのSlide Deck生成は「言語」「長さ（short/default/long）」「プロンプト」を指定できる。
- 本Gemは、最終的に NotebookLM のプロンプト欄に「JSON文字列」を貼り付ける運用を前提にする。

## 出力要件

- OK後にのみ出力する
- **純JSONのみ**をコードブロックで出力する（説明文を混ぜない）
- スライド構成（表）と同じ情報を構造化して含む

## トップレベル必須キー

- prompt_version: "notebooklm_slide_prompt_json/1.0"
- generation_rules: 生成ルール（強め指示）
- deck: デッキ本体

## deck 必須キー

- title
- audience
- format: presenter_slides | detailed_deck（YAML由来）
- language: ja | en | ...（YAML由来）
- slide_count_range: {min,max,target?}（YAML由来）
- slides: スライド配列

## slides[] 必須キー

- no
- title
- objective（目的1文）
- key_messages（最大3）
- on_slide_bullets（最大3）
- layout_template（テンプレID）
- visual:
  - idea
  - image_prompt（画像生成はしないが、画像プロンプトは作る）
- speaker_notes（必須）
- sources（URL/出典名のみの配列）
