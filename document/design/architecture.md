# アーキテクチャ / 技術スタック設計

本ドキュメントでは、Polaris-Link のシステム構成、採用技術、主要なデータフローをまとめる。要件は Next.js + Firebase を前提とし、ホスティングは Vercel で行う。

## 1. 全体構成

- **クライアント/フロントエンド**: Next.js (App Router) を使用し、Vercel でホスト。静的生成 (ISR) / SSR / クライアントフェッチを用途に応じて使い分ける。
- **認証**: Firebase Authentication (Google OAuth)。ホワイトリスト登録済みメールアドレスのみ教師/生徒として利用可。
- **データストア**: Cloud Firestore をメインDBとし、Storage はCSVや教材ファイル置き場として利用。
- **バックエンド処理**: Firebase Cloud Functions を使用してCSVインポート、進捗集計、手動トリガーAPIなどを実装する。
- **ログ/解析**: `video_progress`, `test_attempts` はFirestoreに蓄積し、年度ごとにBigQueryへエクスポートして削除（手動）。
- **外部サービス**: YouTube（動画埋め込み・APIによる視聴時間取得）。

```
Browser (Next.js) <---> Vercel Edge/Serverless Functions
       |                         |
       | fetch (REST/GraphQL)    |    Firebase SDK (client & admin)
       v                         v
Firebase Auth   Firestore   Storage   Cloud Functions
```

## 2. 技術スタック詳細

| 層 | 技術 | 役割 |
| --- | --- | --- |
| フロントエンド | Next.js 14+, TypeScript, Tailwind CSS | 教師・生徒向けUI、公開ページ。 |
| 認証 | Firebase Authentication (Google) | OAuthログイン、セッション管理。 |
| データ | Cloud Firestore | コンテンツ、ユーザー、ログ、CSVジョブ。 |
| ストレージ | Firebase Storage | CSVアップロード、テンプレート、将来的な教材。 |
| サーバーサイド | Firebase Cloud Functions | CSV処理、進捗集計、管理API。 |
| ホスティング | Vercel (Next.js) | 公開Webアプリ、Edge middlewareで認証ガード。 |
| 分析/バックアップ | BigQuery + Cloud Storage | ログの長期保存・分析。 |

## 3. フロントエンド構成

- **App Router**でルーティングし、`/public/*` は未ログイン閲覧を許可、`/dashboard/*` 等は middleware で Firebase Auth トークンを検証。
- UIライブラリ: Tailwind + Radix UI（想定）。フォーム/CSVアップロードなどは React Hook Form を利用。
- データ取得:
    - 公開コンテンツ一覧: ISR/SSG で `publishStatus=public` のデータをフェッチしてキャッシュ。
    - ログイン必須エリア: クライアント側で Firebase Auth のIDトークンを取得し、Next.js Route Handler (API) や直接Firestoreを呼ぶ。重要処理はRoute Handler経由で行い、再検証。
- 動画視聴検知: YouTube iframe API をクライアント側で利用し、しきい値到達で `video_progress` に書き込み。
- 小テスト: Route Handler で問題をランダム抽選しクライアントに返す。回答送信で `test_attempts` を作成。

## 4. Firebase / Cloud Functions

- **認証ガード**: Firebase Auth のカスタムクレームは利用せず、メールアドレスホワイトリストと `users.role` で判定。教師権限はFirebase Consoleで付与。教師アカウントでも生徒向け機能にアクセスできるようにし、動作確認や配信テストに活用する。
- **Cloud Functions (Node.js)**:
    1. CSVインポート: Storageアップロードをトリガーし、CSVを解析してFirestoreにバルク書き込み。
    2. 進捗集計: `video_progress` / `test_attempts` 更新時に `progress_snapshots` を再計算。集計処理では `users.role == 'student'` のログのみを対象とし、教師アカウントで記録されたデータは除外する。
    3. 手動トリガーAPI: 管理画面からHTTP経由で集計再実行やキャッシュ無効化を行う。
- **セキュリティルール**:
    - 公開コンテンツは読み取り許可（`publishStatus == public`）。私的情報が含まれるコレクション（`users`, `video_progress`, `test_attempts` など）は認証必須。
    - 教師専用の書き込み操作（CSVインポート、公開切替など）は `users.role == 'teacher'` のチェックを追加。

## 5. デプロイ / 環境

- **Vercel**: Production/Previewを利用。mainブランチがProduction、プルリク毎にPreview。
- **Firebase**: `prod` プロジェクトを本番、必要なら `stg` プロジェクトでテスト。
- 環境変数:
    - Vercel | Next.js: Firebase APIキー、Authドメイン、Project ID、Storageバケット、測定ID。
    - Functions: CSVテンプレートパス、BigQuery Dataset、メール通知設定（必要なら）。
- **デプロイフロー**:
    1. GitHub push -> Vercel preview -> 動作確認。
    2. mainへマージ -> Vercel productionデプロイ。
    3. Firebase Functions/Rulesは `firebase deploy --only functions,firestore:rules` で別途デプロイ。

## 6. 主なデータフロー

### 6.1 公開コンテンツ閲覧
1. 未ログインユーザーが `/lessons/{id}` を表示。
2. ISRページが Firestore (public) から `publishStatus=public` の授業/コンテンツを取得。
3. 動画/資料を閲覧可能。ただし視聴ログは書き込まれない。

### 6.2 ログイン後の動画視聴記録
1. 生徒が Firebase Auth でログイン -> middleware が JWTを検証。
2. クライアントで YouTubeプレイヤーを再生し、規定時間到達時に Route Handler `POST /api/video-progress` を呼び出し、IDトークンを送信。
3. Route Handler が Firebase Admin SDK で Firestore (`video_progress`) に書き込み。
4. Cloud Functions がトリガーされ、`progress_snapshots` を更新（`users.role == 'student'` のログのみ集計）。

### 6.3 小テスト受験
1. クライアントが `POST /api/quiz/start` を呼び、`questionsPerAttempt` に基づきランダム抽選した問題セットを受信。
2. 回答送信時に `POST /api/quiz/submit` で答案を送信。
3. Route Handler が正誤判定し、`test_attempts` に回答を保存。
4. 結果はクライアントに返し、Cloud Functionsで進捗集計（教師アカウントの受験データは集計から除外）。

### 6.4 CSV一括登録
1. 教師が管理画面でCSVをアップロード -> Storage `/csv_uploads/` へ保存。
2. StorageトリガーのCloud FunctionがCSVを読み込み、対象コレクションにバルク書き込みし `csv_import_jobs` を更新。
3. 成功/失敗結果をUIに表示。必要ならメール通知。

## 7. セキュリティ / アクセス制御

- ホワイトリスト方式: `users` に存在するメールのみAuthから許可。教師権限はFirebase Consoleで手動設定 (`role` フィールド)。
- Next.js middlewareで保護: `/dashboard`, `/teacher` などは必ずmiddleware経由でIDトークン検証。
- Firestore Security Rules:
    - `subjects/units/lessons/contents`: `publishStatus == 'public'` の読み取りのみ未ログイン許可。それ以外は認証必須。
    - `video_progress`, `test_attempts`: `request.auth.uid == resource.data.userId` のみ読み書き許可。教師が生徒UIでテストする場合も自身のUIDでログが残る。教師向けの他ユーザー閲覧は Cloud Functions 経由で行い、サーバーサイドで集計結果を返す。これらのコレクションでは `lastWatchedAt`/`finishedAt` を必須フィールドとして扱い、後述のログ削除手順で期間フィルタできるようにする。
    - `users`: 読み取りは本人と教師のみ、書き込みは教師のみ。

## 8. 運用/監視

- **ログ**: Vercel/Next.jsのアクセスログ、Firebase Functions のログをCloud Loggingで確認。
- **アラート**: Functions失敗やStorageアップロード失敗時にメール通知（必要ならOpsgenie等）。
- **バックアップ**: 年度末に Firestore から BigQuery/Cloud Storageへエクスポートし、`lastWatchedAt`/`finishedAt` を用いた期間指定でログを削除する（`document/design/log_export_and_cleanup.md` 参照）。
- **手動作業**: CSVインポートやログ削除の手順をドキュメント化し、作業履歴を残す。

## 9. 今後の拡張余地

- 認証強化: 利用者が増えた場合に多要素認証や管理者ロールを検討。
    - Access logs/監査ログをBigQueryに集約する。
- APIレイヤー: Next.js Route Handler をGraphQLやtRPCへ置き換えて型安全にする。
- オフラインキャッシュ: 生徒からのアクセス負荷を下げるため、静的APIキャッシュやEdge Functionsを活用。
