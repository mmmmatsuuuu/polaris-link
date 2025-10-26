# Polaris Link

生徒が自分のペースで学びを進められることを目指した、情報科向けの学習支援プラットフォームです。

## ✨ 主な機能

### 教師向け機能
- 授業コンテンツ（動画、小テスト、外部リンク）の登録・管理 (CRUD)
- 科目・単元・授業の階層的な管理
- 生徒の学習利用状況の分析・可視化
- 生徒やコンテンツ情報の一括登録 (CSVインポート)

### 生徒向け機能
- 授業コンテンツの閲覧
- 小テストの受験
- 自身の学習状況の確認

### その他
- Python, JavaScript のコードを試せる Playground 環境

## 🛠️ 技術スタック

- **フロントエンド**: Next.js (React), TypeScript, Tailwind CSS, shadcn/ui
- **バックエンド**: Firebase (Cloud Functions for Firebase)
- **データベース**: Firebase (Cloud Firestore)
- **認証**: Firebase Authentication (Google Provider)
- **インフラ**: Firebase (Hosting, Functions, Firestore)

## 開発環境の構築

本プロジェクトはDockerを使用して開発環境を構築します。

1.  **リポジトリをクローン**
    ```bash
    git clone https://github.com/[your-username]/polaris-link.git
    cd polaris-link
    ```

2.  **Firebase設定**
    - Firebaseコンソールでプロジェクトを作成し、ウェブアプリを登録します。
    - 取得した`firebaseConfig`の内容を`.env.local.example`を参考に`.env.local`ファイルとしてルートディレクトリに作成します。

3.  **コンテナの起動**
    ```bash
    docker-compose up -d --build
    ```

4.  **アクセス**
    - フロントエンド: `http://localhost:3000`
    - Firebase Emulator UI: `http://localhost:4000`

