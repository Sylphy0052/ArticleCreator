# Tech Deep Research（Evidence-first）Gem

技術テーマを **記事執筆の「情報源（根拠）」**にできる形で集め、**リンク付き**で整理するためのGemです。  
調査は「一次情報優先」「裏取り」「不確実性の明示」を徹底し、最後に **Claim Table** で主張と根拠を棚卸しします。

---

## 1) できること

- どんな技術テーマでも、記事に転用しやすい **構造化レポート**を作る
- **一次情報（公式Docs/仕様/RFC/標準/論文/公式リリースノート/公式Advisory）優先**で根拠を集める
- 重要主張は **独立ソース2本以上**で裏取り（できない場合は「不確実」扱いにする）
- **落とし穴 / 失敗談 / 互換性 / 移行 / セキュリティ / 性能**まで拾いに行く

---

## 2) 使い方（クイックスタート）

1. Knowledge の **`01_Research_Request_Template.md`** を開き、YAMLをコピペして埋める
2. 埋めたYAMLを、そのままGemに貼って送信
3. 不足がある場合、Gemが **最大3問**質問するので回答
4. 出力（レポート）を受け取る  
   - 必要なら `research.depth` や `questions_to_answer` を調整して再実行

---

## 3) 入力（YAML）テンプレ
>
> 基本は Knowledge の `01_Research_Request_Template.md` を使用してください。  
> ここでは“要点だけ”抜粋します。

### 最低限埋めたい項目

- `topic`：調査テーマ（短く具体的に）
- `article_goal`：記事で達成したいこと（比較/導入判断/手順化/落とし穴収集など）
- `article.audience`：想定読者
- `research.depth`：`quick` / `standard` / `deep`
- `questions_to_answer`：必ず答えてほしい質問（3〜10個推奨）

### 例（最小）

```yaml
topic: "WebGPUの実運用での制約と落とし穴"
article_goal: "導入判断できる根拠（仕様・対応状況・罠）を揃える"
article:
  audience: "フロントエンド中級〜上級"
research:
  depth: "standard"
constraints:
  time_range: "2023-01以降（最新優先）"
  languages: ["ja","en"]
deliverable:
  type: "research_report"
citation:
  required: true
  style: "inline_links"
quality_bar:
  prioritize_primary_sources: true
  min_independent_sources_for_key_claims: 2
questions_to_answer:
  - "仕様/標準の位置付けは？"
  - "主要ブラウザの現状と制約は？"
  - "よくある落とし穴と回避策は？"
```

---

## 4) 出力（レポート）の形

出力は Knowledge の **`02_Output_Template.md`** に固定されています。

必ず含む章（要約）：

- **0. スコープと前提**（期間・バージョン・読者・深さ）
- **1. 調査計画**（サブ質問 + 探索先）
- **2. 結論サマリ**（5〜10行・各行に根拠リンク）
- **3. 重要論点**（根拠 + 反証/注意）
- **4. 技術詳細**（仕組み/制約/運用/性能/セキュリティ）
- **6. Claim Table**（主張/確度/根拠/備考）
- **7. 参考文献**（一次→二次→ブログ）

> ルール：**リンク無し断定禁止**。リンクが付けられない場合は「不確実」扱いにしてClaim Tableの確度を下げます。

---

## 5) 品質ルール（最小憲法）

これは Knowledge の **`03_Evidence_Policy_and_Search_Playbook.md`** の要点です。

### Evidence-first（根拠重視）

- 一次情報優先（公式Docs/仕様/RFC/標準/論文/リリースノート/公式Advisory）
- 重要主張は **独立ソース2本以上**で裏取り
- 不確実は不確実として明示し、結論に混ぜない

### 確度（Confidence）の目安

- **High**：一次情報同士で一致（独立2本）
- **Med**：一次1本＋補助（条件依存はMedに倒す）
- **Low**：補助情報中心 / 矛盾あり（→未解決事項へ）

---

## 6) `research.depth` の使い分け

- `quick`：論点5〜8、要点中心、Claim Table簡易
- `standard`：論点10〜15、罠/反論/運用チェックまで
- `deep`：論点15〜25、障害事例・セキュリティ・性能条件まで踏み込む

---

## 7) よくある失敗と直し方

### 調査が広すぎて浅い

- `questions_to_answer` を **3〜7個**に絞る
- `scope.exclude` を入れて守備範囲を狭める
- 比較なら「比較軸（運用/コスト/互換性/セキュリティ）」を `scope.include` に入れる

### ブログばかりになる

- `quality_bar.prioritize_primary_sources: true` を確認
- `constraints.time_range` と `constraints.versions` を必ず書く
- `questions_to_answer` を「公式に保証される仕様は？」に寄せる

### 重要主張の裏取りが足りない

- Claim Tableで `Low` の項目を「未解決事項」に移し、本文では断定しない
- 追加調査のToDoとして、どの一次情報を当たるべきかを書かせる

---

## 8) Knowledge（最小構成）

このGemは最小限として、Knowledgeを **3ファイル**に絞っています。

1. `01_Research_Request_Template.md`：入力テンプレ（YAML）
2. `02_Output_Template.md`：出力テンプレ（Markdown）
3. `03_Evidence_Policy_and_Search_Playbook.md`：品質ルール + 検索の型（最小）

---

## 9) フィードバックの出し方（改善が早い）

次をGemに貼ると、再実行・改善が早いです。

- 使ったYAML（そのまま貼る）
- 期待した成果物（例：比較表が欲しい / 移行だけ欲しい / CVE中心で、など）
- 足りない点（一次情報が少ない / 反論がない / バージョンが違う、など）
