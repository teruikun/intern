"use client";

import { useEffect, useState } from "react";
import { Box, VStack, Text, Button } from "@yamada-ui/react";
import {
  getUserData,
  clearUserData,
  isAuthenticated,
  isOrganization,
  isUser,
} from "../../utils/auth";

export default function AuthTestPage() {
  const [authData, setAuthData] = useState<{
    token: string | null;
    role: string | null;
  }>({ token: null, role: null });
  const [mounted, setMounted] = useState(false);

  const refreshAuthData = () => {
    const data = getUserData();
    setAuthData(data);
  };

  useEffect(() => {
    setMounted(true);
    refreshAuthData();
  }, []);

  const handleLogout = () => {
    clearUserData();
    refreshAuthData();
  };

  // マウント前は何も表示しない（Hydrationエラーを防ぐ）
  if (!mounted) {
    return null;
  }

  return (
    <Box p={8} bg="#FFF2F9" minH="100vh">
      <VStack spacing={6}>
        <Text fontSize="2xl" fontWeight="bold">
          認証状態テスト
        </Text>

        <VStack spacing={4} bg="white" p={6} borderRadius="lg" shadow="md">
          <Text fontSize="lg" fontWeight="bold">
            現在の認証情報
          </Text>
          <Text>トークン: {authData.token || "なし"}</Text>
          <Text>ロール: {authData.role || "なし"}</Text>
          <Text>認証済み: {isAuthenticated() ? "はい" : "いいえ"}</Text>
          <Text>組織ユーザー: {isOrganization() ? "はい" : "いいえ"}</Text>
          <Text>一般ユーザー: {isUser() ? "はい" : "いいえ"}</Text>
        </VStack>

        <VStack spacing={4}>
          <Button onClick={refreshAuthData} bg="#6A99FF" color="white">
            認証情報を更新
          </Button>
          <Button onClick={handleLogout} bg="#FF6B6B" color="white">
            ログアウト（認証情報をクリア）
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
