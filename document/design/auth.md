# 認証設計（Google + Firestoreユーザー照合）

## ゴール
- Googleアカウントでログインするが、**事前に承認されたユーザーだけ**が利用できる。
- ログイン処理では未承認ユーザーを残さない（許可されない場合は Auth から即削除しサインアウト）。
- Firestore `users` と Firebase Auth ユーザーをメールで照合し、許可時に UID を紐付ける。

## 基本方針（無料枠で Blocking Functions を使わない想定）
- Google サインイン成功後、Firestore `users` をメールで検索し、**未登録なら Admin SDK で Auth ユーザーを即削除して signOut**（Authに残さない）。
- 登録済みなら、そのユーザーの `authId`/`uid` を Firestore に保存（紐付け）し、以降は UID 照合でアクセス制御する。
- UIDは **サーバー（Admin SDK）側で管理** し、クライアントが任意のUIDを書き込まない。

## データ要件
- Firestore `users`：Auth UID と一致する `id` で事前登録（`role/email/displayName/studentNumber/notes` 等）。
- Auth：対応する Google アカウントが存在すること（UID一致）。メール照合ではなく UID 照合を基本とする。

## 環境別運用
- 開発環境
  - ダミーデータを Firestore エミュレータに投入（メール必須）。Auth エミュレータで同メールの Google ユーザーをシードしておくと動作確認が容易。
  - サインイン後の許可チェック（メール照合＋未登録は削除）を同じフローで検証。
- 本番環境
  - 管理UI/CSVで生徒を登録（メールを Firestore に保存）。この時点では Auth UID 未定でも可。
  - 生徒が初回 Google サインイン → メール照合 → 未登録なら Admin SDK で Auth ユーザー削除＋signOut → 登録済みなら `authId`/`uid` を Firestore に保存して紐付け。
  - 教師アカウント: まず管理画面で生徒として登録し、**Firebase Console で管理者が手動でロールを切り替える**（Auth/Firestore両方の`role`/`claims`を揃える運用を前提）。

## クライアント実装メモ
- `AuthProvider` 内で `onAuthStateChanged` 監視後、サーバーAPIにメール照合を依頼。未登録なら API 側で Auth ユーザー削除＋ signOut → 「登録されていないアカウントです」を表示。
- 登録済みなら API 側で Firestore に `authId` を保存（未設定の場合）し、クライアントは UID をコンテキストに保持。
- UI（ヘッダー/メニュー）は `loading`/`user` 状態で出し分け。ログイン促しは未ログイン時のみ表示。

## API/サーバー実装メモ
- ログイン後の照合APIを用意し、メールで Firestore `users` を検索。未登録なら Admin SDK で `deleteUser(uid)` → 401/403 を返す。登録済みなら `authId` を保存し 200 を返す。
- 作成系APIは **メール等の情報だけ受け取り、UID書き込みはサーバー側で行う**。クライアントからの UID 指定は拒否。
- 片手落ち（Authだけ・Firestoreだけ）を防ぐため、Auth削除は必ずサーバー（Admin SDK）経由で行う。

## 失敗時の挙動
- Firestore にユーザーが無い場合: その場で signOut し、「登録されていないアカウントです」と表示。
- Auth作成をブロックしたい場合: Blocking Functions の `beforeCreate` で Firestore 参照し、未承認なら拒否。
