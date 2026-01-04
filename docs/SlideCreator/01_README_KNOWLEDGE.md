# NotebookLM Slide Prompt Builder Gem — Knowledge Pack

## 目的

このKnowledgeは、Gemが「表形式でスライド構成を提示 → 修正反映を繰り返し → OKで最終JSON出力」
というフローを安定して実行するための固定リソースです。

## 重要：Knowledgeに入れないもの

- 記事本文（article.md）
- DeepResearch結果やソース本文（sources.md など）
これらは毎回チャットに「添付」してください（共有や権限の観点から）。  
※共有GemはDriveフォルダとして保存され、アップロードファイルもDriveに保存されます。  

## NotebookLM側の前提

NotebookLMのSlide Deck生成では、UIで以下を選びます：

- Output language
- Length（short / default / long）
- Prompt（ここに最終JSONを貼る運用）

参考：NotebookLM公式ヘルプ「Generate a Slide Deck in NotebookLM」

## このKnowledgeに含まれるもの

- 入力YAMLテンプレ（run-0.3）
- 表形式スライド構成の列定義
- レイアウトテンプレID一覧
- OKトリガー・反復ルール
- 最終JSON仕様（Prompt JSON）とJSON Schema
- 最終JSONサンプル

## 更新方法

DriveからKnowledgeに入れた場合、最新バージョンが参照されるため、テンプレを更新しやすいです。
