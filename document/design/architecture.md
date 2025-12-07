# アーキテクチャ / 技術スタック設計

本ドキュメントでは、Polaris-Link のシステム構成、採用技術、主要なデータフローをまとめる。要件は Next.js + Firebase を前提とし、ホスティングは Vercel で行う。

## 1. 全体構成

- **クライアント/フロントエンド**: Next.js (App Router) を使用し、Vercel でホスト。静的生成 (ISR) / SSR / クライアントフェッチを用途に応じて使い分ける。
- **認証**: Firebase Authentication (Google OAuth)。ホワイトリスト登録済みメールアドレスのみ教師/生徒として利用可。
- **データストア**: Cloud Firestore をメインDBとし、Storage はインポートテンプレートや教材ファイル置き場として利用。
- **バックエンド処理**: Firebase Cloud Functions を使用して表データ（コピー&ペースト）インポート、進捗集計、手動トリガーAPIなどを実装する。
- **ログ/解析**: `video_progress`, `test_attempts` はFirestoreに蓄積し、一定期間ごと（例: 年度末）にBigQueryへエクスポートして削除（手動）。
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
| フロントエンド | Next.js 14+, TypeScript, Tailwind CSS, Radix UI | 教師・生徒向けUI、公開ページ。 |
| 認証 | Firebase Authentication (Google) | OAuthログイン、セッション管理。 |
| データ | Cloud Firestore | コンテンツ、ユーザー、ログ、インポートジョブ。 |
| ストレージ | Firebase Storage | インポートテンプレート（オプション）、将来的な教材。 |
| サーバーサイド | Firebase Cloud Functions | 表データインポート、進捗集計、管理API。 |
| ホスティング | Vercel (Next.js) | 公開Webアプリ、Edge middlewareで認証ガード。 |
| 分析/バックアップ | BigQuery + Cloud Storage | ログの長期保存・分析。 |

## 3. フロントエンド構成

- **App Router**でルーティングし、`/public/*` は未ログイン閲覧を許可、`/dashboard/*` 等は middleware で Firebase Auth トークンを検証。
- UIライブラリ: Tailwind + Radix UI（想定）。フォーム/表データ貼り付けUIなどは React Hook Form を利用。
- データ取得:
    - 公開コンテンツ一覧: ISR/SSG で `publishStatus=public` のデータをフェッチしてキャッシュ。
    - ログイン必須エリア: クライアント側で Firebase Auth のIDトークンを取得し、Next.js Route Handler (API) や直接Firestoreを呼ぶ。重要処理はRoute Handler経由で行い、再検証。
- 動画視聴検知: YouTube iframe API をクライアント側で利用し、しきい値到達で `video_progress` に書き込み。
- 小テスト: Route Handler で問題をランダム抽選しクライアントに返す。回答送信で `test_attempts` を作成。

## 4. Firebase / Cloud Functions

- **認証ガード**: Firebase Auth のカスタムクレームは利用せず、メールアドレスホワイトリストと `users.role` で判定。教師権限はFirebase Consoleで付与。教師アカウントでも生徒向け機能にアクセスできるようにし、動作確認や配信テストに活用する。
- **Cloud Functions (Node.js)**:
    1. 表データインポート: 管理画面から貼り付けられた表データをHTTP経由で受け取り、Firestoreにバルク書き込み。
    2. 進捗集計: `video_progress` / `test_attempts` 更新時に `progress_snapshots` を再計算。集計処理では `users.role == 'student'` のログのみを対象とし、教師アカウントで記録されたデータは除外する。
    3. 手動トリガーAPI: 管理画面からHTTP経由で集計再実行やキャッシュ無効化を行う。
- **セキュリティルール**:
    - 公開コンテンツは読み取り許可（`publishStatus == public`）。私的情報が含まれるコレクション（`users`, `video_progress`, `test_attempts` など）は認証必須。
    - 教師専用の書き込み操作（表データインポート、公開切替など）は `users.role == 'teacher'` のチェックを追加。

## 5. デプロイ / 環境

- **Vercel**: Production/Previewを利用。mainブランチがProduction、プルリク毎にPreview。
- **Firebase**: `prod` プロジェクトを本番、必要なら `stg` プロジェクトでテスト。
- 環境変数:
    - Vercel | Next.js: Firebase APIキー、Authドメイン、Project ID、Storageバケット、測定ID。
    - Functions: インポートテンプレートパス（必要な場合）、BigQuery Dataset、メール通知設定（必要なら）。
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

### 6.4 表データ（コピー&ペースト）一括登録
**狙い**: CSVファイルを介さず、Excel/Googleスプレッドシートのコピー結果（主にTSV）をそのまま貼り付けて取り込むことでUXを向上させる。

**フロントエンド**
1. 教師が管理画面のインポートページを開き、スプレッドシートの範囲をコピー。
2. ページ内の貼り付けエリア（`contenteditable` または `textarea`）にペースト。`onPaste`で `text/plain` を取得し、タブ区切り優先で自動判定しながら2次元配列へパース（必要に応じ `papaparse` をTSVモードで利用）。
3. 事前定義したカラムスキーマ（例: ヘッダー行の順序、必須/任意、型: 文字列/整数/日付/真偽）に従いフロントで型チェック・整形（例: 日付→ISO文字列、真偽値→`true/false`、数値→`number`）。ヘッダー欠落や行長不足は行単位でエラーにする。
4. エラーがなければ確認画面でプレビュー（一覧表示）。行ごとの警告/エラーはインラインで表示し、再ペーストで修正可能。
5. 「登録」操作でサーバーへ送信。1回の登録上限は300件とし、それ以上は分割（シンプル実装・バックエンド負荷軽減が目的）。

**バックエンド**
- Next.js Route Handler または HTTP Cloud Functionで `POST /api/import/paste` を用意。教師権限チェック（IDトークン検証）と CSRF 対策を実施。
- 受信した配列を再度スキーマ検証（改ざん防止）し、Firestoreにバルク書き込み。1回の登録上限300件に制限し、`writeBatch` はその範囲で実行（バッチ分割は行わず実装を簡素化）。進捗/失敗を `import_jobs` コレクションに記録してUIに返す。
- エラー応答は行番号と項目名を含めて返却し、フロントで該当行をハイライト。

**実現性/留意点**
- スプレッドシートのコピーは標準でTSVになるため追加ツール不要。日付/数値フォーマットの揺れに備え、許容フォーマット一覧を用意してパースする。
- Next.jsのボディサイズ上限（デフォルト~1–4MB程度）にかかる場合は分割送信か、一時的にStorageへテキストをアップロードしてジョブ処理するフォールバックを用意する。基本方針は300件/回で送信し、バッチ分割を避けて実装をシンプルにする。
- 大量データ時の書き込みエラーに備え、ジョブID/ログをFirestoreに残し、部分成功・再実行をしやすくする。
- 既存のCSVアップロード手順はオプション扱いにし、同じスキーマを流用することで検証ロジックを共通化できる。

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
- **バックアップ**: 学習期間終了後に Firestore から BigQuery/Cloud Storageへエクスポートし、`lastWatchedAt`/`finishedAt` を用いた期間指定でログを削除する（`document/design/log_export_and_cleanup.md` 参照）。
- **手動作業**: インポートやログ削除の手順をドキュメント化し、作業履歴を残す。

## 9. 今後の拡張余地

- 認証強化: 利用者が増えた場合に多要素認証や管理者ロールを検討。
    - Access logs/監査ログをBigQueryに集約する。
- APIレイヤー: Next.js Route Handler をGraphQLやtRPCへ置き換えて型安全にする。
- オフラインキャッシュ: 生徒からのアクセス負荷を下げるため、静的APIキャッシュやEdge Functionsを活用。
