# 一括登録 実装メモ

## 目的
- `web/app/admin/subjects/bulk`で実装を固め、他の`bulk`ページへ横展開する。

## 方針
- UIモック→バリデーション→確認画面→登録の順で実装する。
- 変更点はこのファイルに追記する。

## 実装ログ
- `web/app/admin/subjects/bulk/page.tsx` にファイル選択/ドラッグ&ドロップを追加。選択ファイル名をドロップ領域に表示。
- `web/app/admin/subjects/bulk/components/StatusPanel.tsx` を追加し、バリデーション結果の表示と確認UIを実装。
- `web/app/admin/subjects/bulk/page.tsx` でフロントバリデーションと確認UI表示を実装。
- `web/app/api/subjects/bulk/route.ts` を追加し、一括登録API(バリデーション/重複チェック/バッチ書き込み)を実装。
- `web/app/admin/subjects/bulk/components/StatusPanel.tsx` に処理中/成功の状態表示を追加。
- `web/app/admin/subjects/bulk/page.tsx` から `/api/subjects/bulk` を呼び出し、成功/失敗の表示を更新。
- `web/app/admin/subjects/bulk/page.tsx` のAPI呼び出しをログインユーザーの`user.uid`に変更。
- `web/app/admin/units/bulk` にフロントバリデーション/確認UI/登録処理を横展開。
- `web/app/api/units/bulk/route.ts` を追加し、単元の一括登録APIを実装。
- `web/app/admin/questions/bulk` にフロントバリデーション/確認UI/登録処理を横展開。
- `web/app/api/questions/bulk/route.ts` を追加し、小テスト問題の一括登録APIを実装。
- `web/app/admin/contents/bulk` にフロントバリデーション/確認UI/登録処理を横展開。
- `web/app/api/contents/bulk/route.ts` を追加し、コンテンツの一括登録APIを実装。
- `contents`の仕様変更(lessonId削除/重複判定=title/quizのquestionIds空許容)を反映。
- `web/app/admin/lessons/bulk` にフロントバリデーション/確認UI/登録処理を横展開。
- `web/app/api/lessons/bulk/route.ts` を追加し、授業の一括登録APIを実装。
- `web/app/admin/students/bulk` にフロントバリデーション/確認UI/登録処理を横展開。
- `web/app/api/students/bulk/route.ts` を追加し、生徒の一括登録APIを実装。
