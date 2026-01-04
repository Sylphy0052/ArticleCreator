# NotebookLM Slide Prompt Builder（Gem）

このGemは、**記事（md）とソース（md/URL）＋入力YAML**をもとに、NotebookLMで「Slide Deck」を生成するための**スライド構成（表）**を作り、ユーザーと修正を繰り返して、最後に **NotebookLMに貼り付けるための最終JSON**を出力します。  
※このGem自体はスライド生成を行いません（NotebookLM側で生成します）。

---

## できること（フロー）

1. ユーザーが **YAML と md（記事/ソース）を添付**
2. Gemが **表形式でスライド構成案**を提示
3. ユーザーが修正指示
4. Gemが **変更点サマリ → 更新後の表** を提示
5. ユーザーが OK などと言うまで 2〜4 を繰り返し
6. OK後、NotebookLMに貼るための **最終JSON（純JSON）** を出力

---

## 入力（ユーザーが毎回渡すもの）

### 1) 入力YAML（必須）

- format / language / slide_count_range / style_choice / urls を指定します  
- `length` は使いません（slide_count_rangeと重複するため）

**テンプレ（run-0.3）**

```yaml
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
```

### 2) 記事md（必須）

- `article.md`（記事本文）

### 3) ソースmd（任意だが推奨）

- `sources.md`（DeepResearch結果、要約、引用したいポイントの抜粋、参考メモ）
- URL本文取得が難しい場合に備えて、重要箇所をここに貼っておくと安定します

---

## 出力（対話中）：スライド構成（表）

Gemは、毎回この列構成で **Markdown表**を提示します（修正後も同じ）。

| # | スライドタイトル | 目的（1文） | Key messages（最大3） | スライド表示 bullets（最大3） | レイアウト | ビジュアル案 | スピーカーノート（要旨） | 出典（URL/出典名のみ） |
|---:|---|---|---|---|---|---|---|---|

- **Key messages**：そのスライドで伝える核（最大3）
- **bullets**：観客が見る短文（最大3、短く）
- **スピーカーノート**：話す台本の要旨（根拠/補足/例はここへ）
- **出典**：URL/出典名のみ（長文引用は避ける）

---

## 修正指示の出し方（例）

修正指示の形式は自由です。例：

- 「3枚目を comparison_table にして、比較軸はコスト/効果/導入難易度」
- 「結論スライドを1枚目に持ってきて順序を入れ替えて」
- 「bulletsを減らして speaker_notes に寄せて」
- 「初心者向けに、専門用語は初出で一言定義」
- 「ビジュアルは写真ではなく図解寄りで」

Gemは必ず **変更点サマリ → 更新後の表** の順で返します。

---

## 確定（OKトリガー）

次のいずれかが入力されたら「確定」とみなします：

- OK
- 確定
- この構成で
- いきましょう

---

## 出力（OK後）：NotebookLMに貼るための最終JSON

OK後に、Gemは **純JSONのみ**を出力します（説明文なし）。

### JSONの概要（notebooklm_slide_prompt_json/1.0）

- `prompt_version`
- `generation_rules`：生成ルール（1スライド1メッセージ、bullets最大3、文体/トーン等）
- `deck`
  - `title`, `audience`, `format`, `language`, `slide_count_range`
  - `slides[]`：表の各行を構造化したもの
    - `no`, `title`, `objective`, `key_messages`, `on_slide_bullets`
    - `layout_template`
    - `visual`（prompts_only：画像そのものは生成しないが、画像プロンプトは出す）
    - `speaker_notes`
    - `sources`（URL/出典名のみ）

---

## NotebookLMでの使い方（要点）

1. NotebookLMでノートブックを開き、記事mdや必要ソースを追加
2. Studio から Slide Deck を選び、必要に応じて
   - format（Detailed Deck / Presenter Slides）
   - output language
   - length（short/default/long）
   - prompt（ここにGemの最終JSONを貼る運用）
   を設定して生成します

---

## 共有運用の注意（重要）

- Gemを共有する場合、閲覧者はGemの指示や（Gemにアップロードされた）ファイルを閲覧できる可能性があります。  
- そのため、**記事mdやDR結果はKnowledgeに入れず、都度添付**する運用を推奨します。

---

## 制約・注意点

- スライドはAI生成のため、内容や視覚表現に誤りが含まれる可能性があります（必ず最終確認してください）
- URL取り込みがブロックされる/制限される場合があります。重要な根拠は `sources.md` に抜粋を貼ってください
