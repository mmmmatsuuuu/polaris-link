# ログエクスポート/手動削除ガイド

`video_progress`・`test_attempts` は年単位でログ件数が増加するため、年度末にデータをエクスポートしてから手動で削除する運用を行う。ここでは現時点で想定している手順をまとめる。

## 1. 準備
- 対象期間（例: 前年度4月1日〜翌年3月31日）のログをエクスポートすることを決定し、日付レンジを記録する。
- 必要に応じて Firebase Authentication の利用者リストを確認し、該当期間にアクティブだった生徒を把握する。
- エクスポート先の BigQuery プロジェクトまたは Cloud Storage バケットのアクセス権を確認する。

## 2. BigQuery へのエクスポート（推奨）
1. Firebase Console > Firestore > エクスポート/インポート から対象プロジェクトを選択。
2. エクスポート対象コレクションに `video_progress` と `test_attempts` を指定。
3. 出力先として Cloud Storage バケット（例: `gs://polaris-link-backups/YYYY`）を指定し、エクスポートを実行。
4. エクスポート完了後、BigQuery の「データの取り込み」機能で `video_progress` / `test_attempts` をそれぞれテーブルとして読み込む（スキーマ自動推測を利用）。

## 3. Firestore 上での期間フィルタ確認
- Firestore のコンソールまたは Firebase CLI で、対象期間（Timestamp）に該当するドキュメントが抽出できることを確認する。
- `video_progress` は `lastWatchedAt`、`test_attempts` は `finishedAt` を基準に、開始日と終了日で範囲クエリを行う。
- 期間内に限ってエクスポート/削除できるよう、CLIで `where lastWatchedAt >= start` などのクエリを事前テストする。

## 4. 手動削除の手順
> バッチ削除用の Cloud Functions はまだ用意しないため、Firebase Console の「コレクションのクエリ」機能または Firebase CLI で手動削除を行う。

1. Firestore Console の該当コレクションでフィルタ条件を設定し、対象ドキュメントを一覧表示する。
2. 画面上から一括選択し削除、または CLI を使って `gcloud beta firestore documents delete` コマンドで削除する。削除前に再度件数を確認する。
3. 削除後は進捗ダッシュボードや `progress_snapshots` が再計算されるまで一時的に空になるため、必要に応じて再集計処理を手動でトリガーする（Cloud Functions の手動トリガーや管理画面の「再集計」ボタンなど）。再集計時にも教師アカウントのログは自動的に除外される。

## 5. 記録
- エクスポートファイルの保存先、削除実施日時、対象件数、確認者を運用ノート（例: Notion や `document/ops_log.md`）に残す。
- 次年度以降も同じ手順で再利用できるよう、改善点や注意事項を追記しておく。

## 今後の改善アイデア
- `video_progress` / `test_attempts` に `academicYear` フィールドを追加し、年度で直接フィルタできるようにする。
- BigQuery へのエクスポートと削除を自動化するバッチ（Cloud Functions + Cloud Scheduler）の導入。
- エクスポート削除前に進捗サマリを `progress_snapshots` に固定化し、過去年度の参照ページを用意する。
