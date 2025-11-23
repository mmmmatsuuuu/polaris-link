# Polaris Link
生徒が自分のペースで学びを進められることを目指した、情報科向けの学習支援プラットフォームです。教師は授業コンテンツを一括管理し、生徒はログインなしでも閲覧、ログイン時は学習履歴を残せます。

## プロダクト概要
- 科目 > 単元 > 授業 > コンテンツ（動画 / 小テスト / 外部リンク）の階層で管理し、授業・コンテンツごとに公開/非公開を切替可能。
- 認証はGoogle OAuth + メールアドレスのホワイトリスト方式。教師権限の付与はFirebase Consoleで手動実施。
- CSVで生徒・科目・単元・授業・コンテンツ・問題を一括登録でき、処理はCloud Functions経由で行う想定。
- 動画視聴（2分以上または一定割合）や小テスト結果をログとして保存し、教師/生徒双方のダッシュボードで進捗を確認。
- 未ログインでも公開コンテンツを閲覧可能。卒業後も学習素材として参照できる。

## アーキテクチャ概要
- Next.js(App Router) + TypeScript + Tailwind CSS + Radix UI をVercelでホスト。
- Firebase Authentication(Google) でログインし、Firestore を主DB、Storage をCSV/教材保管に利用。
- Cloud Functions でCSVインポート、進捗集計、手動トリガーAPIなどを実装予定。
- YouTube iframe + API で動画視聴状況を取得。ログは必要に応じ BigQuery へエクスポートして整理。
詳しくは `document/design/architecture.md` を参照してください。

## データモデル（主要コレクション）
- `users`: `role(teacher/student)`, `email`, `studentNumber` などの属性と権限。
- `subjects`, `units`, `lessons`: 科目/単元/授業。`publishStatus` で公開状態を保持し、`lessons` は単元未紐付けも許容。
- `lessons/{lessonId}/contents`: 各授業の動画/小テスト/リンク。`metadata` に種別ごとの詳細、公開状態、並び順を保持。
- `lessons/{lessonId}/contents/{contentId}/questions`: 小テスト問題。`questionType`, `choices`, `correctAnswer` など。
- `video_progress`, `test_attempts`: 視聴ログ・受験履歴。教師アカウントのログは集計から除外。
- `progress_snapshots`: 進捗表示用のキャッシュ。Cloud Functions が更新。
- `csv_import_jobs`: CSV一括登録のステータスとエラー情報。
詳細は `document/design/data_model.md` を参照してください。

## リポジトリ構成
- `web/`: Next.js アプリ (App Router)。
- `firebase/`: Firebase Emulator/Functions 設定、Firestoreルール、ダミーデータ。
- `document/`: 要件定義と設計ドキュメント（要件: `requirement_specification.md`、設計: `design/*`、開発フロー: `dev_flow.md`）。
- `docker-compose.yml`: Next.js + Firebase Emulator 環境。

## ローカル開発 (Docker + Firebase Emulator)
1. コンテナ起動  
   ```bash
   docker compose up -d
   ```
2. Firebase Emulator を起動（データ永続化あり）  
   ```bash
   docker compose exec firebase bash
   firebase emulators:start --import=./data --export-on-exit=./data
   ```
3. Next.js を起動  
   ```bash
   docker compose exec web bash
   npm run dev
   ```
   - 初回のみ依存を更新する場合は `npm ci` を実行してください。
   - ブラウザから http://localhost:3000 にアクセスします。
4. 環境変数は `docker-compose.yml` でエミュレータ接続向けに設定済みです。Vercel デプロイ時は Firebase の本番/ステージング用キーを設定してください。

## デプロイと運用
- Next.js は Vercel で Preview/Production を運用する想定。main ブランチが Production。
- Firebase Functions と Firestore ルールは `firebase deploy --only functions,firestore:rules` でデプロイ。
- 学習ログは年度末に BigQuery/Cloud Storage へエクスポートした上で手動削除する運用（`document/design/log_export_and_cleanup.md` 参照）。

## 進行中のタスク（抜粋）
`document/dev_flow.md` のTODOより。
- [ ] ダミーデータ作成と `web/app/dummy-data` への配置、 `/web/app/dev/import` からのFirestore登録。
- [ ] データ取得/登録/修正/削除ロジックと認証・ロール別ルーティングの実装。

## 参考ドキュメント
- 要件: `document/requirement_specification.md`
- 設計: `document/design/architecture.md`, `document/design/data_model.md`, `document/design/ui_design.md`, `document/design/user_flows.md`
- 開発フロー: `document/dev_flow.md`
