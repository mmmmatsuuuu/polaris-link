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
- [x] UIモックアップ基盤の整備：Firestore Emulator をモックAPIから参照できる状態にし、各UI実装時に必要なダミーデータを都度投入できるようにする（認証ルーティングは無効化したまま）。
- [x] 授業一覧ページのUIモック（SSG/ISR前提でセクション構成とCTA配置を固め、実装中に必要なカード分のダミーデータを投入・取得）。

### UIデザインモック作成
UIデザインモックの作成TODO。必要に応じて、詳細なTODOの追加や修正あり。

- [x] 各ページのUI作成（修正しやすいようにコンポーネントは切り分けずダミーデータも適当にハードコーディングする）。
- [x] 各ページのUI修正
- [x] UIデザイン決定
- [x] コンポーネントの切り分け


### ダミーデータ登録とUI接続
ダミーデータ登録TODO。必要に応じて、詳細なTODOの追加や修正あり。

- [ ] 優先順にコレクションを決める（例: subjects → units → lessons → contents）。

### subjects
- [ ] ダミーデータを`./web/app/dummy-data/<collection>.json`に保存。
- [ ] `/web/app/dev/import`から該当コレクションをFirestoreへ投入。
- [ ] UIと接続して表示・操作を確認し、スキーマや文言の差異を即修正。
- [ ] 依存関係が強い場合は親子コレクションの小セットをまとめて投入して動作確認。

### units
- [ ] ダミーデータを`./web/app/dummy-data/<collection>.json`に保存。
- [ ] `/web/app/dev/import`から該当コレクションをFirestoreへ投入。
- [ ] UIと接続して表示・操作を確認し、スキーマや文言の差異を即修正。
- [ ] 依存関係が強い場合は親子コレクションの小セットをまとめて投入して動作確認。

### lessons
- [ ] ダミーデータを`./web/app/dummy-data/<collection>.json`に保存。
- [ ] `/web/app/dev/import`から該当コレクションをFirestoreへ投入。
- [ ] UIと接続して表示・操作を確認し、スキーマや文言の差異を即修正。
- [ ] 依存関係が強い場合は親子コレクションの小セットをまとめて投入して動作確認。

### contents
- [ ] ダミーデータを`./web/app/dummy-data/<collection>.json`に保存。
- [ ] `/web/app/dev/import`から該当コレクションをFirestoreへ投入。
- [ ] UIと接続して表示・操作を確認し、スキーマや文言の差異を即修正。
- [ ] 依存関係が強い場合は親子コレクションの小セットをまとめて投入して動作確認。

### questions
- [ ] ダミーデータを`./web/app/dummy-data/<collection>.json`に保存。
- [ ] `/web/app/dev/import`から該当コレクションをFirestoreへ投入。
- [ ] UIと接続して表示・操作を確認し、スキーマや文言の差異を即修正。
- [ ] 依存関係が強い場合は親子コレクションの小セットをまとめて投入して動作確認。

※ ここまでで一通り使ってみて設計の修正を行う。

### users
- [ ] ダミーデータを`./web/app/dummy-data/<collection>.json`に保存。
- [ ] `/web/app/dev/import`から該当コレクションをFirestoreへ投入。
- [ ] UIと接続して表示・操作を確認し、スキーマや文言の差異を即修正。
- [ ] 依存関係が強い場合は親子コレクションの小セットをまとめて投入して動作確認。

※ ここまでで一通り使ってみて設計の修正を行う。

### video_progress
- [ ] ダミーデータを`./web/app/dummy-data/<collection>.json`に保存。
- [ ] `/web/app/dev/import`から該当コレクションをFirestoreへ投入。
- [ ] UIと接続して表示・操作を確認し、スキーマや文言の差異を即修正。
- [ ] 依存関係が強い場合は親子コレクションの小セットをまとめて投入して動作確認。

### test_attempts
- [ ] ダミーデータを`./web/app/dummy-data/<collection>.json`に保存。
- [ ] `/web/app/dev/import`から該当コレクションをFirestoreへ投入。
- [ ] UIと接続して表示・操作を確認し、スキーマや文言の差異を即修正。
- [ ] 依存関係が強い場合は親子コレクションの小セットをまとめて投入して動作確認。

- [ ] 認証ロジックの実装。
- [ ] ロールによるルーティング処理の実装。

### 本番用作成
プロトタイプ次第で修正を加えるTODOを追加し、デプロイ。
