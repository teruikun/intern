import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker環境でのホットリロードを有効にする
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // ファイル変更の監視設定（Docker環境用）
      config.watchOptions = {
        poll: 1000, // 1秒ごとにファイルチェック
        aggregateTimeout: 300, // 変更後300ms待ってリビルド
        ignored: ["**/node_modules", "**/.git"],
      };
    }
    return config;
  },
};

export default nextConfig;
