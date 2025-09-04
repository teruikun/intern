FROM node:24-bullseye

WORKDIR /next

# package.jsonを先にコピーしてnpm installを実行（キャッシュ効率化）
COPY next/package*.json ./
RUN npm install
RUN npm install @yamada-ui/react
RUN npm install @yamada-ui/calendar


# その後でアプリケーションコードをコピー
COPY next/ ./

# Next.jsの開発サーバーのポートを公開
EXPOSE 3000

# ホットリロードのための環境変数を設定
ENV WATCHPACK_POLLING=true

CMD [ "npm", "run", "dev", "--", "--hostname", "0.0.0.0" ]