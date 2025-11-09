# web/Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

# システム依存ライブラリ（必要なら追加）
RUN apk add --no-cache bash

# 依存だけ先にインストールしておく（キャッシュ活用）
# COPY web/package.json web/package-lock.json* ./ 
# RUN npm ci

# アプリコードはマウントで上書きする想定
COPY web/ ./

ENV PORT=3000
EXPOSE 3000

# 開発用コマンド（host 0.0.0.0 で外からアクセス可に）
# CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
