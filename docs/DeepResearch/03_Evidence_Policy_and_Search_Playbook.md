# 03_Evidence_Policy_and_Search_Playbook.md
>
> 最小限の“品質ルール＋検索の型＋引用ルール”を1枚に統合（チーム運用向け）

## A. Evidence-first ルール（最重要）

- **リンク無し断定禁止**（主張は必ず根拠URLを添える）
- **一次情報優先**：公式Docs / 仕様・RFC / 標準 / 論文 / 公式ブログ / リリースノート / 公式Advisory
- **重要主張は独立ソース2本以上**で裏取り（例：仕様＋リリースノート、公式Docs＋公式Issue）
- **不確実性は明示**：「不確実」「要検証」「条件依存」ラベルを付け、結論に混ぜない

## B. 確度（Confidence）の目安

- **High**：一次情報同士で一致（または一次＋一次の独立2本）
- **Med**：一次1本＋補助（条件依存が強いものはMedに）
- **Low**：ブログ/体験談中心、またはソース間で矛盾（→未解決事項へ）

## C. 検索の型（Search Matrix：毎回これを回す）

トピック `<T>`、比較先 `<A>` として最低限この方向で探す：

- 公式/仕様：`<T> documentation` / `<T> spec` / `<T> RFC` / `<T> standard`
- 実装/更新：`<T> release notes` / `changelog` / `migration guide` / `breaking changes`
- 罠/運用：`<T> pitfall` / `troubleshooting` / `debug` / `known issues`
- 障害：`<T> incident` / `outage` / `postmortem`
- セキュリティ：`<T> security advisory` / `<T> CVE` / `hardening`
- 性能：`<T> benchmark` / `performance latency throughput`
- 比較：`<T> vs <A>` / `<T> alternatives` / `trade-offs`

### ノイズを減らす（必要な時だけ）

- まず一次情報に寄せる：`site:`（公式/標準化団体/ベンダーDocsに寄せる）
- 仕様や論文：`filetype:pdf`
- 狙い撃ち：`intitle:`
- 除外：`-keyword`
- フレーズ一致：`"exact phrase"`

## D. 引用（Citation）最小ルール

- 原則：**要約＋リンク**（長いコピペ引用は避ける）
- 重要Claimは本文中にリンクを残す（References Onlyでも最低限、章内リンク推奨）
- 変化が速い領域は **日付/バージョン** を必ず併記

## E. 出力のミニ規約（読みやすさ）

- 曖昧語より「条件・制約・再現条件」
- 1段落1テーマ、箇条書きは同じ粒度で揃える
- 反論/注意点（制約・失敗談）を必ず入れる
