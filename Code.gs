/**
 * ArticleCreator - Google Apps Script
 * 自律型コンテンツ制作パイプライン
 *
 * @version 1.0.0
 * @description GASをハブとし、Gemini Gemsの調査・生成能力とNotebookLMの資料構成能力を組み合わせた
 *              エンジニア向け高品質記事の制作支援ツール
 */

// ============================================
// 定数定義
// ============================================

const SIDEBAR_TITLE = 'ArticleCreator';

// TechWriter YAML Spec用の定数
const AUDIENCE_ROLES = ['backend', 'frontend', 'SRE', 'DevOps', 'data', 'security', 'mobile', 'infra', 'ML/AI'];
const AUDIENCE_LEVELS = ['beginner', 'intermediate', 'advanced'];
const ARTICLE_TYPES = ['解説', '比較', '手順', '導入ガイド', '設計レビュー', '移行ガイド', 'トラブルシューティング', 'ベストプラクティス', '事例紹介', 'ベンチマーク', '障害報告', 'ニュースまとめ', 'レビュー'];
const STYLE_TONES = ['実務的', '丁寧', 'フレンドリー', 'カジュアル', 'フォーマル', 'アカデミック'];
const STYLE_LENGTHS = ['short', 'medium', 'long'];
const SEARCH_INTENTS = ['how-to', 'troubleshooting', 'concept', 'comparison', 'best-practices'];

// 後方互換性のための旧定数（他の場所で使用）
const TARGETS = ['エンジニア', 'デザイナー', 'PM', '非技術者'];
const TONES = ['カジュアル', 'フォーマル', '技術的', '教育的', '実践的', '解説的', 'フレンドリー', 'ビジネスライク', 'アカデミック'];

const FILE_NAMES = {
  research: '01_research_results.md',
  article: '02_theme_article.md',
  image: '03_thumbnail.png',
  pdf: '04_presentation.pdf',
  manifest: 'manifest.json'
};

// ============================================
// メニュー・サイドバー表示
// ============================================

/**
 * スプレッドシート/ドキュメント起動時にメニューを追加
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('ArticleCreator')
    .addItem('サイドバーを開く', 'showSidebar')
    .addToUi();
}

/**
 * サイドバーを表示
 */
function showSidebar() {
  const html = HtmlService.createHtmlOutput(getHtmlContent())
    .setTitle(SIDEBAR_TITLE)
    .setWidth(400);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Webアプリとしてデプロイ時のエントリーポイント
 * @param {Object} e - イベントオブジェクト
 * @returns {HtmlOutput} HTMLページ
 */
function doGet(e) {
  return HtmlService.createHtmlOutput(getHtmlContent())
    .setTitle(SIDEBAR_TITLE)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ============================================
// HTML テンプレート
// ============================================

/**
 * サイドバーHTMLコンテンツを生成
 * @returns {string} HTML文字列
 */
function getHtmlContent() {
  return `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Material Design Lite -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
  <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>

  <!-- Dialog Polyfill for older browsers -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dialog-polyfill/0.5.6/dialog-polyfill.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/dialog-polyfill/0.5.6/dialog-polyfill.min.js"></script>

  <style>
    /* ベーススタイル */
    body {
      margin: 0;
      padding: 0;
      font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
      background-color: #fafafa;
    }

    .mdl-layout {
      min-height: 100vh;
    }

    /* Webアプリ用フルページレイアウト */
    @media (min-width: 600px) {
      .page-content {
        max-width: 800px;
        margin: 0 auto;
        padding: 24px;
      }

      .mdl-textfield__input {
        font-size: 16px;
      }

      .prompt-area textarea {
        min-height: 150px;
        font-size: 14px;
      }

      .mdl-dialog {
        max-width: 500px;
      }
    }

    /* ヘッダー */
    .mdl-layout__header {
      min-height: auto;
    }

    .mdl-layout__header-row {
      padding: 0 16px;
      height: 48px;
    }

    .mdl-layout-title {
      font-size: 18px;
      font-weight: 500;
    }

    .header-spacer {
      flex-grow: 1;
    }

    /* タブバー */
    .mdl-layout__tab-bar {
      background-color: #3f51b5;
      height: 40px;
      overflow-x: auto;
      white-space: nowrap;
    }

    .mdl-layout__tab {
      padding: 0 12px;
      font-size: 12px;
      height: 40px;
      line-height: 40px;
    }

    /* コンテンツエリア */
    .page-content {
      padding: 16px;
    }

    /* セクションタイトル */
    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin: 16px 0 8px 0;
    }

    .section-title:first-child {
      margin-top: 0;
    }

    /* テキストフィールド */
    .mdl-textfield {
      width: 100%;
    }

    .mdl-textfield__input {
      font-size: 14px;
    }

    .mdl-textfield__label {
      font-size: 14px;
    }

    /* プロンプト表示エリア */
    .prompt-area {
      margin: 8px 0;
    }

    .prompt-area textarea {
      width: 100%;
      min-height: 100px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
      resize: vertical;
      background-color: #f5f5f5;
    }

    /* ボタングループ */
    .button-group {
      display: flex;
      gap: 8px;
      margin: 12px 0;
    }

    .button-group .mdl-button {
      flex: 1;
      font-size: 12px;
    }

    /* セレクトフィールド */
    .select-group {
      margin: 8px 0;
    }

    .select-group label {
      display: block;
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .select-row {
      display: flex;
      gap: 16px;
      margin: 8px 0;
    }

    .select-row .select-group {
      flex: 1;
      margin: 0;
    }

    /* チェックボックスグループ */
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 12px 0;
      padding: 8px 0;
    }

    .checkbox-group > label:first-child {
      font-size: 12px;
      color: #666;
      margin-right: 8px;
    }

    .checkbox-group .mdl-checkbox {
      width: auto;
    }

    /* チェックボックスグリッド（複数選択用） */
    .checkbox-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 4px 24px;
    }

    .checkbox-grid .mdl-checkbox {
      width: 100%;
      margin: 0;
      padding: 6px 0;
      min-height: 28px;
    }

    .checkbox-grid .mdl-checkbox__label {
      font-size: 13px;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* MDLチェックボックスの幅調整 */
    .checkbox-grid label.mdl-checkbox {
      padding-left: 28px;
    }

    .select-group label {
      display: block;
      font-size: 12px;
      color: #757575;
      margin-bottom: 4px;
    }

    .select-group select {
      width: 100%;
      padding: 8px;
      font-size: 14px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: white;
    }

    /* ファイルアップロード */
    .file-upload-group {
      margin: 12px 0;
    }

    .file-upload-group input[type="file"] {
      width: 100%;
      font-size: 14px;
    }

    /* プレビュー */
    .preview-container img {
      max-width: 100%;
      margin-top: 8px;
      border-radius: 4px;
    }

    /* チェックリスト */
    .checklist {
      list-style: none;
      padding: 0;
      margin: 8px 0;
    }

    .checklist li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
      display: flex;
      align-items: center;
      font-size: 14px;
    }

    .checklist .status {
      margin-right: 8px;
      font-size: 18px;
    }

    .checklist .status.ok {
      color: #4caf50;
    }

    .checklist .status.ng {
      color: #f44336;
    }

    .checklist .required {
      color: #f44336;
      font-size: 12px;
      margin-left: 4px;
    }

    /* 警告・エラー */
    .warning {
      background-color: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 12px;
      margin: 8px 0;
      font-size: 13px;
    }

    .error {
      background-color: #ffebee;
      border-left: 4px solid #f44336;
      padding: 12px;
      margin: 8px 0;
      font-size: 13px;
    }

    /* 保存結果 */
    .save-result {
      background-color: #e8f5e9;
      border-left: 4px solid #4caf50;
      padding: 12px;
      margin: 8px 0;
    }

    .save-result a {
      color: #1976d2;
      text-decoration: none;
    }

    /* 手順説明 */
    .instructions {
      background-color: #e3f2fd;
      padding: 12px;
      border-radius: 4px;
      margin: 8px 0;
    }

    .instructions ol {
      margin: 0;
      padding-left: 20px;
    }

    .instructions li {
      font-size: 13px;
      margin: 4px 0;
    }

    /* モーダルダイアログ */
    .mdl-dialog {
      width: 90%;
      max-width: 360px;
      border: none;
      border-radius: 4px;
      box-shadow: 0 9px 46px 8px rgba(0,0,0,.14), 0 11px 15px -7px rgba(0,0,0,.12), 0 24px 38px 3px rgba(0,0,0,.2);
    }

    .mdl-dialog.fallback-open {
      display: block;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      z-index: 10000;
    }

    .mdl-dialog__title {
      font-size: 18px;
      padding: 16px 16px 0;
    }

    .mdl-dialog__content {
      padding: 16px;
    }

    .mdl-dialog__actions {
      padding: 8px;
      display: flex;
      justify-content: flex-end;
    }

    /* トースト */
    .toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #333;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .toast.show {
      opacity: 1;
    }

    /* ローディング */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255,255,255,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9998;
    }

    /* モード表示 */
    .mode-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin: 8px 0;
    }

    .mode-badge.fact-based {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .mode-badge.ai-knowledge {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    /* 区切り線 */
    hr {
      border: none;
      border-top: 1px solid #eee;
      margin: 16px 0;
    }

  </style>
</head>
<body>
  <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-tabs">

    <!-- ヘッダー -->
    <header class="mdl-layout__header">
      <div class="mdl-layout__header-row">
        <span class="mdl-layout-title">ArticleCreator</span>
        <div class="header-spacer"></div>
        <button id="settings-btn" class="mdl-button mdl-js-button mdl-button--icon" type="button">
          <i class="material-icons">settings</i>
        </button>
      </div>

      <!-- タブナビゲーション -->
      <div class="mdl-layout__tab-bar mdl-js-ripple-effect">
        <a href="#tab-research" class="mdl-layout__tab is-active">調査</a>
        <a href="#tab-writing" class="mdl-layout__tab">執筆</a>
        <a href="#tab-image" class="mdl-layout__tab">画像</a>
        <a href="#tab-slides" class="mdl-layout__tab">資料</a>
        <a href="#tab-complete" class="mdl-layout__tab">完了</a>
      </div>
    </header>

    <!-- メインコンテンツ -->
    <main class="mdl-layout__content">

      <!-- 調査タブ -->
      <section class="mdl-layout__tab-panel is-active" id="tab-research">
        <div class="page-content">
          <div class="instructions">
            <ol>
              <li>テーマと設定を入力</li>
              <li>「コピー」ボタンでプロンプトをコピー → 「Gemを開く」でDeep Researchへ</li>
              <li>調査結果を「調査結果」欄にダブルクリックで貼り付け</li>
            </ol>
          </div>
          <h5 class="section-title">基本設定</h5>
          <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width:100%">
            <input class="mdl-textfield__input" type="text" id="theme-input">
            <label class="mdl-textfield__label" for="theme-input">調べる技術テーマ（短く具体的に）</label>
          </div>

          <div class="select-group" style="width:100%;margin-bottom:12px;">
            <label>記事で達成したいこと:</label>
            <select id="article-goal-select" style="width:100%">
              <option value="">（選択しない）</option>
              <option value="導入判断できる根拠を揃える" selected>導入判断できる根拠を揃える</option>
              <option value="実装判断できる根拠を揃える">実装判断できる根拠を揃える</option>
              <option value="比較検討材料を揃える">比較検討材料を揃える</option>
              <option value="手順化・ハウツーにする">手順化・ハウツーにする</option>
              <option value="落とし穴・注意点を網羅する">落とし穴・注意点を網羅する</option>
              <option value="ベストプラクティスをまとめる">ベストプラクティスをまとめる</option>
              <option value="技術的背景を理解する">技術的背景を理解する</option>
              <option value="移行・アップグレード手順を整理する">移行・アップグレード手順を整理する</option>
              <option value="トラブルシューティングガイドを作る">トラブルシューティングガイドを作る</option>
              <option value="セキュリティ対策を整理する">セキュリティ対策を整理する</option>
              <option value="パフォーマンス改善方法をまとめる">パフォーマンス改善方法をまとめる</option>
              <option value="運用設計・監視設計をまとめる">運用設計・監視設計をまとめる</option>
              <option value="アーキテクチャ設計の参考にする">アーキテクチャ設計の参考にする</option>
              <option value="チームへの共有・教育資料にする">チームへの共有・教育資料にする</option>
            </select>
          </div>

          <div class="select-row">
            <div class="select-group">
              <label>想定読者:</label>
              <select id="audience-select">
                <option value="">（選択しない）</option>
                <option value="エンジニア全般" selected>エンジニア全般</option>
                <option value="backendエンジニア">backend</option>
                <option value="frontendエンジニア">frontend</option>
                <option value="SRE/インフラエンジニア">SRE/インフラ</option>
                <option value="DevOpsエンジニア">DevOps</option>
                <option value="データエンジニア">データ</option>
                <option value="セキュリティエンジニア">セキュリティ</option>
                <option value="モバイルエンジニア">モバイル</option>
                <option value="ML/AIエンジニア">ML/AI</option>
                <option value="テックリード/アーキテクト">テックリード</option>
                <option value="PM/PdM">PM/PdM</option>
              </select>
            </div>
            <div class="select-group">
              <label>対象レベル:</label>
              <select id="level-select">
                <option value="">（選択しない）</option>
                <option value="beginner">beginner</option>
                <option value="intermediate" selected>intermediate</option>
                <option value="advanced">advanced</option>
              </select>
            </div>
          </div>

          <div class="select-row">
            <div class="select-group">
              <label>記事タイプ:</label>
              <select id="article-type-research-select">
                <option value="">（選択しない）</option>
                <option value="解説" selected>解説</option>
                <option value="比較">比較</option>
                <option value="手順">手順</option>
                <option value="導入ガイド">導入ガイド</option>
                <option value="設計レビュー">設計レビュー</option>
                <option value="移行ガイド">移行ガイド</option>
                <option value="トラブルシューティング">トラブルシュート</option>
                <option value="ベストプラクティス">ベストプラクティス</option>
                <option value="事例紹介">事例紹介</option>
                <option value="ベンチマーク">ベンチマーク</option>
                <option value="障害報告">障害報告</option>
              </select>
            </div>
            <div class="select-group">
              <label>記事の意図:</label>
              <select id="intent-select">
                <option value="">（選択しない）</option>
                <option value="inform" selected>inform</option>
                <option value="persuade">persuade</option>
                <option value="guide">guide</option>
                <option value="evaluate">evaluate</option>
                <option value="entertain">entertain</option>
              </select>
            </div>
          </div>

          <div class="select-row">
            <div class="select-group">
              <label>調査深度:</label>
              <select id="depth-select">
                <option value="">（選択しない）</option>
                <option value="quick">quick</option>
                <option value="standard" selected>standard</option>
                <option value="deep">deep</option>
              </select>
            </div>
            <div class="select-group">
              <label>情報の鮮度:</label>
              <select id="time-range-select">
                <option value="">（選択しない）</option>
                <option value="最新" selected>最新</option>
                <option value="1週間以内">1週間以内</option>
                <option value="1ヶ月以内">1ヶ月以内</option>
                <option value="3ヶ月以内">3ヶ月以内</option>
                <option value="半年以内">半年以内</option>
                <option value="1年以内">1年以内</option>
                <option value="指定なし">指定なし</option>
              </select>
            </div>
          </div>

          <div class="checkbox-group">
            <label>検索言語:</label>
            <label class="mdl-checkbox mdl-js-checkbox" for="lang-ja">
              <input type="checkbox" id="lang-ja" class="mdl-checkbox__input" checked>
              <span class="mdl-checkbox__label">ja</span>
            </label>
            <label class="mdl-checkbox mdl-js-checkbox" for="lang-en">
              <input type="checkbox" id="lang-en" class="mdl-checkbox__input" checked>
              <span class="mdl-checkbox__label">en</span>
            </label>
          </div>

          <h5 class="section-title">成果物 (deliverable)</h5>
          <div class="select-row">
            <div class="select-group">
              <label>type:</label>
              <select id="deliverable-type-select">
                <option value="">（選択しない）</option>
                <option value="research_report" selected>research_report</option>
                <option value="outline">outline</option>
                <option value="comparison">comparison</option>
                <option value="howto">howto</option>
                <option value="faq">faq</option>
                <option value="checklist">checklist</option>
                <option value="decision_matrix">decision_matrix</option>
                <option value="pros_cons">pros_cons</option>
              </select>
            </div>
            <div class="select-group">
              <label>length:</label>
              <select id="deliverable-length-select">
                <option value="">（選択しない）</option>
                <option value="A4 1枚程度">A4 1枚</option>
                <option value="A4 2〜3枚相当" selected>A4 2-3枚</option>
                <option value="A4 4〜5枚相当">A4 4-5枚</option>
                <option value="A4 6枚以上（詳細）">A4 6枚以上</option>
                <option value="見出し+要点10項目">要点10項目</option>
                <option value="見出し+要点20項目">要点20項目</option>
                <option value="比較表中心">比較表中心</option>
              </select>
            </div>
          </div>

          <h5 class="section-title">品質基準 (quality_bar)</h5>
          <div class="select-row">
            <div class="select-group">
              <label>一次情報優先:</label>
              <select id="quality-primary-select">
                <option value="true" selected>はい</option>
                <option value="false">いいえ</option>
              </select>
            </div>
            <div class="select-group">
              <label>重要主張の独立ソース:</label>
              <select id="quality-min-sources-select">
                <option value="1">1本</option>
                <option value="2" selected>2本以上</option>
                <option value="3">3本以上</option>
              </select>
            </div>
          </div>
          <div class="select-group" style="width:100%;margin-bottom:16px;">
            <label>ブログを補助情報として許可:</label>
            <select id="quality-allow-blogs-select" style="width:100%">
              <option value="true" selected>はい</option>
              <option value="false">いいえ</option>
            </select>
          </div>

          <h5 class="section-title">生成プロンプト</h5>
          <div class="prompt-area">
            <textarea id="research-prompt" readonly placeholder="上記を入力するとYAMLプロンプトが生成されます"></textarea>
          </div>

          <div class="button-group">
            <button class="mdl-button mdl-js-button mdl-button--raised" id="copy-research-prompt">
              <i class="material-icons">content_copy</i> コピー
            </button>
            <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" id="open-gem-research">
              <i class="material-icons">open_in_new</i> Gemを開く
            </button>
          </div>

          <h5 class="section-title">調査結果</h5>
          <div class="mdl-textfield mdl-js-textfield" style="width:100%">
            <textarea class="mdl-textfield__input" type="text" rows="8" id="research-result"></textarea>
            <label class="mdl-textfield__label" for="research-result">調査結果をペースト（省略可）</label>
          </div>
        </div>
      </section>

      <!-- 執筆タブ -->
      <section class="mdl-layout__tab-panel" id="tab-writing">
        <div class="page-content">
          <div class="instructions">
            <ol>
              <li>記事の設定を確認・調整</li>
              <li>「コピー」ボタンでプロンプトをコピー → 「Gemを開く」で記事生成</li>
              <li>生成された記事を「記事内容」欄にダブルクリックで貼り付け</li>
            </ol>
          </div>
          <div id="writing-mode-badge" class="mode-badge ai-knowledge">
            AI知識補完モード
          </div>

          <h5 class="section-title">基本情報</h5>
          <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width:100%">
            <input class="mdl-textfield__input" type="text" id="article-title-input">
            <label class="mdl-textfield__label" for="article-title-input">記事タイトル</label>
          </div>

          <h5 class="section-title">読者 (audience)</h5>
          <div class="select-row">
            <div class="select-group">
              <label>role（対象読者層）:</label>
              <select id="audience-role-select">
                <option value="backend" selected>backend</option>
                <option value="frontend">frontend</option>
                <option value="SRE">SRE</option>
                <option value="DevOps">DevOps</option>
                <option value="data">data</option>
                <option value="security">security</option>
                <option value="mobile">mobile</option>
                <option value="infra">infra</option>
                <option value="ML/AI">ML/AI</option>
              </select>
            </div>
            <div class="select-group">
              <label>level（レベル）:</label>
              <select id="audience-level-select">
                <option value="beginner">beginner</option>
                <option value="intermediate" selected>intermediate</option>
                <option value="advanced">advanced</option>
              </select>
            </div>
          </div>

          <h5 class="section-title">ゴール (goal)</h5>
          <div class="select-group" style="width:100%;margin-bottom:16px;">
            <label>reader_outcome（読了後にできること）:</label>
            <select id="reader-outcome-select" style="width:100%">
              <option value="導入判断ができる" selected>導入判断ができる</option>
              <option value="実装ができる">実装ができる</option>
              <option value="トラブルシューティングができる">トラブルシューティングができる</option>
              <option value="設計レビューができる">設計レビューができる</option>
              <option value="移行計画を立てられる">移行計画を立てられる</option>
              <option value="パフォーマンス改善ができる">パフォーマンス改善ができる</option>
              <option value="セキュリティ対策ができる">セキュリティ対策ができる</option>
              <option value="運用設計ができる">運用設計ができる</option>
              <option value="技術選定ができる">技術選定ができる</option>
              <option value="ベストプラクティスを適用できる">ベストプラクティスを適用できる</option>
            </select>
          </div>

          <h5 class="section-title">記事タイプ (article_type)</h5>
          <div class="select-group" style="width:100%;margin-bottom:16px;">
            <select id="article-type-select" style="width:100%">
              <option value="解説" selected>解説（概念・仕組み説明）</option>
              <option value="比較">比較（選定・評価）</option>
              <option value="手順">手順（チュートリアル）</option>
              <option value="導入ガイド">導入ガイド</option>
              <option value="設計レビュー">設計レビュー</option>
              <option value="移行ガイド">移行ガイド</option>
              <option value="トラブルシューティング">トラブルシューティング</option>
              <option value="ベストプラクティス">ベストプラクティス</option>
              <option value="事例紹介">事例紹介（ケーススタディ）</option>
              <option value="ベンチマーク">ベンチマーク（性能検証）</option>
              <option value="障害報告">障害報告（ポストモーテム）</option>
              <option value="ニュースまとめ">ニュースまとめ</option>
              <option value="レビュー">レビュー（使用感）</option>
            </select>
          </div>

          <h5 class="section-title">スタイル (style)</h5>
          <div class="select-row">
            <div class="select-group">
              <label>tone（トーン）:</label>
              <select id="style-tone-select">
                <option value="実務的" selected>実務的</option>
                <option value="丁寧">丁寧</option>
                <option value="フレンドリー">フレンドリー</option>
                <option value="カジュアル">カジュアル</option>
                <option value="フォーマル">フォーマル</option>
                <option value="アカデミック">アカデミック</option>
              </select>
            </div>
            <div class="select-group">
              <label>length（長さ）:</label>
              <select id="style-length-select">
                <option value="short">short（800-1200字）</option>
                <option value="medium" selected>medium（1500-2500字）</option>
                <option value="long">long（3000-5000字）</option>
                <option value="1200-1600字">1200-1600字</option>
                <option value="2000-3000字">2000-3000字</option>
                <option value="4000-6000字">4000-6000字</option>
              </select>
            </div>
          </div>

          <h5 class="section-title">SEO</h5>
          <div class="select-group" style="width:100%;margin-bottom:16px;">
            <label>search_intent（検索意図）:</label>
            <select id="search-intent-select" style="width:100%">
              <option value="how-to" selected>how-to（やり方を知りたい）</option>
              <option value="troubleshooting">troubleshooting（問題を解決したい）</option>
              <option value="concept">concept（概念を理解したい）</option>
              <option value="comparison">comparison（比較したい）</option>
              <option value="best-practices">best-practices（ベストプラクティスを知りたい）</option>
            </select>
          </div>

          <h5 class="section-title">生成プロンプト</h5>
          <div class="prompt-area">
            <textarea id="writing-prompt" readonly placeholder="設定を選択するとYAMLプロンプトが生成されます"></textarea>
          </div>

          <div class="button-group">
            <button class="mdl-button mdl-js-button mdl-button--raised" id="copy-writing-prompt">
              <i class="material-icons">content_copy</i> コピー
            </button>
            <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" id="open-gem-writing">
              <i class="material-icons">open_in_new</i> Gemを開く
            </button>
          </div>

          <h5 class="section-title">記事内容</h5>
          <div class="mdl-textfield mdl-js-textfield">
            <textarea class="mdl-textfield__input" type="text" rows="10" id="article-content"></textarea>
            <label class="mdl-textfield__label" for="article-content">記事をペースト（Markdown形式）</label>
          </div>
        </div>
      </section>

      <!-- 画像タブ -->
      <section class="mdl-layout__tab-panel" id="tab-image">
        <div class="page-content">
          <div class="instructions">
            <ol>
              <li>画像の設定を確認・調整</li>
              <li>「コピー」ボタンでプロンプトをコピー → 「Nanobananaを開く」で画像生成</li>
              <li>生成された画像をコピーし、画像エリアをダブルクリックで貼り付け</li>
            </ol>
          </div>
          <h5 class="section-title">画像設定</h5>
          <div class="select-row">
            <div class="select-group">
              <label>アスペクト比:</label>
              <select id="image-aspect-ratio-select">
                <option value="16:9" selected>16:9（横長）</option>
                <option value="4:3">4:3（標準）</option>
                <option value="1:1">1:1（正方形）</option>
                <option value="9:16">9:16（縦長）</option>
              </select>
            </div>
            <div class="select-group">
              <label>スタイル:</label>
              <select id="image-style-family-select">
                <option value="editorial-illustration" selected>記事イラスト</option>
                <option value="photographic">写真風</option>
                <option value="minimalist">ミニマリスト</option>
                <option value="corporate">ビジネス</option>
                <option value="technical-diagram">技術図解</option>
                <option value="flat-design">フラットデザイン</option>
                <option value="infographic">インフォグラフィック</option>
              </select>
            </div>
          </div>

          <div class="select-row">
            <div class="select-group">
              <label>主題:</label>
              <select id="image-subject-type-select">
                <option value="auto" selected>自動判定</option>
                <option value="icon">アイコン</option>
                <option value="concept">概念</option>
                <option value="diagram">図解</option>
                <option value="code">コード</option>
                <option value="device">デバイス</option>
              </select>
            </div>
            <div class="select-group">
              <label>雰囲気:</label>
              <select id="image-mood-select">
                <option value="professional" selected>プロフェッショナル</option>
                <option value="friendly">フレンドリー</option>
                <option value="innovative">革新的</option>
                <option value="calm">落ち着いた</option>
                <option value="futuristic">未来的</option>
              </select>
            </div>
          </div>

          <h5 class="section-title">タイポグラフィ</h5>
          <div class="select-row">
            <div class="select-group">
              <label>文字を含める:</label>
              <select id="image-typography-enabled-select">
                <option value="true" selected>有効</option>
                <option value="false">無効</option>
              </select>
            </div>
            <div class="select-group">
              <label>文字スタイル:</label>
              <select id="image-typography-style-select">
                <option value="keyword" selected>キーワード</option>
                <option value="title-only">タイトルのみ</option>
                <option value="catchphrase">キャッチフレーズ</option>
                <option value="none">なし</option>
              </select>
            </div>
          </div>

          <h5 class="section-title">生成プロンプト</h5>
          <div class="prompt-area">
            <textarea id="image-prompt" readonly placeholder="記事を入力すると画像プロンプトが生成されます"></textarea>
          </div>

          <div class="button-group">
            <button class="mdl-button mdl-js-button mdl-button--raised" id="copy-image-prompt">
              <i class="material-icons">content_copy</i> コピー
            </button>
            <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" id="open-gem-nanobanana">
              <i class="material-icons">open_in_new</i> Nanobananaを開く
            </button>
          </div>

          <h5 class="section-title">画像アップロード</h5>
          <div class="file-upload-group">
            <input type="file" id="image-upload" accept="image/*">
          </div>
          <div class="preview-container">
            <img id="image-preview" style="display: none;">
          </div>
        </div>
      </section>

      <!-- 資料タブ -->
      <section class="mdl-layout__tab-panel" id="tab-slides">
        <div class="page-content">
          <div class="instructions">
            <ol>
              <li>スライドの設定を確認・調整</li>
              <li>「コピー」ボタンでプロンプトをコピー → 「Gem Dを開く」でスライド構成を作成</li>
              <li>構成をNotebookLMにアップロードしてPDFを生成</li>
              <li>生成したPDFをアップロード</li>
            </ol>
          </div>
          <h5 class="section-title">NotebookLM スライド設定</h5>

          <div class="select-row">
            <div class="select-group">
              <label>形式 (format):</label>
              <select id="slides-format-select">
                <option value="presenter_slides" selected>Presenter Slides（発表用）</option>
                <option value="detailed_deck">Detailed Deck（詳細資料）</option>
              </select>
            </div>
            <div class="select-group">
              <label>言語 (language):</label>
              <select id="slides-language-select">
                <option value="ja" selected>日本語</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <h5 class="section-title">スライド枚数</h5>
          <div class="select-row">
            <div class="select-group">
              <label>最小:</label>
              <select id="slides-count-min-select">
                <option value="5">5枚</option>
                <option value="6">6枚</option>
                <option value="7">7枚</option>
                <option value="8" selected>8枚</option>
                <option value="10">10枚</option>
                <option value="12">12枚</option>
              </select>
            </div>
            <div class="select-group">
              <label>目標:</label>
              <select id="slides-count-target-select">
                <option value="8">8枚</option>
                <option value="10" selected>10枚</option>
                <option value="12">12枚</option>
                <option value="14">14枚</option>
                <option value="15">15枚</option>
                <option value="18">18枚</option>
              </select>
            </div>
            <div class="select-group">
              <label>最大:</label>
              <select id="slides-count-max-select">
                <option value="10">10枚</option>
                <option value="12">12枚</option>
                <option value="14" selected>14枚</option>
                <option value="16">16枚</option>
                <option value="18">18枚</option>
                <option value="20">20枚</option>
              </select>
            </div>
          </div>

          <h5 class="section-title">デッキ情報</h5>
          <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width:100%">
            <input class="mdl-textfield__input" type="text" id="slides-title-input">
            <label class="mdl-textfield__label" for="slides-title-input">タイトル（空欄なら記事から推定）</label>
          </div>

          <div class="select-group" style="width:100%;margin-bottom:16px;">
            <label>対象者 (audience):</label>
            <select id="slides-audience-select" style="width:100%">
              <option value="社内エンジニア向け" selected>社内エンジニア向け</option>
              <option value="非技術者向け">非技術者向け</option>
              <option value="経営層向け">経営層向け</option>
              <option value="PM/PdM向け">PM/PdM向け</option>
              <option value="顧客向け">顧客向け</option>
              <option value="カンファレンス発表">カンファレンス発表</option>
              <option value="勉強会・LT">勉強会・LT</option>
              <option value="チーム共有">チーム共有</option>
              <option value="新人研修">新人研修</option>
              <option value="技術選定会議">技術選定会議</option>
            </select>
          </div>

          <h5 class="section-title">スタイル設定</h5>
          <div class="select-row">
            <div class="select-group">
              <label>レベル (audience_level):</label>
              <select id="slides-level-select">
                <option value="beginner">beginner（入門）</option>
                <option value="intermediate" selected>intermediate（中級）</option>
                <option value="expert">expert（専門家）</option>
              </select>
            </div>
            <div class="select-group">
              <label>トーン (tone):</label>
              <select id="slides-tone-select">
                <option value="business" selected>business（ビジネス）</option>
                <option value="academic">academic（学術的）</option>
                <option value="friendly">friendly（親しみやすい）</option>
                <option value="playful_bold">playful_bold（大胆）</option>
              </select>
            </div>
          </div>

          <div class="select-row">
            <div class="select-group">
              <label>文体 (japanese_writing_style):</label>
              <select id="slides-writing-style-select">
                <option value="desu_masu" selected>です・ます調</option>
                <option value="dearu">である調</option>
                <option value="mixed_minimal">混合・簡潔</option>
              </select>
            </div>
            <div class="select-group">
              <label>デザイン (design):</label>
              <select id="slides-design-select">
                <option value="clean_corporate" selected>clean_corporate（企業向け）</option>
                <option value="minimal">minimal（シンプル）</option>
                <option value="bold_playful">bold_playful（大胆ポップ）</option>
                <option value="research_report">research_report（研究報告）</option>
              </select>
            </div>
          </div>

          <h5 class="section-title">参照URL（任意）</h5>
          <div class="mdl-textfield mdl-js-textfield" style="width:100%">
            <textarea class="mdl-textfield__input" type="text" rows="3" id="slides-urls-input" placeholder="https://example.com/doc1"></textarea>
            <label class="mdl-textfield__label" for="slides-urls-input">参照URLを1行に1つ入力</label>
          </div>

          <h5 class="section-title">生成プロンプト（YAML）</h5>
          <div class="prompt-area">
            <textarea id="slides-prompt" readonly placeholder="設定を選択するとYAMLプロンプトが生成されます"></textarea>
          </div>

          <div class="button-group">
            <button class="mdl-button mdl-js-button mdl-button--raised" id="copy-slides-prompt">
              <i class="material-icons">content_copy</i> コピー
            </button>
            <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" id="open-gem-slides">
              <i class="material-icons">open_in_new</i> Gem Dを開く
            </button>
          </div>

          <h5 class="section-title">NotebookLM連携手順</h5>
          <div class="instructions">
            <ol>
              <li>上記YAMLと記事（article.md）をGem Dに添付</li>
              <li>Gemがスライド構成表を提示 → 修正指示を繰り返す</li>
              <li>OKを送ると最終JSONが出力される</li>
              <li>NotebookLMでソースを追加し、Slide Deckを選択</li>
              <li>PromptにJSONを貼り付けて生成</li>
              <li>生成したPDFを下記からアップロード</li>
            </ol>
          </div>

          <h5 class="section-title">PDFアップロード</h5>
          <div class="file-upload-group">
            <input type="file" id="pdf-upload" accept="application/pdf">
          </div>
          <p id="pdf-status" style="font-size: 13px; color: #757575;">PDFが選択されていません</p>
        </div>
      </section>

      <!-- 完了タブ -->
      <section class="mdl-layout__tab-panel" id="tab-complete">
        <div class="page-content">
          <div class="instructions">
            <ol>
              <li>成果物一覧で各ファイルの状態を確認</li>
              <li>「全て保存」ボタンでGoogle Driveに一括保存</li>
              <li>保存後、フォルダリンクから成果物を確認</li>
            </ol>
          </div>
          <h5 class="section-title">成果物一覧</h5>
          <ul class="checklist" id="files-checklist">
            <li id="check-research">
              <span class="status ng">close</span>
              調査結果 (01_research_results.txt)
            </li>
            <li id="check-article">
              <span class="status ng">close</span>
              記事 (02_theme_article.md)
              <span class="required">*必須</span>
            </li>
            <li id="check-image">
              <span class="status ng">close</span>
              画像 (03_thumbnail.png)
            </li>
            <li id="check-pdf">
              <span class="status ng">close</span>
              PDF (04_presentation.pdf)
            </li>
          </ul>

          <div id="validation-warnings" class="warning" style="display: none;"></div>
          <div id="validation-errors" class="error" style="display: none;"></div>

          <div class="button-group">
            <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" id="save-all-btn">
              <i class="material-icons">save</i> 全て保存
            </button>
          </div>

          <div id="save-result" class="save-result" style="display: none;">
            <p><i class="material-icons" style="vertical-align: middle; color: #4caf50;">check_circle</i> 保存完了!</p>
            <a id="folder-link" href="#" target="_blank">
              <i class="material-icons" style="vertical-align: middle;">folder_open</i> フォルダを開く
            </a>
          </div>

          <hr>

          <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" id="new-project-btn">
            <i class="material-icons">add</i> 新規作成
          </button>
        </div>
      </section>

    </main>
  </div>

  <!-- 設定モーダル -->
  <dialog id="settings-modal" class="mdl-dialog">
    <h4 class="mdl-dialog__title">設定</h4>
    <div class="mdl-dialog__content">
      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
        <input class="mdl-textfield__input" type="text" id="gem-research-url">
        <label class="mdl-textfield__label" for="gem-research-url">Gem A (Research) URL</label>
      </div>
      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
        <input class="mdl-textfield__input" type="text" id="gem-writing-url">
        <label class="mdl-textfield__label" for="gem-writing-url">Gem B (Writing) URL</label>
      </div>
      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
        <input class="mdl-textfield__input" type="text" id="gem-nanobanana-url">
        <label class="mdl-textfield__label" for="gem-nanobanana-url">Gem C (Nanobanana) URL</label>
      </div>
      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
        <input class="mdl-textfield__input" type="text" id="gem-slides-url">
        <label class="mdl-textfield__label" for="gem-slides-url">Gem D (Slides) URL</label>
      </div>
      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
        <input class="mdl-textfield__input" type="text" id="drive-folder-url">
        <label class="mdl-textfield__label" for="drive-folder-url">保存先フォルダ URL</label>
      </div>
    </div>
    <div class="mdl-dialog__actions">
      <button type="button" class="mdl-button mdl-button--primary" id="save-settings-btn">保存</button>
      <button type="button" class="mdl-button close" id="close-settings-btn">閉じる</button>
    </div>
  </dialog>

  <!-- トースト -->
  <div id="toast" class="toast"></div>

  <script>
    // ============================================
    // グローバル状態
    // ============================================
    let currentSettings = {};
    let currentState = {};
    let saveTimeout = null;

    // ============================================
    // 初期化
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
      initializeApp();
    });

    function initializeApp() {
      // ダイアログポリフィル
      const dialog = document.getElementById('settings-modal');
      if (!dialog.showModal && typeof dialogPolyfill !== 'undefined') {
        dialogPolyfill.registerDialog(dialog);
      }

      // 設定読込
      google.script.run
        .withSuccessHandler(function(settings) {
          currentSettings = settings || {};
          populateSettingsForm();
        })
        .withFailureHandler(handleError)
        .getSettings();

      // 状態読込
      google.script.run
        .withSuccessHandler(function(state) {
          currentState = state || {};
          restoreState();
          updateAllPrompts();
          updateChecklist();
        })
        .withFailureHandler(function(error) {
          currentState = {};
          restoreState();
          updateAllPrompts();
          updateChecklist();
          handleError(error);
        })
        .getState();

      // イベントリスナー設定
      setupEventListeners();
    }

    // ============================================
    // イベントリスナー
    // ============================================
    function setupEventListeners() {
      // 設定モーダル
      const settingsBtn = document.getElementById('settings-btn');
      if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettingsModal);
      }
      document.getElementById('close-settings-btn').onclick = closeSettingsModal;
      document.getElementById('save-settings-btn').onclick = saveSettings;

      // 調査タブ - 基本設定
      document.getElementById('theme-input').oninput = debounce(onResearchFieldChange, 300);
      document.getElementById('article-goal-select').onchange = onResearchFieldChange;
      document.getElementById('audience-select').onchange = onResearchFieldChange;
      document.getElementById('level-select').onchange = onResearchFieldChange;
      document.getElementById('article-type-research-select').onchange = onResearchFieldChange;
      document.getElementById('intent-select').onchange = onResearchFieldChange;
      document.getElementById('depth-select').onchange = onResearchFieldChange;
      document.getElementById('time-range-select').onchange = onResearchFieldChange;
      document.getElementById('lang-ja').onchange = onResearchFieldChange;
      document.getElementById('lang-en').onchange = onResearchFieldChange;

      // 調査タブ - deliverable & quality_bar
      document.getElementById('deliverable-type-select').onchange = onResearchFieldChange;
      document.getElementById('deliverable-length-select').onchange = onResearchFieldChange;
      document.getElementById('quality-primary-select').onchange = onResearchFieldChange;
      document.getElementById('quality-min-sources-select').onchange = onResearchFieldChange;
      document.getElementById('quality-allow-blogs-select').onchange = onResearchFieldChange;

      // 調査タブ - ボタン
      document.getElementById('copy-research-prompt').onclick = function() {
        copyToClipboard(document.getElementById('research-prompt').value);
      };
      document.getElementById('open-gem-research').onclick = function() {
        openGemUrl(currentSettings.gemUrl_research);
      };
      document.getElementById('research-result').oninput = debounce(onResearchResultChange, 500);
      document.getElementById('research-result').ondblclick = function() {
        pasteFromClipboard(this, onResearchResultChange);
      };

      // 執筆タブ - 基本情報
      document.getElementById('article-title-input').oninput = debounce(onWritingSettingsChange, 300);

      // 執筆タブ - audience
      document.getElementById('audience-role-select').onchange = onWritingSettingsChange;
      document.getElementById('audience-level-select').onchange = onWritingSettingsChange;

      // 執筆タブ - goal
      document.getElementById('reader-outcome-select').onchange = onWritingSettingsChange;

      // 執筆タブ - article_type, style, SEO
      document.getElementById('article-type-select').onchange = onWritingSettingsChange;
      document.getElementById('style-tone-select').onchange = onWritingSettingsChange;
      document.getElementById('style-length-select').onchange = onWritingSettingsChange;
      document.getElementById('search-intent-select').onchange = onWritingSettingsChange;

      // 執筆タブ - ボタン
      document.getElementById('copy-writing-prompt').onclick = function() {
        copyToClipboard(document.getElementById('writing-prompt').value);
      };
      document.getElementById('open-gem-writing').onclick = function() {
        openGemUrl(currentSettings.gemUrl_writing);
      };
      document.getElementById('article-content').oninput = debounce(onArticleChange, 500);
      document.getElementById('article-content').ondblclick = function() {
        pasteFromClipboard(this, onArticleChange);
      };

      // 画像タブ - 設定
      document.getElementById('image-aspect-ratio-select').onchange = onImageSettingsChange;
      document.getElementById('image-style-family-select').onchange = onImageSettingsChange;
      document.getElementById('image-subject-type-select').onchange = onImageSettingsChange;
      document.getElementById('image-mood-select').onchange = onImageSettingsChange;
      document.getElementById('image-typography-enabled-select').onchange = onImageSettingsChange;
      document.getElementById('image-typography-style-select').onchange = onImageSettingsChange;

      // 画像タブ - ボタン
      document.getElementById('copy-image-prompt').onclick = function() {
        copyToClipboard(document.getElementById('image-prompt').value);
      };
      document.getElementById('open-gem-nanobanana').onclick = function() {
        openGemUrl(currentSettings.gemUrl_nanobanana);
      };
      const imageUpload = document.getElementById('image-upload');
      const imagePreview = document.getElementById('image-preview');
      const imagePreviewContainer = imagePreview ? imagePreview.parentElement : null;
      imageUpload.onchange = onImageUpload;
      imageUpload.ondblclick = pasteImageFromClipboard;
      if (imageUpload.parentElement) {
        imageUpload.parentElement.ondblclick = pasteImageFromClipboard;
      }
      if (imagePreviewContainer) {
        imagePreviewContainer.ondblclick = pasteImageFromClipboard;
      }
      if (imagePreview) {
        imagePreview.ondblclick = pasteImageFromClipboard;
      }

      // 資料タブ - 設定フィールド
      document.getElementById('slides-format-select').onchange = onSlidesFieldChange;
      document.getElementById('slides-language-select').onchange = onSlidesFieldChange;
      document.getElementById('slides-count-min-select').onchange = onSlidesFieldChange;
      document.getElementById('slides-count-target-select').onchange = onSlidesFieldChange;
      document.getElementById('slides-count-max-select').onchange = onSlidesFieldChange;
      document.getElementById('slides-title-input').oninput = debounce(onSlidesFieldChange, 300);
      document.getElementById('slides-audience-select').onchange = onSlidesFieldChange;
      document.getElementById('slides-level-select').onchange = onSlidesFieldChange;
      document.getElementById('slides-tone-select').onchange = onSlidesFieldChange;
      document.getElementById('slides-writing-style-select').onchange = onSlidesFieldChange;
      document.getElementById('slides-design-select').onchange = onSlidesFieldChange;
      document.getElementById('slides-urls-input').oninput = debounce(onSlidesFieldChange, 300);

      // 資料タブ - ボタン
      document.getElementById('copy-slides-prompt').onclick = function() {
        copyToClipboard(document.getElementById('slides-prompt').value);
      };
      document.getElementById('open-gem-slides').onclick = function() {
        openGemUrl(currentSettings.gemUrl_slides);
      };
      document.getElementById('pdf-upload').onchange = onPdfUpload;

      // 完了タブ
      document.getElementById('save-all-btn').onclick = saveAllToDrive;
      document.getElementById('new-project-btn').onclick = startNewProject;
    }

    // ============================================
    // 設定モーダル
    // ============================================
    function openSettingsModal() {
      const dialog = document.getElementById('settings-modal');
      if (!dialog) {
        showToast('設定ダイアログが見つかりません');
        return;
      }
      populateSettingsForm();
      try {
        if (dialog.showModal) {
          dialog.showModal();
        } else if (dialog.show) {
          dialog.show();
        } else {
          dialog.setAttribute('open', '');
          dialog.classList.add('fallback-open');
        }
      } catch (e) {
        dialog.setAttribute('open', '');
        dialog.classList.add('fallback-open');
      }
    }

    function closeSettingsModal() {
      const dialog = document.getElementById('settings-modal');
      if (!dialog) return;
      if (dialog.close) {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
        dialog.classList.remove('fallback-open');
      }
    }

    function populateSettingsForm() {
      document.getElementById('gem-research-url').value = currentSettings.gemUrl_research || '';
      document.getElementById('gem-writing-url').value = currentSettings.gemUrl_writing || '';
      document.getElementById('gem-nanobanana-url').value = currentSettings.gemUrl_nanobanana || '';
      document.getElementById('gem-slides-url').value = currentSettings.gemUrl_slides || '';
      document.getElementById('drive-folder-url').value = currentSettings.driveFolderUrl || '';

      // MDL テキストフィールドの状態更新
      document.querySelectorAll('.mdl-textfield').forEach(function(el) {
        if (el.MaterialTextfield) el.MaterialTextfield.checkDirty();
      });
    }

    function saveSettings() {
      const settings = {
        gemUrl_research: document.getElementById('gem-research-url').value,
        gemUrl_writing: document.getElementById('gem-writing-url').value,
        gemUrl_nanobanana: document.getElementById('gem-nanobanana-url').value,
        gemUrl_slides: document.getElementById('gem-slides-url').value,
        driveFolderUrl: document.getElementById('drive-folder-url').value
      };

      google.script.run
        .withSuccessHandler(function(result) {
          currentSettings = settings;
          showToast(result.message);
          closeSettingsModal();
        })
        .withFailureHandler(handleError)
        .saveSettings(settings);
    }

    // ============================================
    // 状態管理
    // ============================================
    function restoreState() {
      // 調査タブ - 基本設定
      document.getElementById('theme-input').value = currentState.theme || '';
      const rp = currentState.researchParams || {};
      document.getElementById('article-goal-select').value = rp.articleGoal || '導入判断できる根拠を揃える';
      document.getElementById('audience-select').value = rp.audience || 'エンジニア全般';
      document.getElementById('level-select').value = rp.level || 'intermediate';
      document.getElementById('article-type-research-select').value = rp.articleType || '解説';
      document.getElementById('intent-select').value = rp.intent || 'inform';
      document.getElementById('depth-select').value = rp.depth || currentState.depth || 'standard';
      document.getElementById('time-range-select').value = rp.timeRange || '最新';
      document.getElementById('lang-ja').checked = (rp.languages || ['ja', 'en']).includes('ja');
      document.getElementById('lang-en').checked = (rp.languages || ['ja', 'en']).includes('en');

      // 調査タブ - deliverable
      document.getElementById('deliverable-type-select').value = rp.deliverableType || 'research_report';
      document.getElementById('deliverable-length-select').value = rp.deliverableLength || 'A4 2〜3枚相当';

      // 調査タブ - quality_bar
      document.getElementById('quality-primary-select').value = rp.prioritizePrimarySources !== false ? 'true' : 'false';
      document.getElementById('quality-min-sources-select').value = String(rp.minIndependentSources || 2);
      document.getElementById('quality-allow-blogs-select').value = rp.allowBlogsAsSecondary !== false ? 'true' : 'false';

      // 執筆タブ
      const wp = currentState.writingParams || {};

      // 基本情報
      document.getElementById('article-title-input').value = wp.title || currentState.theme || '';

      // audience.role (ドロップダウン)
      document.getElementById('audience-role-select').value = wp.audienceRole || 'backend';

      // audience.level
      document.getElementById('audience-level-select').value = wp.audienceLevel || 'intermediate';

      // goal
      document.getElementById('reader-outcome-select').value = wp.readerOutcome || '導入判断ができる';

      // article_type, style, SEO
      document.getElementById('article-type-select').value = wp.articleType || '解説';
      document.getElementById('style-tone-select').value = wp.styleTone || '実務的';
      document.getElementById('style-length-select').value = wp.styleLength || 'medium';
      document.getElementById('search-intent-select').value = wp.searchIntent || 'how-to';

      // 調査結果・記事内容
      document.getElementById('research-result').value = currentState.researchResult || '';
      document.getElementById('article-content').value = currentState.articleContent || '';
      document.getElementById('research-prompt').value = currentState.researchPrompt || '';
      document.getElementById('writing-prompt').value = currentState.writingPrompt || '';
      document.getElementById('image-prompt').value = currentState.imagePrompt || '';
      document.getElementById('slides-prompt').value = currentState.slidesPrompt || '';

      // 画像タブ設定を復元
      const imgp = currentState.imageParams || {};
      document.getElementById('image-aspect-ratio-select').value = imgp.aspectRatio || '16:9';
      document.getElementById('image-style-family-select').value = imgp.styleFamily || 'editorial-illustration';
      document.getElementById('image-subject-type-select').value = imgp.subjectType || 'auto';
      document.getElementById('image-mood-select').value = imgp.mood || 'professional';
      document.getElementById('image-typography-enabled-select').value = imgp.typographyEnabled !== false ? 'true' : 'false';
      document.getElementById('image-typography-style-select').value = imgp.typographyStyle || 'keyword';

      // 画像プレビュー復元
      if (currentState.imageBase64) {
        const preview = document.getElementById('image-preview');
        preview.src = currentState.imageBase64;
        preview.style.display = 'block';
      }

      // スライドタブ状態復元
      const sp = currentState.slidesParams || {};
      document.getElementById('slides-format-select').value = sp.format || 'presenter_slides';
      document.getElementById('slides-language-select').value = sp.language || 'ja';
      document.getElementById('slides-count-min-select').value = sp.slideCountMin || 8;
      document.getElementById('slides-count-target-select').value = sp.slideCountTarget || 10;
      document.getElementById('slides-count-max-select').value = sp.slideCountMax || 14;
      document.getElementById('slides-title-input').value = sp.title || '';
      document.getElementById('slides-audience-select').value = sp.audience || '社内エンジニア向け';
      document.getElementById('slides-level-select').value = sp.audienceLevel || 'intermediate';
      document.getElementById('slides-tone-select').value = sp.tone || 'business';
      document.getElementById('slides-writing-style-select').value = sp.writingStyle || 'desu_masu';
      document.getElementById('slides-design-select').value = sp.design || 'clean_corporate';
      document.getElementById('slides-urls-input').value = (sp.urls || []).join('\\n');

      // PDF状態復元
      if (currentState.pdfBase64) {
        document.getElementById('pdf-status').textContent = 'PDFがアップロードされています';
      }

      // MDL テキストフィールド・チェックボックスの状態更新
      document.querySelectorAll('.mdl-textfield').forEach(function(el) {
        if (el.MaterialTextfield) el.MaterialTextfield.checkDirty();
      });
      document.querySelectorAll('.mdl-checkbox').forEach(function(el) {
        if (el.MaterialCheckbox) el.MaterialCheckbox.checkToggleState();
      });
    }

    function debouncedSaveState() {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(function() {
        google.script.run
          .withFailureHandler(handleError)
          .saveState(currentState);
      }, 500);
    }

    // ============================================
    // 調査タブ
    // ============================================
    function getResearchParams() {
      // languages配列を構築
      const languages = [];
      if (document.getElementById('lang-ja').checked) languages.push('ja');
      if (document.getElementById('lang-en').checked) languages.push('en');

      return {
        theme: document.getElementById('theme-input').value.trim(),
        articleGoal: document.getElementById('article-goal-select').value,
        audience: document.getElementById('audience-select').value,
        level: document.getElementById('level-select').value,
        articleType: document.getElementById('article-type-research-select').value,
        intent: document.getElementById('intent-select').value,
        depth: document.getElementById('depth-select').value,
        timeRange: document.getElementById('time-range-select').value,
        languages: languages,
        deliverableType: document.getElementById('deliverable-type-select').value,
        deliverableLength: document.getElementById('deliverable-length-select').value,
        prioritizePrimarySources: document.getElementById('quality-primary-select').value === 'true',
        minIndependentSources: parseInt(document.getElementById('quality-min-sources-select').value),
        allowBlogsAsSecondary: document.getElementById('quality-allow-blogs-select').value === 'true',
        citationStyle: 'inline_links'
      };
    }

    function onResearchFieldChange() {
      const params = getResearchParams();
      // 状態に保存
      currentState.theme = params.theme;
      currentState.researchParams = params;
      debouncedSaveState();
      updateResearchPrompt();
    }

    function updateResearchPrompt() {
      const params = getResearchParams();

      google.script.run
        .withSuccessHandler(function(result) {
          applyPromptUpdate('research', result.prompt);
        })
        .withFailureHandler(handleError)
        .generateResearchPrompt(params);
    }

    function onResearchResultChange() {
      currentState.researchResult = document.getElementById('research-result').value;
      debouncedSaveState();
      updateWritingPrompt();
      updateChecklist();
    }

    // ============================================
    // 執筆タブ
    // ============================================
    function getWritingParams() {
      return {
        title: document.getElementById('article-title-input').value.trim(),
        audienceRole: document.getElementById('audience-role-select').value,
        audienceLevel: document.getElementById('audience-level-select').value,
        readerOutcome: document.getElementById('reader-outcome-select').value,
        articleType: document.getElementById('article-type-select').value,
        styleTone: document.getElementById('style-tone-select').value,
        styleLength: document.getElementById('style-length-select').value,
        searchIntent: document.getElementById('search-intent-select').value
      };
    }

    function onWritingSettingsChange() {
      const params = getWritingParams();
      currentState.writingParams = params;
      // 後方互換性のため
      currentState.target = params.audienceRole || 'backend';
      currentState.tone = params.styleTone || '実務的';
      debouncedSaveState();
      updateWritingPrompt();
    }

    function updateWritingPrompt() {
      const writingParams = getWritingParams();
      const params = {
        theme: currentState.theme || '',
        researchResult: currentState.researchResult || '',
        writingParams: writingParams
      };

      const hasResearch = currentState.researchResult && currentState.researchResult.trim().length > 0;

      google.script.run
        .withSuccessHandler(function(result) {
          applyPromptUpdate('writing', result.prompt);
          updateWritingModeBadge(result.mode === 'factBased');
        })
        .withFailureHandler(handleError)
        .generateWritingPrompt(params);
    }

    function onArticleChange() {
      currentState.articleContent = document.getElementById('article-content').value;
      debouncedSaveState();
      updateImagePrompt();
      updateSlidesPrompt();
      updateChecklist();
    }

    function getImageParams() {
      return {
        aspectRatio: document.getElementById('image-aspect-ratio-select').value,
        outputCount: '1',
        styleFamily: document.getElementById('image-style-family-select').value,
        subjectType: document.getElementById('image-subject-type-select').value,
        mood: document.getElementById('image-mood-select').value,
        typographyEnabled: document.getElementById('image-typography-enabled-select').value === 'true',
        typographyStyle: document.getElementById('image-typography-style-select').value
      };
    }

    function onImageSettingsChange() {
      const params = getImageParams();
      currentState.imageParams = params;
      debouncedSaveState();
      updateImagePrompt();
    }

    function updateImagePrompt() {
      const imageParams = getImageParams();
      const params = {
        articleContent: currentState.articleContent || '',
        theme: currentState.theme || '',
        imageParams: imageParams
      };

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.error) {
            applyPromptUpdate('image', result.error);
          } else {
            applyPromptUpdate('image', result.prompt);
          }
        })
        .withFailureHandler(handleError)
        .generateImagePrompt(params);
    }


    function onImageUpload(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(event) {
        const base64 = event.target.result;

        // プレビュー表示
        const preview = document.getElementById('image-preview');
        preview.src = base64;
        preview.style.display = 'block';

        currentState.imageBase64 = base64;
        debouncedSaveState();
        updateChecklist();
        showToast('画像をアップロードしました');
      };
      reader.readAsDataURL(file);
    }

    // ============================================
    // 資料タブ
    // ============================================
    function getSlidesParams() {
      // URLs配列を構築
      const urlsStr = document.getElementById('slides-urls-input').value.trim();
      const urls = urlsStr ? urlsStr.split('\\n').map(u => u.trim()).filter(u => u) : [];

      return {
        format: document.getElementById('slides-format-select').value,
        language: document.getElementById('slides-language-select').value,
        slideCountMin: parseInt(document.getElementById('slides-count-min-select').value, 10),
        slideCountTarget: parseInt(document.getElementById('slides-count-target-select').value, 10),
        slideCountMax: parseInt(document.getElementById('slides-count-max-select').value, 10),
        title: document.getElementById('slides-title-input').value.trim(),
        audience: document.getElementById('slides-audience-select').value,
        audienceLevel: document.getElementById('slides-level-select').value,
        tone: document.getElementById('slides-tone-select').value,
        writingStyle: document.getElementById('slides-writing-style-select').value,
        design: document.getElementById('slides-design-select').value,
        urls: urls
      };
    }

    function onSlidesFieldChange() {
      const params = getSlidesParams();
      currentState.slidesParams = params;
      debouncedSaveState();
      updateSlidesPrompt();
    }

    function updateSlidesPrompt() {
      const slidesParams = getSlidesParams();
      const params = {
        theme: currentState.theme || '',
        articleContent: currentState.articleContent || '',
        slidesParams: slidesParams
      };

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.error) {
            applyPromptUpdate('slides', result.error);
          } else {
            applyPromptUpdate('slides', result.prompt);
          }
        })
        .withFailureHandler(handleError)
        .generateSlidesPrompt(params);
    }

    function onPdfUpload(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(event) {
        currentState.pdfBase64 = event.target.result;
        document.getElementById('pdf-status').textContent = file.name + ' が選択されました';
        debouncedSaveState();
        updateChecklist();
        showToast('PDFをアップロードしました');
      };
      reader.readAsDataURL(file);
    }

    // ============================================
    // 完了タブ
    // ============================================
    function updateChecklist() {
      updateChecklistItem('check-research', !!currentState.researchResult);
      updateChecklistItem('check-article', !!currentState.articleContent);
      updateChecklistItem('check-image', !!currentState.imageBase64);
      updateChecklistItem('check-pdf', !!currentState.pdfBase64);
    }

    function updateChecklistItem(id, hasContent) {
      const item = document.getElementById(id);
      const status = item.querySelector('.status');
      if (hasContent) {
        status.textContent = 'check';
        status.className = 'status ok material-icons';
      } else {
        status.textContent = 'close';
        status.className = 'status ng material-icons';
      }
    }

    function saveAllToDrive() {
      // バリデーション
      const data = {
        theme: currentState.theme,
        target: currentState.target,
        tone: currentState.tone,
        researchResult: currentState.researchResult,
        articleContent: currentState.articleContent,
        imageBase64: currentState.imageBase64,
        pdfBase64: currentState.pdfBase64,
        researchParams: currentState.researchParams,
        writingParams: currentState.writingParams,
        imageParams: currentState.imageParams,
        slidesParams: currentState.slidesParams,
        prompts: {
          research: currentState.researchPrompt,
          writing: currentState.writingPrompt,
          image: currentState.imagePrompt,
          slides: currentState.slidesPrompt
        }
      };

      google.script.run
        .withSuccessHandler(function(validation) {
          if (!validation.valid) {
            showValidationErrors(validation.errors);
            return;
          }

          showValidationWarnings(validation.warnings);

          showToast('保存中...');

          google.script.run
            .withSuccessHandler(function(result) {
              if (result.success) {
                showSaveResult(result);
                showToast('保存しました');
              } else {
                showValidationErrors(result.errors);
              }
            })
            .withFailureHandler(handleError)
            .saveAllToDrive(data);
        })
        .withFailureHandler(handleError)
        .validateBeforeSave(data);
    }

    function showValidationErrors(errors) {
      const el = document.getElementById('validation-errors');
      if (errors && errors.length > 0) {
        el.innerHTML = '<strong>エラー:</strong><br>' + errors.join('<br>');
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    }

    function showValidationWarnings(warnings) {
      const el = document.getElementById('validation-warnings');
      if (warnings && warnings.length > 0) {
        el.innerHTML = '<strong>警告:</strong><br>' + warnings.join('<br>');
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    }

    function showSaveResult(result) {
      const el = document.getElementById('save-result');
      document.getElementById('folder-link').href = result.folderUrl;
      el.style.display = 'block';
    }

    function startNewProject() {
      if (!confirm('現在の作業内容をすべてクリアしますか？この操作は取り消せません。')) {
        return;
      }

      google.script.run
        .withSuccessHandler(function(result) {
          currentState = {};
          resetUI();
          showToast(result.message);

          // 調査タブに切り替え
          document.querySelector('.mdl-layout__tab.is-active').classList.remove('is-active');
          document.querySelector('a[href="#tab-research"]').classList.add('is-active');
          document.querySelector('.mdl-layout__tab-panel.is-active').classList.remove('is-active');
          document.getElementById('tab-research').classList.add('is-active');
        })
        .withFailureHandler(handleError)
        .clearState();
    }

    function resetUI() {
      // 調査タブ - 基本設定
      document.getElementById('theme-input').value = '';
      document.getElementById('article-goal-select').value = '導入判断できる根拠を揃える';
      document.getElementById('audience-select').value = 'エンジニア全般';
      document.getElementById('level-select').value = 'intermediate';
      document.getElementById('article-type-research-select').value = '解説';
      document.getElementById('intent-select').value = 'inform';
      document.getElementById('depth-select').value = 'standard';

      // 調査タブ - constraints
      document.getElementById('time-range-select').value = '最新';
      document.getElementById('lang-ja').checked = true;
      document.getElementById('lang-en').checked = true;

      // 調査タブ - deliverable
      document.getElementById('deliverable-type-select').value = 'research_report';
      document.getElementById('deliverable-length-select').value = 'A4 2〜3枚相当';

      // 調査タブ - quality_bar
      document.getElementById('quality-primary-select').value = 'true';
      document.getElementById('quality-min-sources-select').value = '2';
      document.getElementById('quality-allow-blogs-select').value = 'true';

      // 調査タブ - プロンプト・結果
      document.getElementById('research-prompt').value = '';
      document.getElementById('research-result').value = '';

      // 執筆タブ
      document.getElementById('article-title-input').value = '';
      document.getElementById('audience-role-select').value = 'backend';
      document.getElementById('audience-level-select').value = 'intermediate';
      document.getElementById('reader-outcome-select').value = '導入判断ができる';
      document.getElementById('article-type-select').value = '解説';
      document.getElementById('style-tone-select').value = '実務的';
      document.getElementById('style-length-select').value = 'medium';
      document.getElementById('search-intent-select').value = 'how-to';
      document.getElementById('writing-prompt').value = '';
      document.getElementById('article-content').value = '';

      // 画像タブ - 設定
      document.getElementById('image-aspect-ratio-select').value = '16:9';
      document.getElementById('image-style-family-select').value = 'editorial-illustration';
      document.getElementById('image-subject-type-select').value = 'auto';
      document.getElementById('image-mood-select').value = 'professional';
      document.getElementById('image-typography-enabled-select').value = 'true';
      document.getElementById('image-typography-style-select').value = 'keyword';

      // 画像・資料・完了タブ
      document.getElementById('image-prompt').value = '';
      document.getElementById('image-preview').style.display = 'none';
      document.getElementById('slides-prompt').value = '';
      document.getElementById('pdf-status').textContent = 'PDFが選択されていません';
      document.getElementById('save-result').style.display = 'none';
      document.getElementById('validation-warnings').style.display = 'none';
      document.getElementById('validation-errors').style.display = 'none';

      updateChecklist();

      // MDL テキストフィールド・チェックボックスの状態更新
      document.querySelectorAll('.mdl-textfield').forEach(function(el) {
        if (el.MaterialTextfield) el.MaterialTextfield.checkDirty();
      });
      document.querySelectorAll('.mdl-checkbox').forEach(function(el) {
        if (el.MaterialCheckbox) el.MaterialCheckbox.checkToggleState();
      });
    }

    // ============================================
    // プロンプト更新
    // ============================================
    function updateAllPrompts() {
      if (currentState.theme) {
        updateResearchPrompt();
      }
      updateWritingPrompt();
      updateImagePrompt();
      updateSlidesPrompt();
    }

    // ============================================
    // ユーティリティ
    // ============================================
    function debounce(func, wait) {
      let timeout;
      return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
          func.apply(context, args);
        }, wait);
      };
    }

    function copyToClipboard(text) {
      if (!text) {
        showToast('コピーする内容がありません');
        return;
      }
      navigator.clipboard.writeText(text).then(function() {
        showToast('コピーしました');
      }).catch(function() {
        showToast('コピーに失敗しました');
      });
    }

    function pasteFromClipboard(element, callback) {
      navigator.clipboard.readText().then(function(text) {
        if (text) {
          element.value = text;
          element.parentElement.classList.add('is-dirty');
          showToast('貼り付けました');
          if (callback) callback();
        } else {
          showToast('クリップボードが空です');
        }
      }).catch(function() {
        showToast('貼り付けに失敗しました（権限を確認してください）');
      });
    }

    function pasteImageFromClipboard() {
      navigator.clipboard.read().then(function(items) {
        for (const item of items) {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              item.getType(type).then(function(blob) {
                const reader = new FileReader();
                reader.onload = function(event) {
                  const base64 = event.target.result;
                  const preview = document.getElementById('image-preview');
                  preview.src = base64;
                  preview.style.display = 'block';
                  currentState.imageBase64 = base64;
                  debouncedSaveState();
                  updateChecklist();
                  showToast('画像を貼り付けました');
                };
                reader.readAsDataURL(blob);
              });
              return;
            }
          }
        }
        showToast('クリップボードに画像がありません');
      }).catch(function() {
        showToast('画像の貼り付けに失敗しました（権限を確認してください）');
      });
    }

    function openGemUrl(url) {
      if (!url) {
        showToast('URLが設定されていません。設定画面でURLを入力してください。');
        return;
      }
      window.open(url, '_blank');
    }

    function showToast(message) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(function() {
        toast.classList.remove('show');
      }, 3000);
    }

    function handleError(error) {
      console.error(error);
      showToast('エラー: ' + (error.message || error));
    }

    function applyPromptUpdate(kind, prompt) {
      const field = document.getElementById(kind + '-prompt');
      if (field) {
        field.value = prompt;
      }
      currentState[kind + 'Prompt'] = prompt;
      debouncedSaveState();
    }

    function updateWritingModeBadge(hasResearch) {
      const badge = document.getElementById('writing-mode-badge');
      if (hasResearch) {
        badge.textContent = '事実準拠モード';
        badge.className = 'mode-badge fact-based';
      } else {
        badge.textContent = 'AI知識補完モード';
        badge.className = 'mode-badge ai-knowledge';
      }
    }

  </script>
</body>
</html>`;
}

// ============================================
// 設定管理
// ============================================

/**
 * 設定を保存
 * @param {Object} settings - 設定オブジェクト
 * @returns {Object} 結果
 */
function saveSettings(settings) {
  const userProps = PropertiesService.getUserProperties();
  userProps.setProperty('gemUrl_research', settings.gemUrl_research || '');
  userProps.setProperty('gemUrl_writing', settings.gemUrl_writing || '');
  userProps.setProperty('gemUrl_nanobanana', settings.gemUrl_nanobanana || '');
  userProps.setProperty('gemUrl_slides', settings.gemUrl_slides || '');
  const driveFolderUrl = settings.driveFolderUrl || '';
  const driveFolderId = extractDriveFolderId(driveFolderUrl);
  userProps.setProperty('driveFolderUrl', driveFolderUrl);
  userProps.setProperty('driveFolderId', driveFolderId);
  return { success: true, message: '設定を保存しました' };
}

/**
 * 設定を取得
 * @returns {Object} 設定オブジェクト
 */
function getSettings() {
  const userProps = PropertiesService.getUserProperties();
  const storedUrl = userProps.getProperty('driveFolderUrl') || '';
  const storedId = userProps.getProperty('driveFolderId') || '';
  const driveFolderUrl = storedUrl || storedId;
  const driveFolderId = storedId || extractDriveFolderId(driveFolderUrl);
  return {
    gemUrl_research: userProps.getProperty('gemUrl_research') || '',
    gemUrl_writing: userProps.getProperty('gemUrl_writing') || '',
    gemUrl_nanobanana: userProps.getProperty('gemUrl_nanobanana') || '',
    gemUrl_slides: userProps.getProperty('gemUrl_slides') || '',
    driveFolderUrl: driveFolderUrl,
    driveFolderId: driveFolderId
  };
}

/**
 * DriveフォルダURLまたはIDからフォルダIDを抽出
 * @param {string} input - URLまたはID
 * @returns {string} フォルダID
 */
function extractDriveFolderId(input) {
  if (!input) return '';
  const trimmed = String(input).trim();
  const match = trimmed.match(/[-\w]{25,}/);
  return match ? match[0] : '';
}

// ============================================
// 状態管理
// ============================================

/**
 * 作業状態を保存
 * @param {Object} state - 状態オブジェクト
 * @returns {Object} 結果
 */
function saveState(state) {
  const userProps = PropertiesService.getUserProperties();
  Object.keys(state).forEach(key => {
    const value = state[key];
    // オブジェクトはJSON文字列化
    if (typeof value === 'object' && value !== null) {
      const jsonStr = JSON.stringify(value);
      if (jsonStr.length < 9000) {
        userProps.setProperty('state_' + key, jsonStr);
      }
    }
    // Base64データは大きすぎる場合があるので、サイズチェック
    else if (typeof value === 'string' && value.length < 9000) {
      userProps.setProperty('state_' + key, value || '');
    }
    else if (typeof value === 'boolean' || typeof value === 'number') {
      userProps.setProperty('state_' + key, String(value));
    }
  });
  return { success: true };
}

/**
 * 作業状態を取得
 * @returns {Object} 状態オブジェクト
 */
function getState() {
  const userProps = PropertiesService.getUserProperties();

  // researchParamsをJSONパース
  let researchParams = {};
  const researchParamsStr = userProps.getProperty('state_researchParams');
  if (researchParamsStr) {
    try {
      researchParams = JSON.parse(researchParamsStr);
    } catch (e) {
      researchParams = {};
    }
  }

  // writingParamsをJSONパース
  let writingParams = {};
  const writingParamsStr = userProps.getProperty('state_writingParams');
  if (writingParamsStr) {
    try {
      writingParams = JSON.parse(writingParamsStr);
    } catch (e) {
      writingParams = {};
    }
  }

  // imageParamsをJSONパース
  let imageParams = {};
  const imageParamsStr = userProps.getProperty('state_imageParams');
  if (imageParamsStr) {
    try {
      imageParams = JSON.parse(imageParamsStr);
    } catch (e) {
      imageParams = {};
    }
  }

  return {
    theme: userProps.getProperty('state_theme') || '',
    depth: userProps.getProperty('state_depth') || 'standard',
    researchResult: userProps.getProperty('state_researchResult') || '',
    articleContent: userProps.getProperty('state_articleContent') || '',
    researchPrompt: userProps.getProperty('state_researchPrompt') || '',
    writingPrompt: userProps.getProperty('state_writingPrompt') || '',
    imagePrompt: userProps.getProperty('state_imagePrompt') || '',
    slidesPrompt: userProps.getProperty('state_slidesPrompt') || '',
    imageBase64: userProps.getProperty('state_imageBase64') || '',
    pdfBase64: userProps.getProperty('state_pdfBase64') || '',
    researchParams: researchParams,
    writingParams: writingParams,
    imageParams: imageParams
  };
}

/**
 * 作業状態をクリア
 * @returns {Object} 結果
 */
function clearState() {
  const userProps = PropertiesService.getUserProperties();
  const stateKeys = [
    'state_theme', 'state_depth',
    'state_researchResult', 'state_articleContent',
    'state_researchPrompt', 'state_writingPrompt',
    'state_imagePrompt', 'state_slidesPrompt',
    'state_imageBase64', 'state_pdfBase64',
    'state_researchParams', 'state_writingParams', 'state_imageParams'
  ];
  stateKeys.forEach(key => userProps.deleteProperty(key));
  return { success: true, message: '作業状態をクリアしました' };
}

// ============================================
// プロンプト生成
// ============================================

/**
 * 調査プロンプトを生成（DeepResearch YAML形式）
 * @param {Object} params - パラメータ
 * @returns {Object} プロンプトとGem URL
 */
function generateResearchPrompt(params) {
  const settings = getSettings();

  // パラメータ取得（デフォルト値付き）
  const theme = params.theme || '';
  const articleGoal = params.articleGoal || '技術記事として読者が導入判断・実装判断できる根拠を揃える';
  const audience = params.audience || 'エンジニア全般';
  const level = params.level || 'intermediate';
  const articleType = params.articleType || '解説';
  const intent = params.intent || 'inform';
  const depth = params.depth || 'standard';
  const timeRange = params.timeRange || '最新';
  const versions = params.versions || ['最新版'];
  const languages = params.languages || ['ja', 'en'];
  const deliverableType = params.deliverableType || 'research_report';
  const deliverableLength = params.deliverableLength || 'A4 2〜3枚相当';

  // YAML配列をフォーマット
  const formatArray = (arr) => arr.length > 0 ? JSON.stringify(arr) : '[]';

  const prompt = `topic: "${theme}"
article_goal: "${articleGoal}"

article:
  audience: "${audience}"
  level: "${level}"
  type: "${articleType}"
  intent: "${intent}"

research:
  depth: "${depth}"

constraints:
  time_range: "${timeRange}"
  versions: ${formatArray(versions)}
  languages: ${formatArray(languages)}

deliverable:
  type: "${deliverableType}"
  length: "${deliverableLength}"

citation:
  required: true
  style: "inline_links"

quality_bar:
  prioritize_primary_sources: true
  min_independent_sources_for_key_claims: 2
  allow_blogs_as_secondary: true`;

  return {
    prompt: prompt,
    gemUrl: settings.gemUrl_research
  };
}

/**
 * 執筆プロンプトを生成（TechWriter YAML Spec形式）
 * @param {Object} params - パラメータ
 * @returns {Object} プロンプト、モード、Gem URL
 */
function generateWritingPrompt(params) {
  const settings = getSettings();
  const hasResearch = params.researchResult && params.researchResult.trim().length > 0;
  const wp = params.writingParams || {};

  // audience説明を生成
  const audienceDesc = buildAudienceDescription(wp.audienceRole, wp.audienceLevel);

  // purpose説明を生成
  const purposeDesc = buildPurposeDescription(wp.readerOutcome);

  // article_typeを日本語に変換
  const articleTypeJa = mapArticleTypeToJapanese(wp.articleType);

  // toneを「です・ます」系に正規化
  const normalizedTone = normalizeTone(wp.styleTone);

  // sources部分を生成
  const sourcesYaml = hasResearch
    ? `sources:
  - id: DR1
    type: file
    file_name: "調査結果.txt"
    note: "Deep Research結果（主要根拠）"
    priority: high`
    : `sources:
  - id: AI1
    type: text
    content: "AIの一般知識を使用"
    note: "添付の調査結果がないため、AIの知識を根拠として使用"
    priority: mid`;

  const prompt = `mode: flexible

article:
  title: "${wp.title || params.theme || ''}"
  type: "${articleTypeJa}"
  audience: "${audienceDesc}"
  purpose: "${purposeDesc}"

${sourcesYaml}

constraints:
  length: "${wp.styleLength || 'medium'}"
  fact_policy: "根拠不十分な断定は禁止。不明点は「不明」「要確認」と明記。"
  must_avoid: ["根拠のない数値・比較", "過度な煽り", "「絶対」「100%」などの断言"]

style:
  language: "ja"
  tone: "${normalizedTone}"
  formatting:
    prefer_bullets: true
    allow_tables: true

citations:
  style: "links"
  requirement: "${hasResearch ? 'strict' : 'light'}"
  placement: "段落末"

output:
  format: "markdown"
  wrap_with_four_backticks: true
  include_summary: true
  include_takeaways: true
  include_faq: false
  include_toc: false`;

  const mode = hasResearch ? 'factBased' : 'aiKnowledge';

  return {
    prompt: prompt,
    mode: mode,
    gemUrl: settings.gemUrl_writing
  };
}

/**
 * audience情報から説明文を生成
 * @param {Array} roles - 対象ロール配列
 * @param {string} level - スキルレベル
 * @returns {string} audience説明文
 */
function buildAudienceDescription(role, level) {
  const levelMap = {
    'beginner': '入門者',
    'intermediate': '中級者',
    'advanced': '上級者'
  };
  const levelJa = levelMap[level] || '中級者';

  if (!role) {
    return `${levelJa}のエンジニア`;
  }

  return `${role}エンジニア（${levelJa}）`;
}

/**
 * goal情報からpurpose説明文を生成
 * @param {string} readerOutcome - 読了後の成果
 * @returns {string} purpose説明文
 */
function buildPurposeDescription(readerOutcome) {
  const outcome = readerOutcome || '導入判断ができる';
  return `読者が${outcome}ようになる`;
}

/**
 * toneを正規化
 * @param {string} tone - トーン
 * @returns {string} 正規化されたトーン
 */
function normalizeTone(tone) {
  // 有効なトーン値
  var validTones = ['実務的', '丁寧', 'フレンドリー', 'カジュアル', 'フォーマル', 'アカデミック'];
  if (validTones.includes(tone)) {
    return tone;
  }
  // デフォルト値
  return tone || '実務的';
}

/**
 * article_typeを日本語に変換
 * @param {string} type - article_type（日本語または英語）
 * @returns {string} 日本語のarticle_type
 */
function mapArticleTypeToJapanese(type) {
  // 日本語で定義されている値はそのまま返す
  const validJapaneseTypes = [
    '解説', '比較', '手順', '導入ガイド', '設計レビュー', '移行ガイド',
    'トラブルシューティング', 'ベストプラクティス', '事例紹介',
    'ベンチマーク', '障害報告', 'ニュースまとめ', 'レビュー'
  ];
  if (validJapaneseTypes.includes(type)) {
    return type;
  }

  // 後方互換性のため英語から日本語への変換も維持
  const typeMap = {
    'tutorial': '手順',
    'deep_dive': '解説',
    'case_study': '事例紹介',
    'design_review': '設計レビュー',
    'migration': '移行ガイド',
    'postmortem': '障害報告',
    'benchmark': 'ベンチマーク',
    'opinionated': '解説',
    'comparison': '比較',
    'troubleshooting': 'トラブルシューティング'
  };
  return typeMap[type] || type || '解説';
}
function generateImagePrompt(params) {
  const settings = getSettings();

  if (!params.articleContent || params.articleContent.trim().length === 0) {
    return {
      prompt: '',
      error: '記事内容がありません。先に執筆タブで記事を作成してください。',
      gemUrl: settings.gemUrl_nanobanana
    };
  }

  const ip = params.imageParams || {};
  const aspectRatio = ip.aspectRatio || '16:9';
  const styleFamily = ip.styleFamily || 'editorial-illustration';
  const subjectType = ip.subjectType || 'auto';
  const mood = ip.mood || 'professional';
  const typographyEnabled = ip.typographyEnabled !== false;
  const typographyStyle = ip.typographyStyle || 'keyword';

  // 記事内容から要約を抽出（最初の500文字）
  const articleSummary = params.articleContent.substring(0, 500).replace(/\n+/g, ' ').trim();

  const prompt = `version: "1.0"
locale: "ja-JP"

image_config:
  aspect_ratio: "${aspectRatio}"

visual:
  style_family: "${styleFamily}"

subject:
  type: "${subjectType}"
  mood: "${mood}"

typography:
  enabled: ${typographyEnabled}
  language: "ja"
  text_style: "${typographyStyle}"

article:
  theme: "${params.theme || ''}"
  summary: "${articleSummary}..."

---

上記YAML設定に基づいて、記事のサムネイル画像のBrief（設計図）を1案提示してください。

以下を含めてください：
- 狙い（何を伝えるサムネか）
- 主被写体（何が主役か）
- 背景/状況（抽象背景やメタファー含む）
- スタイル（style_family反映）
- 文字要素（typography.enabled に応じて「無し」or「短い案」）
- ${aspectRatio} 明記

最後に、ユーザーが返すべき指示を1行で促してください。
例：「少し明るく」「OK」「生成」など`;

  return {
    prompt: prompt,
    gemUrl: settings.gemUrl_nanobanana
  };
}

/**
 * スライド構成プロンプトを生成
 * @param {Object} params - パラメータ
 * @returns {Object} プロンプトまたはエラー
 */
function generateSlidesPrompt(params) {
  const settings = getSettings();
  const sp = params.slidesParams || {};

  // デフォルト値を設定
  const format = sp.format || 'presenter_slides';
  const language = sp.language || 'ja';
  const slideCountMin = sp.slideCountMin || 8;
  const slideCountTarget = sp.slideCountTarget || 10;
  const slideCountMax = sp.slideCountMax || 14;
  const title = sp.title || params.theme || '';
  const audience = sp.audience || '社内エンジニア向け';
  const audienceLevel = sp.audienceLevel || 'intermediate';
  const tone = sp.tone || 'business';
  const writingStyle = sp.writingStyle || 'desu_masu';
  const design = sp.design || 'clean_corporate';
  const urls = sp.urls || [];

  // URL部分を構築
  let urlsYaml = '';
  if (urls.length > 0) {
    urlsYaml = urls.map(url => '    - "' + url + '"').join('\n');
  } else {
    urlsYaml = '    - ""';
  }

  // YAML形式でプロンプトを生成
  const prompt = `version: "run-0.3"

notebooklm:
  slide_deck:
    format: ${format}
    language: ${language}
    slide_count_range:
      min: ${slideCountMin}
      max: ${slideCountMax}
      target: ${slideCountTarget}

deck_brief:
  title: "${title}"
  audience: "${audience}"

style_choice:
  audience_level: ${audienceLevel}
  tone: ${tone}
  japanese_writing_style: ${writingStyle}
  design: ${design}

sources:
  urls:
${urlsYaml}
`;

  return {
    prompt: prompt,
    gemUrl: settings.gemUrl_slides
  };
}

// ============================================
// バリデーション
// ============================================

/**
 * 保存前バリデーション
 * @returns {Object} バリデーション結果
 */
function validateBeforeSave(stateOverride) {
  const settings = getSettings();
  const state = stateOverride || getState();
  const errors = [];
  const warnings = [];

  // エラー（保存ブロック）
  if (!settings.driveFolderId) {
    errors.push('保存先フォルダURLが設定されていません。設定画面でフォルダURLを入力してください。');
  }
  if (!state.articleContent || state.articleContent.trim().length === 0) {
    errors.push('記事内容が入力されていません。');
  }

  // 警告（保存は可能）
  if (!state.researchResult || state.researchResult.trim().length === 0) {
    warnings.push('調査結果がありません（省略可）');
  }
  if (!state.imageBase64) {
    warnings.push('画像がアップロードされていません（省略可）');
  }
  if (!state.pdfBase64) {
    warnings.push('PDFがアップロードされていません（省略可）');
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings,
    files: {
      research: !!state.researchResult,
      article: !!state.articleContent,
      image: !!state.imageBase64,
      pdf: !!state.pdfBase64
    }
  };
}

// ============================================
// Drive操作
// ============================================

/**
 * ファイル名をサニタイズ
 * @param {string} name - ファイル名
 * @returns {string} サニタイズ済みファイル名
 */
function sanitizeFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, '_').substring(0, 50);
}

/**
 * 次のバージョン番号を取得
 * @param {Folder} parentFolder - 親フォルダ
 * @param {string} theme - テーマ
 * @param {string} dateStr - 日付文字列
 * @returns {number} バージョン番号
 */
function getNextVersion(parentFolder, theme, dateStr) {
  const prefix = dateStr + '_' + theme + '_v';
  const folders = parentFolder.getFolders();
  let maxVersion = 0;

  while (folders.hasNext()) {
    const folder = folders.next();
    const name = folder.getName();
    if (name.startsWith(prefix)) {
      const versionStr = name.substring(prefix.length);
      const version = parseInt(versionStr, 10);
      if (!isNaN(version) && version > maxVersion) {
        maxVersion = version;
      }
    }
  }

  return maxVersion + 1;
}

/**
 * プロジェクトフォルダを作成
 * @param {string} theme - テーマ
 * @returns {Object} フォルダ情報
 */
function createProjectFolder(theme) {
  const settings = getSettings();
  if (!settings.driveFolderId) {
    throw new Error('MISSING_FOLDER_ID');
  }

  let parentFolder;
  try {
    parentFolder = DriveApp.getFolderById(settings.driveFolderId);
  } catch (e) {
    throw new Error('INVALID_FOLDER_ID');
  }
  const dateStr = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd');
  const sanitizedTheme = sanitizeFileName(theme);
  const version = getNextVersion(parentFolder, sanitizedTheme, dateStr);
  const folderName = dateStr + '_' + sanitizedTheme + '_v' + version;

  const folder = parentFolder.createFolder(folderName);

  return {
    folderId: folder.getId(),
    folderName: folderName,
    folderUrl: folder.getUrl()
  };
}

/**
 * テキストファイルを保存
 * @param {Folder} folder - フォルダ
 * @param {string} fileName - ファイル名
 * @param {string} content - 内容
 * @param {string} mimeType - MIMEタイプ
 * @returns {string|null} ファイルID
 */
function saveTextFile(folder, fileName, content, mimeType) {
  if (!content || content.trim().length === 0) {
    return null;
  }
  const file = folder.createFile(fileName, content, mimeType || MimeType.PLAIN_TEXT);
  return file.getId();
}

/**
 * manifest.jsonを生成
 * @param {Object} data - データ
 * @returns {Object} manifest
 */
function generateManifest(data) {
  const hasResearch = !!(data.researchResult && data.researchResult.trim().length > 0);
  const hasArticle = !!(data.articleContent && data.articleContent.trim().length > 0);
  const hasImage = !!data.imageBase64;
  const hasPdf = !!data.pdfBase64;
  return {
    version: '1.0',
    createdAt: new Date().toISOString(),
    theme: data.theme,
    target: data.target,
    tone: data.tone,
    hasResearch: hasResearch,
    files: {
      research: hasResearch ? FILE_NAMES.research : null,
      article: FILE_NAMES.article,
      image: hasImage ? FILE_NAMES.image : null,
      pdf: hasPdf ? FILE_NAMES.pdf : null
    },
    prompts: {
      research: data.prompts?.research || '',
      writing: data.prompts?.writing || '',
      image: data.prompts?.image || '',
      slides: data.prompts?.slides || ''
    },
    tabs: {
      research: {
        params: data.researchParams || {},
        prompt: data.prompts?.research || '',
        hasContent: hasResearch,
        file: hasResearch ? FILE_NAMES.research : null
      },
      writing: {
        params: data.writingParams || {},
        prompt: data.prompts?.writing || '',
        hasContent: hasArticle,
        file: FILE_NAMES.article
      },
      image: {
        params: data.imageParams || {},
        prompt: data.prompts?.image || '',
        hasContent: hasImage,
        file: hasImage ? FILE_NAMES.image : null
      },
      slides: {
        params: data.slidesParams || {},
        prompt: data.prompts?.slides || '',
        hasContent: hasPdf,
        file: hasPdf ? FILE_NAMES.pdf : null
      },
      complete: {
        checklist: {
          research: hasResearch,
          article: hasArticle,
          image: hasImage,
          pdf: hasPdf
        }
      }
    }
  };
}

/**
 * すべての成果物をDriveに保存
 * @param {Object} data - 保存データ
 * @returns {Object} 結果
 */
function saveAllToDrive(data) {
  // バリデーション実行
  const validation = validateBeforeSave(data);
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  // フォルダ作成
  let folderInfo;
  try {
    folderInfo = createProjectFolder(data.theme);
  } catch (e) {
    let message = 'Driveへのアクセス権限がありません。権限を承認して再実行してください。';
    if (e && e.message === 'MISSING_FOLDER_ID') {
      message = '保存先フォルダURLが設定されていません。設定画面でフォルダURLを入力してください。';
    } else if (e && e.message === 'INVALID_FOLDER_ID') {
      message = '保存先フォルダURLが無効、またはアクセス権限がありません。正しいURLを設定してください。';
    }
    return {
      success: false,
      errors: [message]
    };
  }
  const folder = DriveApp.getFolderById(folderInfo.folderId);

  // ファイル保存
  const savedFiles = {};

  // 調査結果
  if (data.researchResult) {
    saveTextFile(folder, FILE_NAMES.research, data.researchResult);
    savedFiles.research = FILE_NAMES.research;
  }

  // 記事
  saveTextFile(folder, FILE_NAMES.article, data.articleContent);
  savedFiles.article = FILE_NAMES.article;

  // 画像保存（Base64からBlob変換）
  if (data.imageBase64) {
    try {
      const base64Data = data.imageBase64.split(',')[1];
      const imageBlob = Utilities.newBlob(
        Utilities.base64Decode(base64Data),
        'image/png',
        FILE_NAMES.image
      );
      folder.createFile(imageBlob);
      savedFiles.image = FILE_NAMES.image;
    } catch (e) {
      console.log('画像保存エラー: ' + e.message);
    }
  }

  // PDF保存
  if (data.pdfBase64) {
    try {
      const base64Data = data.pdfBase64.split(',')[1];
      const pdfBlob = Utilities.newBlob(
        Utilities.base64Decode(base64Data),
        'application/pdf',
        FILE_NAMES.pdf
      );
      folder.createFile(pdfBlob);
      savedFiles.pdf = FILE_NAMES.pdf;
    } catch (e) {
      console.log('PDF保存エラー: ' + e.message);
    }
  }

  // manifest生成・保存
  const manifest = generateManifest(data);
  saveTextFile(folder, FILE_NAMES.manifest, JSON.stringify(manifest, null, 2), MimeType.PLAIN_TEXT);
  savedFiles.manifest = FILE_NAMES.manifest;

  return {
    success: true,
    folderId: folderInfo.folderId,
    folderName: folderInfo.folderName,
    folderUrl: folderInfo.folderUrl,
    files: savedFiles
  };
}
