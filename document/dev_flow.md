# 開発フロー

## 事前処理
- [x] ファイルの削除
- [x] 新しいファイルの作成
- [x] コンテナの立ち上げ
- [x] コンテナ起動の確認
- [x] create-next-appの実行と
- [x] Next.jsの起動の確認

## アプリとDBの接続確認
- [x] アプリとDBの通信確認
- [x] アプリからfirestoreへのデータ作成の確認
- [x] アプリからfirestoreへのデータ削除の確認
- [x] アプリからfirebase authへの認証の確認

## デプロイの確認
- [x] next.jsをvercelにデプロイする
- [x] デプロイしたアプリからfirebaseへの接続設定をする
- [x] アプリからfirebase authで認証できることを確認する
- [x] アプリからfirestoreへのデータ作成・削除の確認

## 要件定義
- [x] 要件定義書の作成

## 設計
- [x] データ設計
- [x] UI設計
- [x] アーキテクチャ設計

## 実装フェーズ
- [x] Next.js プロジェクトの土台整備（App Router, Tailwind, eslint/prettier, レイアウト/ナビゲーションの共通コンポーネント）。
- [x] Firebase Auth 連携とホワイトリスト認証（middleware / Route Handlerによるトークン検証、教師アカウントの生徒UIアクセス確認）。
- [x] Firestore SDK 設定と共通hooksの実装（`subjects/units/lessons/contents` 取得、`publishStatus=public` のみ公開側で取得）。
- [ ] 公開コンテンツ閲覧ページ（SSG/ISR）とログイン誘導導線の構築。
- [ ] 生徒ダッシュボード（進捗カード、授業一覧）と動画視聴ログ記録API（`lastWatchedAt` 必須）実装。
- [ ] 小テストAPI（問題抽選、回答判定、`test_attempts` 書き込み、教師ログ除外ロジック）と生徒UI。
- [ ] 教師管理画面：科目/単元/授業/コンテンツCRUD、公開フラグ操作、教師の生徒モード切替導線。
- [ ] CSVアップロード画面とStorageアップロード、Cloud Functions連携（ジョブ監視UI）。
- [ ] 学習状況ページ：`progress_snapshots` 表示、フィルタリング、教師ログ除外を前提としたメトリクス表示。
- [ ] ログエクスポートガイドに沿った手動操作用UI（ドキュメントリンク、再集計トリガー）。
- [ ] Vercelデプロイ + Firebase環境変数設定、本番動作確認。
