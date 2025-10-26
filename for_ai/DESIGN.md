# 設計書

## 1. 概要

本ドキュメントは、要求定義書に基づき、学習支援プラットフォーム「Polaris-Link」のシステム設計を定義する。
このプラットフォームは、生徒が主体的に学習を進めることを支援し、教師がその進捗を効率的に管理できる環境を提供することを目的とする。

## 2. 技術スタック

- **フロントエンド**: Next.js (React), TypeScript, Tailwind CSS, shadcn/ui
- **バックエンド**: Firebase (Cloud Functions for Firebase)
- **データベース**: Firebase (Cloud Firestore)
- **認証**: Firebase Authentication (Google Provider)
- **コード実行環境 (Playground)**: Pyodide (Python), Transpiler (JavaScript)
- **インフラ**: Firebase (Hosting, Functions, Firestore)

## 3. データベース設計 (Cloud Firestore)

Firestoreのデータは「コレクション」と「ドキュメント」で構成される。以下に主なコレクションの構造を示す。

- **users** (コレクション)
  - `{userId}` (ドキュメントID: Firebase AuthのUIDと同一)
    - `name`: string
    - `email`: string
    - `role`: 'teacher' | 'student'
    - `createdAt`: Timestamp

- **subjects** (コレクション)
  - `{subjectId}` (ドキュメント)
    - `name`: string
    - `description`: string
    - `teacherId`: string (usersコレクションのドキュメントIDへの参照)
    - `createdAt`: Timestamp

- **units** (コレクション)
  - `{unitId}` (ドキュメント)
    - `name`: string
    - `description`: string
    - `subjectId`: string (subjectsコレクションのドキュメントIDへの参照)
    - `order`: number
    - `createdAt`: Timestamp

- **lessons** (コレクション)
  - `{lessonId}` (ドキュメント)
    - `name`: string
    - `description`: string
    - `unitId`: string (unitsコレクションのドキュメントIDへの参照)
    - `order`: number
    - `createdAt`: Timestamp

- **contents** (コレクション)
  - `{contentId}` (ドキュメント)
    - `type`: 'video' | 'quiz' | 'link'
    - `title`: string
    - `url`: string (YouTube URLや外部リンク)
    - `lessonId`: string (lessonsコレクションのドキュメントIDへの参照)
    - `quizData`: object (typeが'quiz'の場合。質問、選択肢、答えなど)
    - `createdAt`: Timestamp

- **userProgress** (コレクション)
  - `{progressId}` (ドキュメント)
    - `userId`: string (usersコレクションのドキュメントIDへの参照)
    - `contentId`: string (contentsコレクションのドキュメントIDへの参照)
    - `viewCount`: number
    - `score`: number (クイズの得点)
    - `lastAccessed`: Timestamp

## 4. APIエンドポイント設計

APIはCloud Functions for Firebaseで実装し、Firebase Hostingのrewrites機能を利用して ` /api/* ` のパスでアクセス可能にする。

### 4.1. 認証

認証はFirebase Authenticationをクライアントサイドで利用して行う。サーバーサイドでのコールバックエンドポイントは不要。

1.  クライアント(フロントエンド)でFirebase SDKを使いGoogleログインを実行。
2.  ログイン成功後、FirebaseからIDトークンを取得。
3.  以降のAPIリクエストでは、このIDトークンを `Authorization: Bearer <ID_TOKEN>` ヘッダーに含めて送信する。
4.  Cloud Functions側では、受け取ったIDトークンを検証するミドルウェアを実装し、認証されたユーザー情報(UID, emailなど)を取得する。

### 4.2. 教師用 API (Cloud Functions)

- **科目管理**
  - `GET /api/teacher/subjects`: 担当科目一覧を取得
  - `POST /api/teacher/subjects`: 新規科目を作成
  - `PUT /api/teacher/subjects/{subject_id}`: 科目情報を更新
- **コンテンツ管理**
  - `POST /api/teacher/contents`: 新規コンテンツを作成
  - `PUT /api/teacher/contents/{content_id}`: コンテンツ情報を更新
- **分析**
  - `GET /api/teacher/analytics/students`: 生徒の利用状況を取得
- **一括登録**
  - `POST /api/teacher/csv/upload/students`: 生徒情報をCSVで一括登録

### 4.3. 生徒用 API (Cloud Functions)

- `GET /api/student/subjects`: 履修可能な科目一覧を取得
- `GET /api/student/lessons/{lesson_id}/contents`: 授業コンテンツ一覧を取得
- `POST /api/student/progress`: コンテンツの利用状況を記録
- `GET /api/student/analytics`: 自身の学習状況を取得

### 4.4. Playground API (Cloud Functions)

- `POST /api/playground/run`: PythonまたはJavaScriptコードを受け取り、実行結果を返す。

## 5. 画面設計

- **共通**
  - ログインページ (Googleログインボタン)
- **生徒画面**
  - ダッシュボード: 科目一覧
  - 授業ページ: 単元、授業、コンテンツをツリー構造で表示
  - コンテンツ表示モーダル/ページ: 動画プレイヤー、小テストフォーム、外部リンクへのリダイレクト
  - 学習分析ページ: 自身の学習進捗をグラフなどで可視化
- **教師画面**
  - ダッシュボード: 管理メニュー (科目管理, 生徒分析, CSV登録)
  - 科目・単元・授業管理ページ: CRUD操作を行うUI
  - コンテンツ管理ページ: ドラッグ&ドロップで授業への紐付けや並び替えが可能
  - 生徒利用状況分析ページ: 生徒ごと、コンテンツごとにフィルタリング可能な統計データ表示
  - CSVアップロードページ
- **Playground**
  - コードエディタと実行結果表示エリアを持つ独立したページ

## 6. その他

- **CSVフォーマット**:
  - ヘッダーを規定し、`email`, `name` (生徒) や `lesson_name`, `content_type`, `title`, `url` (コンテンツ) などのカラムを持つ。
- **エラーハンドリング**:
  - APIはステータスコード (400, 401, 403, 404, 500) を適切に返し、フロントエンドはそれに応じたエラーメッセージを表示する。
