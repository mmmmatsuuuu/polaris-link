# 認証設計（Google + Firestoreユーザー照合）

## ゴール
- Googleアカウントでログインするが、**事前に承認されたユーザーだけ**が利用できる。
- ログイン処理では新規ユーザードキュメントを自動作成しない。
- Firestore `users/{uid}` と Firebase Auth ユーザーの **UID を一致**させて管理する。

## 基本方針
- ログイン後、`auth.currentUser.uid` を使って Firestore `users/{uid}` を取得し、存在しなければ即 signOut して拒否する。
- UIDは **サーバー（Admin SDK）側で生成・管理** し、クライアントから任意のUIDを渡させない。
- 可能なら Firebase Blocking Functions (`beforeCreate`) で、未承認アカウントの新規Auth作成をブロックする。

## データ要件
- Firestore `users`：Auth UID と一致する `id` で事前登録（`role/email/displayName/studentNumber/notes` 等）。
- Auth：対応する Google アカウントが存在すること（UID一致）。メール照合ではなく UID 照合を基本とする。

## 環境別運用
- 開発環境
  - ダミーデータを用意し、**Authエミュレータと Firestoreエミュレータに同じUIDで投入**する。
  - シードスクリプトは Admin SDK で `createUser` → `setDoc(users/{uid})` の順に処理。
- 本番環境
  - 管理UI/CSV取り込みのサーバー処理で **Admin SDK を用い、Authユーザー作成 → そのUIDで Firestore `users/{uid}` 作成** をセットで実行。
  - 既存メール重複やロールの付与もこのフローで行う。
  - 教師アカウント: まず管理画面で生徒として登録し、**Firebase Console で管理者が手動でロールを切り替える**（Auth/Firestore両方の`role`/`claims`を揃える運用を前提）。

## クライアント実装メモ
- `AuthProvider` 内で `onAuthStateChanged` 監視後、`users/{uid}` を取得。存在しない場合は signOut とエラーメッセージ。
- UI（ヘッダー/メニュー）は `loading`/`user` 状態で出し分け。ログイン促しは未ログイン時のみ表示。

## API/サーバー実装メモ
- 作成系APIは **メール等の情報だけ受け取り、UID生成は必ずサーバーで行う**。クライアントからの UID 指定は拒否。
- 片手落ち（Authだけ・Firestoreだけ）を防ぐため、Auth作成と `users/{uid}` 作成を必ずセットで行う。

## 失敗時の挙動
- Firestore にユーザーが無い場合: その場で signOut し、「登録されていないアカウントです」と表示。
- Auth作成をブロックしたい場合: Blocking Functions の `beforeCreate` で Firestore 参照し、未承認なら拒否。
