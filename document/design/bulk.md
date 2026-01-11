# 一括登録設計

## 目的
- 管理画面から対象データをJSONで一括登録する
- FirestoreとTipTap Docに適した形式で安全に登録する

## 対象範囲
- 画面ごとに単一の対象のみを一括登録する
    - 生徒
    - 科目
    - 単元
    - 授業
    - コンテンツ
- 異なる対象を同一ファイルで混在させない

## 入力形式
- JSONファイル
- 配列形式を基本とする

例: 生徒
```json
{
  "students": [
    { "displayName": "田中", "email": "a@example.com", "studentNumber": 1 },
    { "displayName": "鈴木", "email": "b@example.com", "studentNumber": 2 }
  ]
}
```

例: 単元
```json
{
  "units": [
    { "name": "一次関数", "subjectId": "existingSubjectId", "publishStatus": "public" }
  ]
}
```

例: コンテンツ(TipTap Doc)
```json
{
  "contents": [
    {
      "lessonId": "existingLessonId",
      "type": "quiz",
      "title": "補足",
      "description": { "type": "doc", "content": [] },
      "metadata": {
        "questionsPerAttempt": 5,
        "questionIds": ["questionIdA", "questionIdB"],
        "allowRetry": true
      }
    }
  ]
}
```

## バリデーション
- JSON構造、必須項目、型の検証を行う
- 総ドキュメント数は300件以下
- 親子参照は既存IDの存在を検証する
- 重複は入力内で検知する

## 処理フロー
1. JSONファイルの添付・アップロード
2. バリデーション処理
3. 問題なければ確認画面（これらのデータを登録していいですか？）、問題があった場合はエラー箇所の表示（1に戻る）
4. Firestoreに登録処理
5. 成功した場合は登録完了の通知、失敗した場合はエラー通知

## 書き込み方式
- サーバー側で書き込み単位に展開する
- 1バッチでFirestoreに書き込む
- 失敗時は全件ロールバックする
- IDはサーバー側で自動生成する

## API設計
- 画面ごとに1エンドポイントで実装する
    - `/api/subjects/bulk`
    - `/api/units/bulk`
    - `/api/lessons/bulk`
    - `/api/contents/bulk`
    - `/api/questions/bulk`
    - `/api/students/bulk`

## エラー表示
- バリデーションエラーは項目名と配列インデックスを返す
- 書き込み失敗時はエラー理由を表示する
- バリデーションでエラーがある場合は確認画面に進まず、エラー箇所を表示する

## 確認画面
- バリデーション成功時は「進捗・エラー表示」領域に確認UIを表示する
- 文言: 「これらのデータを登録していいですか？」
- 確認用の登録ボタンを表示する
- 表示するデータは最大5件までとする

## ログ方針
- エラーはクライアントに返すのみとし、サーバー側には記録しない

### エラーレスポンス形式
- バリデーションエラーはHTTP 400で返す
- 形式は以下で統一する
```json
{
  "error": "validation_failed",
  "message": "Invalid payload",
  "details": [
    { "index": 0, "field": "email", "code": "required", "message": "email is required" },
    { "index": 2, "field": "subjectId", "code": "not_found", "message": "subjectId does not exist" }
  ]
}
```
- `index`: 配列内の0始まりインデックス
- `field`: フィールド名（ネストは`metadata.questionIds`のように表記）
- `code`: 下記のコード一覧に従う
- `message`: 表示用の短い説明

### エラー表示ルール
- エラーは先頭から最大50件まで返す
- エラーがある場合は一切書き込まず終了する

### エラーコード一覧(API実装準拠)
- `required`: 必須項目が未指定
- `invalid`: 型不正やフォーマット不正
- `duplicate`: 入力内の重複
- `not_found`: 参照IDが存在しない
- `limit_exceeded`: 上限件数超過(300件)
- `unsupported`: 想定外のtype/enum値

## 制約
- 1回の一括登録で最大300件まで
- 300件を超える場合はアップロード前にエラーとする

## 親子参照IDの取得手段
- 管理画面の詳細/一覧でIDを表示する
- 一覧にはコピーボタンを用意し、クリックでIDをクリップボードにコピーする
- JSON入力に必要な親IDは、管理画面で取得したIDを利用する

## 画面別フォーマットとバリデーション
### subjects
フォーマット
```json
{
  "subjects": [
    { "name": "数学", "description": { "type": "doc", "content": [] }, "publishStatus": "public", "order": 1 }
  ]
}
```
バリデーション
- `name`: 必須、空文字不可
- `description`: 任意、TipTap Doc形式
- `publishStatus`: 任意、`public`/`private`（省略時は`private`）
- `order`: 任意、数値で1以上

### units
フォーマット
```json
{
  "units": [
    { "subjectId": "existingSubjectId", "name": "一次関数", "description": { "type": "doc", "content": [] } }
  ]
}
```
バリデーション
- `subjectId`: 必須、`subjects`に存在するID
- `name`: 必須、空文字不可
- `description`: 任意、TipTap Doc形式
- `publishStatus`: 任意、`public`/`private`（省略時は`private`）
- `order`: 任意、数値で1以上

### lessons
フォーマット
```json
{
  "lessons": [
    {
      "unitId": "existingUnitId",
      "title": "導入",
      "description": { "type": "doc", "content": [] },
      "contentIds": ["existingContentId"],
      "tags": ["tag-a"],
      "publishStatus": "private",
      "order": 1
    }
  ]
}
```
バリデーション
- `unitId`: 必須、`units`に存在するID
- `title`: 必須、空文字不可
- `description`: 任意、TipTap Doc形式
- `contentIds`: 任意、`contents`に存在するID配列
- `tags`: 任意、文字列配列
- `publishStatus`: 任意、`public`/`private`（省略時は`private`）
- `order`: 任意、数値で1以上

### contents
フォーマット (video)
```json
{
  "contents": [
    {
      "type": "video",
      "title": "導入動画",
      "description": { "type": "doc", "content": [] },
      "tags": ["intro"],
      "publishStatus": "public",
      "order": 1,
      "metadata": { "youtubeVideoId": "xxxx", "durationSec": 600 }
    }
  ]
}
```
フォーマット (quiz)
```json
{
  "contents": [
    {
      "type": "quiz",
      "title": "確認テスト",
      "description": { "type": "doc", "content": [] },
      "tags": ["quiz"],
      "publishStatus": "private",
      "order": 2,
      "metadata": {
        "questionIds": ["questionIdA", "questionIdB"],
        "questionsPerAttempt": 5,
        "allowRetry": true,
        "timeLimitSec": 300
      }
    }
  ]
}
```
フォーマット (link)
```json
{
  "contents": [
    {
      "type": "link",
      "title": "参考資料",
      "description": { "type": "doc", "content": [] },
      "tags": ["reference"],
      "publishStatus": "public",
      "order": 3,
      "metadata": { "url": "https://example.com" }
    }
  ]
}
```
バリデーション
- `type`: 必須、`video`/`quiz`/`link`
- `title`: 必須、空文字不可
- `description`: 任意、TipTap Doc形式
- `tags`: 任意、文字列配列
- `publishStatus`: 任意、`public`/`private`（省略時は`private`）
- `order`: 任意、数値で1以上
- `metadata`: 必須、`type`に応じて検証
    - `video`: `youtubeVideoId`(必須), `durationSec`(必須, 1以上)
    - `quiz`: `questionIds`(必須, string配列), `questionsPerAttempt`(必須, 1以上), `allowRetry`(必須)
    - `link`: `url`(必須, URL形式)

### questions
フォーマット
```json
{
  "questions": [
    {
      "questionType": "multipleChoice",
      "prompt": { "type": "doc", "content": [] },
      "choices": [{ "key": "choice-1", "label": { "type": "doc", "content": [] } }],
      "correctAnswer": "choice-1",
      "explanation": { "type": "doc", "content": [] },
      "difficulty": "easy",
      "tags": ["intro"],
      "order": 1
    }
  ]
}
```
バリデーション
- `questionType`: 必須、`multipleChoice`/`ordering`/`shortAnswer`
- `prompt`: 必須、TipTap Doc形式
- `choices`: 選択/並び替えのみ必須、`{ key, label }`配列
- `correctAnswer`: 必須、文字列または文字列配列
- `explanation`: 任意、TipTap Doc形式
- `difficulty`: 任意、`easy`/`medium`/`hard`
- `tags`: 任意、文字列配列
- `order`: 任意、数値で1以上

### students
フォーマット
```json
{
  "students": [
    { "displayName": "田中", "email": "a@example.com", "studentNumber": 1, "notes": "任意メモ" }
  ]
}
```
バリデーション
- `email`: 必須、メール形式（小文字化して保存）
- `displayName`: 任意、空文字は許容
- `studentNumber`: 任意、数値
- `notes`: 任意、文字列

## 管理画面UIのガイド文
### 共通
- 必須項目は`*`を付ける
- JSONファイルはUTF-8で保存する
- 1回の上限は300件
- エラー時は登録されない（全件ロールバック）

### subjects
必須: `name`  
任意: `description`, `publishStatus`, `order`

### units
必須: `subjectId`, `name`  
任意: `description`, `publishStatus`, `order`

### lessons
必須: `unitId`, `title`  
任意: `description`, `contentIds`, `tags`, `publishStatus`, `order`

### contents
必須: `type`, `title`, `metadata`  
任意: `lessonId`, `description`, `tags`, `publishStatus`, `order`

typeごとの必須
- `video`: `metadata.youtubeVideoId`, `metadata.durationSec`
- `quiz`: `metadata.questionIds`, `metadata.questionsPerAttempt`, `metadata.allowRetry`
- `link`: `metadata.url`

### questions
必須: `questionType`, `prompt`, `correctAnswer`  
任意: `choices`, `explanation`, `difficulty`, `tags`, `order`

questionTypeごとの必須
- `multipleChoice` / `ordering`: `choices`

### students
必須: `email`  
任意: `displayName`, `studentNumber`, `notes`

## 管理画面UI文言
### ボタン/ラベル
- アップロードボタン: 「JSONファイルを選択」
- 実行ボタン: 「一括登録を実行」
- サンプル表示: 「入力例を見る」

### 成功メッセージ
- 「{件数}件の登録が完了しました。」

### 失敗メッセージ(共通)
- 「登録に失敗しました。入力内容を確認してください。」
- 「エラーがあるため登録されませんでした。」
- 「修正後、再度JSONを選択して実行してください。」

### エラーコード別表示文言
- `required`: 「必須項目が未入力です。」
- `invalid`: 「形式が正しくありません。」
- `duplicate`: 「入力内で重複しています。」
- `not_found`: 「参照先が存在しません。」
- `limit_exceeded`: 「件数が上限を超えています。」
- `unsupported`: 「指定できない値です。」

### エラー詳細表示テンプレート
- 「{index}行目 {field}: {message}」

### 進捗表示
- 「アップロード中...」
- 「検証中...」
- 「登録中...」
