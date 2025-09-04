"use client";

import React, { useState, useEffect } from "react";
import { Box, HStack, Text, Button, Container, Image } from "@yamada-ui/react";
import Link from "next/link";
import {
  getUserData,
  clearUserData,
  isAuthenticated,
  isOrganization,
  isUser,
} from "../utils/auth";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [authData, setAuthData] = useState<{
    token: string | null;
    role: string | null;
  }>({ token: null, role: null });

  // 認証状態を更新する関数
  const updateAuthData = () => {
    const data = getUserData();
    setAuthData(data);
  };

  useEffect(() => {
    setMounted(true);
    updateAuthData();

    // storage イベントをリッスンして、他のタブでの認証状態変更を検出
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === 'user_role') {
        updateAuthData();
      }
    };

    // カスタムイベントをリッスンして、同じタブでの認証状態変更を検出
    const handleAuthChange = () => {
      updateAuthData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    clearUserData();
    setAuthData({ token: null, role: null });
    // 認証状態変更イベントを発火
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    // ログアウト後はホームページにリダイレクト
    window.location.href = "/";
  };

  // マウント前は基本的なヘッダーのみ表示
  if (!mounted) {
    return (
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        boxShadow="sm"
        position="sticky"
        top={0}
        zIndex={1000}
        height="100px"
        display="flex"
        alignItems="center"
      >
        <Container px={10} w="100%">
          <HStack justify="space-between" align="center" w="100%" h="100%">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Logo"
                height="60px"
                cursor="pointer"
                _hover={{ opacity: 0.8 }}
                transition="opacity 0.2s ease"
              />
            </Link>
          </HStack>
        </Container>
      </Box>
    );
  }

  const isLoggedIn = authData.token !== null;
  const isOrgUser = authData.role === 'organization';
  const isRegularUser = authData.role === 'user';
  
  return (
    <Box
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={1000}
      height="100px"
      display="flex"
      alignItems="center"
    >
      <Container px={10} w="100%">
        <HStack justify="space-between" align="center" w="100%" h="100%">
          {/* ロゴ・タイトル */}
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              height="60px"
              cursor="pointer"
              _hover={{ opacity: 0.8 }}
              transition="opacity 0.2s ease"
            />
          </Link>

          {/* ナビゲーション */}
          <HStack spacing={4}>
            {!isLoggedIn && (
              // ログイン前：ログインボタンのみ
              <Link href="/login">
                <Button
                  bg="#FFDDEE"
                  color="black"
                  size="md"
                  px={6}
                  _hover={{
                    bg: "#FF9999",
                    transform: "translateY(-1px)",
                  }}
                  boxShadow="md"
                  borderRadius="lg"
                  fontSize="md"
                  fontWeight="bold"
                  flexShrink={0}
                >
                  ログイン
                </Button>
              </Link>
            )}

            {isLoggedIn && isOrgUser && (
              // 団体ユーザー：マイページ、募集登録、ログアウト
              <>
                <Link href="/mypage">
                  <Button
                    bg="#6A99FF"
                    color="white"
                    size="md"
                    px={6}
                    _hover={{
                      bg: "#5A89EF",
                      transform: "translateY(-1px)",
                    }}
                    boxShadow="md"
                    borderRadius="lg"
                    fontSize="md"
                    fontWeight="bold"
                    flexShrink={0}
                  >
                    マイページ
                  </Button>
                </Link>

                <Link href="/recruit">
                  <Button
                    bg="#4CAF50"
                    color="white"
                    size="md"
                    px={6}
                    _hover={{
                      bg: "#45A049",
                      transform: "translateY(-1px)",
                    }}
                    boxShadow="md"
                    borderRadius="lg"
                    fontSize="md"
                    fontWeight="bold"
                    flexShrink={0}
                  >
                    募集登録
                  </Button>
                </Link>

                <Button
                  bg="#FF6B6B"
                  color="white"
                  size="md"
                  px={6}
                  onClick={handleLogout}
                  _hover={{
                    bg: "#FF5252",
                    transform: "translateY(-1px)",
                  }}
                  boxShadow="md"
                  borderRadius="lg"
                  fontSize="md"
                  fontWeight="bold"
                  flexShrink={0}
                >
                  ログアウト
                </Button>
              </>
            )}

            {isLoggedIn && isRegularUser && (
              // 一般ユーザー：マイページ、ログアウト
              <>
                <Link href="/mypage">
                  <Button
                    bg="#6A99FF"
                    color="white"
                    size="md"
                    px={6}
                    _hover={{
                      bg: "#5A89EF",
                      transform: "translateY(-1px)",
                    }}
                    boxShadow="md"
                    borderRadius="lg"
                    fontSize="md"
                    fontWeight="bold"
                    flexShrink={0}
                  >
                    マイページ
                  </Button>
                </Link>

                <Button
                  bg="#FF6B6B"
                  color="white"
                  size="md"
                  px={6}
                  onClick={handleLogout}
                  _hover={{
                    bg: "#FF5252",
                    transform: "translateY(-1px)",
                  }}
                  boxShadow="md"
                  borderRadius="lg"
                  fontSize="md"
                  fontWeight="bold"
                  flexShrink={0}
                >
                  ログアウト
                </Button>
              </>
            )}
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}
