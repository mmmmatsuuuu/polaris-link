# TipTap 画像ペースト/ドロップ設計

## 目的
- Next.js(App Router) + TipTap で、Notionのように画像をコピー&ペースト/ドラッグ&ドロップできるようにする。
- ペースト時はUploadingプレースホルダを挿入し、アップロード成功時に画像ノードへ置換。
- 失敗時はプレースホルダ削除と「貼り付け前に戻った」状態にし、トーストを表示する。

## 現状
- エディタ: `web/components/ui/tiptap/TipTapEditor.tsx` は StarterKit + 標準 Image。
- ビューア: `web/components/ui/tiptap/TipTapViewer.tsx` も標準 Image。
- 画像の paste/drop 未対応。
- Firebase client は `web/lib/firebase/client.ts` にあるが、Storageアップロードユーティリティは未実装。

## 要件整理（現状に合わせた補正込み）
1) TipTap拡張で paste/drop を処理（ProseMirror plugin）。
2) Uploadingノード(atomic)を挿入して置換する方式。
3) クライアントで最大幅1000pxにリサイズ。
4) Firebase Storageへアップロード（uuidパス）。
5) 失敗時はプレースホルダ削除 + 貼り付け前の状態へ戻す + トースト。
6) 画像アクションメニュー（削除/幅/配置）をRadix UIで。
7) 重複排除は初期PRでは見送り（フックだけ残す）。

## 設計概要

### アーキテクチャ
- 画像貼付/ドロップを処理する TipTap 拡張 (ImageUploadExtension) を追加。
  - `handlePaste`/`handleDrop` で image/* を検出。
  - 画像ごとに Uploading ノードを挿入。
  - リサイズ -> アップロード -> 置換 の非同期処理。
- Uploadingノード拡張（atom, inline）を追加。
- Imageノードを拡張し、`width`/`align`属性を保持・HTML反映。
- リサイズ/アップロードのユーティリティを新設。
- 画像クリック時のアクションメニューを追加。

### ペースト/ドロップのフロー
1) ClipboardEvent / DragEvent から image/* ファイル抽出。
2) Uploadingノードを挿入 (uuid保持)。
3) 必要なら canvas リサイズ。
4) Firebase Storage にアップロード。
5) Uploadingノードを Imageノードに置換。
6) 失敗時は Uploading削除 + 貼付前状態へ復帰 + トースト。

### Uploadingノード設計
- node name: `uploadingImage`
- attrs: `{ id: string }`
- atom: true, inline: true
- 表示: 「Uploading...」等の簡易UI

### 失敗時の復帰方針
- なるべく Uploading 挿入以外の変更を出さない設計にする。
- 失敗時は Uploading を削除し、見た目として貼り付け前に戻す。

### 画像属性
- `width`: "100%" | "75%" | "50%"
- `align`: "left" | "center" | "right"
- HTMLへの反映は style もしくは class。

### UI (Radix)
- ImageActionMenu: Popover/Dropdown で削除/幅/配置。
- 実装方式:
  - Option A: Image NodeView + メニュー
  - Option B: クリック時に selection から対象ノードを操作（簡易）
- エラーメッセージはToast固定にせず、`onImageUploadError` コールバックで委譲。
  - 未指定の場合は `window.alert` などの簡易通知で対応。

## 実装タスク

### A) TipTap拡張
- [x] `web/components/ui/tiptap/extensions/ImageUploadExtension.ts` を追加
  - handlePaste / handleDrop
  - Uploading挿入 -> async処理
- [x] `web/components/ui/tiptap/extensions/UploadingImage.ts` を追加
  - atom inline node
- [x] `web/components/ui/tiptap/extensions/ExtendedImage.ts` を追加
  - width/align属性

### B) ユーティリティ
- [ ] `web/lib/tiptap/resizeImage.ts`
  - `resizeToMaxWidth(fileOrBlob, maxWidth=1000): Promise<File>`
- [ ] `web/lib/firebase/storageUpload.ts`
  - `uploadImageToStorage(file: File, docId: string): Promise<{url, path}>`

### C) エディタ統合
- [ ] `web/components/ui/tiptap/TipTapEditor.tsx`
  - 拡張追加
  - `docId` prop を追加
  - エラーメッセージ連携（`onImageUploadError`）
- [ ] `web/components/ui/tiptap/TipTapViewer.tsx`
  - ExtendedImage を使用

### D) UI
- [ ] `web/components/ui/tiptap/ImageActionMenu.tsx`
  - Radix Popover/Dropdown
- [ ] `web/components/ui/tiptap/tiptap.css`
  - Uploadingノード表示
  - 画像width/alignのスタイル

### E) エラーハンドリング
- [ ] 失敗時の通知（Toast必須ではない）
- [ ] 貼り付け前状態へ戻すことを保証

## 決定事項
- エラーメッセージはToastに限定せず `onImageUploadError` で委譲。
- docId は `TipTapEditor` の props に追加。
- align は wrapper(div) + flex + justify-content 方式で実装。

## 手動テスト
1) 画像貼付で Uploading 表示
2) アップロード成功で画像表示（Storage URL）
3) 1000px超の画像が縮小
4) 失敗時にUploadingが消えて貼付前に戻る + トースト
5) 画像クリックでメニューが出て削除/幅/配置が反映
