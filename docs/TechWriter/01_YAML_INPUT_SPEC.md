# YAML入力仕様（最小入力・柔軟モード）

## 最小入力（この7つを基本にする）

- article.title（記事タイトル）
- article.audience（対象読者）
- article.level（対象レベル）
- article.type（記事タイプ）
- article.intent（意図）
- style.tone（スタイル・トーン）
- constraints.length（長さ）

## 推奨値（例）

- article.level: beginner | intermediate | advanced（任意の文字列でも可）
- article.type: 解説 | 比較 | 手順 | レビュー | ニュースまとめ（任意の文字列でも可）
- article.intent: inform | persuade | guide | evaluate | entertain（任意の文字列でも可）
- constraints.length: short | medium | long または "1200-1600字"

## sources（任意：添付が複数のときだけ推奨）

- YAMLにsourcesが無い/空でも、添付があれば「添付＝暗黙のsources」として扱う。
- 添付が複数で優先順位が必要な場合のみ指定する。

例：

```yaml
sources:
  - type: file
    file_name: "deepresearch_main.pdf"
    priority: high
    note: "主要根拠"
```

## 最小YAMLテンプレ（推奨）

```yaml
mode: flexible

article:
  title: "（記事タイトル）"
  audience: "（対象読者）"
  level: "beginner"
  type: "解説"
  intent: "inform"

style:
  tone: "です・ます"

constraints:
  length: "medium"
```
