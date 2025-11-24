# データモデル設計

本ドキュメントは、本システムで利用するFirestoreコレクション、フィールド構成、関連するストレージや補助データの設計をまとめる。Next.js（Vercel）+ Firebaseを前提とし、コンテンツ閲覧は未ログインでも可能だが、学習ログや進捗表示に必要なデータはログイン済みユーザーのみ書き込み可能とする。

## Firestore全体方針

- **トップレベルコレクションで階層を表現**: 科目・単元・授業を別コレクションに分割し、IDで参照する（ネストし過ぎるとクエリが煩雑になるため）。
- **公開状態フィールドを単一で管理**: `publishStatus`（`public`/`private`）で公開・非公開を制御し、公開中のみ生徒画面や未ログイン閲覧に出す。
- **監査/集計向けログ分離**: 視聴/テスト結果は専用ログコレクションで管理し、進捗表示用の集計はCloud Functionsで別ドキュメントに反映することも視野に入れる。

## コレクション一覧

| コレクション/パス | 役割 |
| --- | --- |
| `app_configs` | CSVテンプレートや公開設定など運用パラメータを保存。 |
| `users` | 教師/生徒ユーザーの属性、権限、在籍情報を管理。 |
| `subjects` | 科目。名称、表示順、公開状態を管理。 |
| `units` | 単元。`subjectId`と紐付け、公開状態を保持。 |
| `lessons` | 授業。`unitId`参照、コンテンツメタ情報、公開/非公開。 |
| `contents` | 各授業内の学習コンテンツ（動画/小テスト/リンク）。 |
| `questions` | 小テスト用の問題定義。 |
| `video_progress` | 各ユーザーの動画視聴ログ（2分以上視聴などの判定結果）。 |
| `test_attempts` | 小テストの受験履歴。問題ごとの正誤や回答内容を保持。 |
| `progress_snapshots` | 教師/生徒画面で表示する進捗サマリをキャッシュ。 |
| `csv_import_jobs` | CSV一括登録の実行状況、結果、エラーを保持。 |

## 各コレクション詳細

### `app_configs`
- `docId`: 例 `default`
- Fields:
    - `csvTemplates`: { `students`: string, `subjects`: string, ... } — Storage上のテンプレートファイルパス。
    - `allowPublicView`: boolean — 未ログイン閲覧可否（基本true）。
    - `announcement`: string — トップページ/ダッシュボードに表示する運用メッセージ（任意）。

### `users`
- `docId`: Firebase Auth UID。
- Fields:
    - `role`: `'teacher' | 'student'`
    - `email`: string
    - `studentNumber`: number — 学籍番号
    - `displayName`: string
    - `notes`: string — CSVインポートメモ等（任意）。
    - `createdAt`/`updatedAt`: Timestamp
- Index例:
    - `role asc, createdAt desc`（最新登録の生徒一覧）。
    - `email` にユニーク制約（アプリ側で検証）。

### `subjects`
- Fields:
    - `name`: string
    - `description`: string
    - `order`: number — 表示順。
    - `publishStatus`: `'public' | 'private'`
    - `createdBy`: userId
    - `updatedAt`: Timestamp
- Index例: `publishStatus asc, order asc`（公開科目の並び替え）。

### `units`
- Fields:
    - `name`: string
    - `description`: string
    - `subjectId`: string
    - `order`: number
    - `publishStatus`: `'public' | 'private'`
    - `createdBy`, `updatedAt`
- Index例:
    - `subjectId asc, order asc`（科目内の単元一覧取得）。
    - `publishStatus asc, subjectId asc`（公開単元のみ取得）。

### `lessons`
- Fields:
    - `title`: string
    - `description`: string
    - `unitId`: string
    - `contentIds`: string[] - 所属する`contents`の参照ID。
    - `publishStatus`: `'public' | 'private'`
    - `tags`: string[]（任意）
    - `order`: number — 単元内での並び順。
    - `createdBy`, `updatedAt`
- Index例:
    - `unitId asc, order asc`
    - `publishStatus asc, unitId asc`
    - `unitId == null`（単元未紐付け授業一覧取得用）

### `contents`
- Fields（共通）:
    - `type`: `'video' | 'quiz' | 'link'`
    - `title`: string
    - `description`: string
    - `tags`: string[]
    - `publishStatus`: `'public' | 'private'`
    - `order`: number
    - `metadata`: object — 種別ごとの詳細を格納。
        - 動画: `{ youtubeVideoId, durationSec }`
        - 小テスト: `{ questionPoolSize, questionsPerAttempt: 5, timeLimitSec?, allowRetry: boolean, questionIds: string[] }`
        - その他教材: `{ url }`
    - `createdBy`, `updatedAt`

### `questions`
- 小テスト用の問題コレクション。
- Fields:
    - `questionType`: `'multipleChoice' | 'ordering' | 'shortAnswer'`
    - `prompt`: string
    - `choices`: string[]（選択問題のみ）
    - `correctAnswer`: string | string[] — questionTypeに応じて可変。
    - `explanation`: string
    - `order`: number — 管理画面での表示位置（出題時はランダム抽選）。
    - `difficulty`: `'easy' | 'medium' | 'hard'`（難易度バランス調整用）
    - `isActive`: boolean — 出題対象とするかのフラグ。
    - `tags`: string[]（つまずき分析用）

### `video_progress`
- Document ID案: `${userId}_${contentId}` もしくは自動ID＋フィールド複合インデックス。
- Fields:
    - `userId`: string（必須、ログインしているユーザーのみ記録）
    - `lessonId`: string
    - `contentId`: string
    - `watchedDurationSec`: number
    - `watchedPercentage`: number
    - `status`: `'started' | 'completed'`（2分以上/所定割合で`completed`）
    - `lastWatchedAt`: Timestamp
- Index例:
    - `userId asc, lessonId asc`
    - `lessonId asc, contentId asc`（教師が授業ごとに視聴状況を集計する際）

### `test_attempts`
- Fields:
    - `userId`: string
    - `lessonId`: string
    - `contentId`: string
    - `selectedQuestionIds`: string[] — 抽選された問題IDリスト（約5問）。
    - `questionPoolSizeAtAttempt`: number — 受験時点の問題プール総数。
    - `attemptNo`: number（1から採番）
    - `startedAt`/`finishedAt`: Timestamp
    - `answers`: array of objects
        - `questionId`: string
        - `answer`: string | string[]
        - `isCorrect`: boolean
        - `submittedAt`: Timestamp
    - `score`: number
    - `summary`: { `totalQuestions`, `correctCount` }
- Index例:
    - `userId asc, contentId asc, attemptNo desc`
    - `lessonId asc, contentId asc, finishedAt desc`

#### 小テスト出題フロー
1. 学習者が授業内の小テストコンテンツを開始すると、`questions` コレクションから `isActive == true` のドキュメントを取得。
2. `metadata.questionsPerAttempt`（デフォルト5）で指定された数だけランダム抽選し、そのIDを `selectedQuestionIds` に格納する。
3. 抽選結果と問題文をクライアントに返し、回答と正誤判定を行った上で `answers` 配列に保存する。
4. 1受験あたりの正答率は `summary` で算出し、`progress_snapshots` などの集計に反映（`users.role == 'student'` のデータのみ対象）。

### `progress_snapshots`
- 教師/生徒ダッシュボードで高速に表示するための集計結果をキャッシュ。
- Fields:
    - `targetType`: `'user' | 'lesson' | 'content'`
    - `targetId`: string
    - `metrics`: object
        - 例: `{ completedVideos: number, pendingVideos: number, quizAccuracy: number }`
    - `updatedAt`: Timestamp
- 更新はCloud Functionsで定期的に行う想定。集計時には `users.role == 'student'` のログのみ対象とし、教師アカウントで記録された視聴・テスト結果は含めない。

### `csv_import_jobs`
- Fields:
    - `type`: `'students' | 'subjects' | 'units' | 'lessons' | 'contents'`
    - `filePath`: string（Firebase Storageのパス）
    - `status`: `'pending' | 'processing' | 'success' | 'failed'`
    - `processedCount`: number
    - `errorCount`: number
    - `errors`: array of { `rowNumber`, `message` }
    - `requestedBy`: userId
    - `requestedAt`/`completedAt`

## データのCRUDについて

- サーバコンポーネントでのREAD: firestoreに直接アクセスして取得
- クライアントコンポーネントでのCREATE, UPDATE, DELETE: `web/app/api/`からコールする。

## その他ストレージ/サービス

- **Firebase Storage**
    - CSVテンプレート、インポート用ファイルを`/csv_uploads/{timestamp}_{type}.csv`のように格納。
    - 添付教材（YouTube以外のファイル）が必要になった場合に備えて`/lesson_assets/{lessonId}/`を確保しておく。
- **Cloud Functions提案**
    - CSVアップロード処理、進捗集計、公開状態変更時のキャッシュ整合性調整、卒業生アカウントの有効/無効切り替え。

## 今後の検討メモ

- 未ログイン閲覧用に、公開科目/単元/授業/コンテンツをEdgeキャッシュ（ISR）する場合、`publishStatus`が変わった際の再生成フローを要定義。
- `video_progress`と`test_attempts`は件数増が見込まれるため、BigQueryへのエクスポートや定期アーカイブを検討する。
- 個人情報保護ポリシーに合わせ、`users`と学習ログを紐付ける際のデータ保持期限をあらかじめ定義しておく。
