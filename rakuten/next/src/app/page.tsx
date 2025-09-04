"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Grid,
  GridItem,
  Container,
  Input,
  Loading,
  Image,
} from "@yamada-ui/react";
import Link from "next/link";
import { isAuthenticated } from "../utils/auth";
import ImageFrame from "../components/Imageframe";
import { LOCAL_DEFAULT_IMAGE_URL } from "../constnts.ts";

// ボランティア一覧取得API関数
const fetchVolunteerList = async () => {
  try {
    console.log("=== ボランティア一覧取得開始 ===");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/borantia-contents`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`ボランティア一覧API エラー: ${response.status}`);
    }

    const data = await response.json();

    console.log("=== ボランティア一覧取得結果 ===");
    console.log("API Response:", data);

    if (data.error) {
      console.error("ボランティア一覧APIエラー:", data.error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("ボランティア一覧取得エラー:", error);
    return [];
  }
};

// 日付フォーマット関数
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  try {
    return dateString.split("T")[0]; // "2025-08-10T00:00:00.000000Z" → "2025-08-10"
  } catch {
    return dateString;
  }
};

export default function HomePage() {
  const [volunteerList, setVolunteerList] = useState<any[]>([]);
  const [filteredVolunteerList, setFilteredVolunteerList] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [lastSearchKeyword, setLastSearchKeyword] = useState(""); // 最後に検索したキーワード
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);

  // マウント時に認証状態をチェック
  useEffect(() => {
    setMounted(true);
    const authStatus = isAuthenticated();
    setUserIsAuthenticated(authStatus);
    console.log("認証状態:", authStatus);
  }, []);

  // ボランティア一覧取得のuseEffect（認証済みの場合のみ実行）
  useEffect(() => {
    if (!mounted || !userIsAuthenticated) {
      setIsLoading(false);
      return;
    }

    const loadVolunteerList = async () => {
      setIsLoading(true);
      const data = await fetchVolunteerList();
      setVolunteerList(data);
      setFilteredVolunteerList(data); // 初期表示では全件表示
      setIsLoading(false);
      console.log("取得したボランティア一覧:", data);
    };

    loadVolunteerList();
  }, [mounted, userIsAuthenticated]);

  // 検索処理
  const handleSearch = () => {
    console.log("検索実行:", searchKeyword);

    // 検索したキーワードを記録
    setLastSearchKeyword(searchKeyword);

    if (!searchKeyword.trim()) {
      // 検索キーワードが空の場合は全件表示
      setFilteredVolunteerList(volunteerList);
    } else {
      // 検索キーワードでフィルタリング
      const filtered = volunteerList.filter((volunteer) => {
        const keyword = searchKeyword.toLowerCase();
        return (
          volunteer.title?.toLowerCase().includes(keyword) ||
          volunteer.location?.toLowerCase().includes(keyword) ||
          volunteer.note?.toLowerCase().includes(keyword)
        );
      });
      setFilteredVolunteerList(filtered);
    }
  };

  // マウント前は何も表示しない（Hydrationエラー対策）
  if (!mounted) {
    return null;
  }

  // ログインしていない場合のレイアウト
  if (!userIsAuthenticated) {
    return (
      <Box
        minH="100vh"
        bg="#FFF2F9"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={12} textAlign="center">
          <VStack spacing={6}>
            <Image
              src="/logo.png"
              alt="Logo"
              height="250px"
              maxWidth="600px"
              objectFit="contain"
              mx="auto"
            />
            <Text fontSize="2xl" color="gray.600" fontWeight="medium">
              みんなで作る、より良い社会
            </Text>
          </VStack>

          <VStack spacing={6} align="center">
            <Text
              fontSize="lg"
              color="gray.700"
              maxW="600px"
              lineHeight="relaxed"
              textAlign="center"
            >
              ボランティア活動を通じて、地域社会に貢献しませんか？
              <br />
              様々な活動が皆様の参加をお待ちしています。
            </Text>

            <VStack spacing={6} align="center">
              <Link href="/login">
                <Button
                  bg="#6A99FF"
                  color="white"
                  size="xl"
                  px={12}
                  py={6}
                  fontSize="xl"
                  fontWeight="bold"
                  _hover={{
                    bg: "#5A89EF",
                    transform: "translateY(-2px)",
                  }}
                  boxShadow="xl"
                  borderRadius="2xl"
                >
                  ログインして始める
                </Button>
              </Link>

              <HStack spacing={4} justify="center">
                <Link href="/signup/group">
                  <Button
                    bg="white"
                    color="#6A99FF"
                    border="2px solid #6A99FF"
                    size="lg"
                    px={8}
                    py={5}
                    fontSize="lg"
                    fontWeight="bold"
                    _hover={{
                      bg: "#F0F8FF",
                      transform: "translateY(-2px)",
                    }}
                    boxShadow="xl"
                    borderRadius="2xl"
                  >
                    募集団体として新規登録
                  </Button>
                </Link>

                <Link href="/signup/user">
                  <Button
                    bg="white"
                    color="#6A99FF"
                    border="2px solid #6A99FF"
                    size="lg"
                    px={8}
                    py={5}
                    fontSize="lg"
                    fontWeight="bold"
                    _hover={{
                      bg: "#F0F8FF",
                      transform: "translateY(-2px)",
                    }}
                    boxShadow="xl"
                    borderRadius="2xl"
                  >
                    参加者として新規登録
                  </Button>
                </Link>
              </HStack>
            </VStack>
          </VStack>
        </VStack>
      </Box>
    );
  }

  // ログイン済みの場合のレイアウト（従来のボランティア一覧表示）
  return (
    <Box
      minH="100vh"
      bg="#FFF2F9"
      py={8}
      display="flex"
      justifyContent="center"
    >
      <Container maxW="6xl" px={4} w="100%">
        <VStack spacing={8} align="stretch" w="100%">
          {/* ページタイトル */}
          <Text
            fontSize="3xl"
            fontWeight="bold"
            color="black"
            textAlign="center"
            mt={4}
          >
            ボランティア募集一覧
          </Text>

          {/* 検索バー */}
          <Box w="100%" display="flex" justifyContent="center">
            <HStack spacing={4} maxW="2xl" w="100%">
              <Input
                placeholder="タイトル、場所、仕事内容で検索..."
                bg="white"
                borderColor="gray.300"
                borderRadius="lg"
                boxShadow="md"
                _focus={{
                  borderColor: "#FFDDEE",
                  boxShadow: "0 0 0 2px #FFDDEE",
                }}
                size="lg"
                flex={1}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <Button
                bg="#6A99FF"
                color="white"
                size="lg"
                px={8}
                _hover={{
                  bg: "#5A89EF",
                  transform: "translateY(-2px)",
                }}
                boxShadow="lg"
                borderRadius="lg"
                fontSize="md"
                fontWeight="bold"
                onClick={handleSearch}
              >
                検索
              </Button>
            </HStack>
          </Box>

          {/* ボランティアカード一覧 */}
          {isLoading ? (
            <Box
              w="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
              minH="400px"
              textAlign="center"
            >
              <VStack spacing={6} align="center">
                <Loading variant="oval" color="#6A99FF" fontSize="6xl" />
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="gray.600"
                  textAlign="center"
                >
                  ボランティア情報を読み込み中...
                </Text>
              </VStack>
            </Box>
          ) : filteredVolunteerList.length > 0 ? (
            <VStack spacing={6} w="100%">
              <Grid
                templateColumns="repeat(2, 1fr)"
                gap={6}
                w="100%"
                maxW="5xl"
                mx="auto"
              >
                {filteredVolunteerList.map((volunteer) => (
                  <GridItem key={volunteer.id}>
                    <Card
                      bg="white"
                      boxShadow="lg"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="gray.200"
                      h="100%"
                      _hover={{
                        transform: "translateY(-4px)",
                        boxShadow: "xl",
                      }}
                      transition="all 0.3s ease"
                    >
                      <CardBody p={0}>
                        {/* 画像エリア */}

                        <Box
                          w="100%"
                          h="200px"
                          overflow="hidden"
                          borderTopRadius="xl"
                          position="relative"
                          bg="gray.200"
                        >
                          {volunteer.image_url ? (
                            <Image
                              src={`http://localhost:8080/storage/app/public/${volunteer.image_url}`}
                              alt="volunteer image"
                              w="100%"
                              h="100%"
                              objectFit="cover"
                            />
                          ) : (
                            <Box
                              w="100%"
                              h="100%"
                              bg="gray.300"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Text fontSize="lg" color="gray.500">
                                画像なし
                              </Text>
                            </Box>
                          )}
                        </Box>

                        {/* コンテンツエリア */}
                        <VStack spacing={4} p={6} align="start" h="250px">
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="black"
                            lineHeight="short"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {volunteer.title}
                          </Text>

                          <VStack spacing={2} align="start" flex={1}>
                            <HStack spacing={2}>
                              <Box
                                w="3"
                                h="3"
                                bg="#FFDDEE"
                                borderRadius="full"
                              />
                              <Text fontSize="sm" color="gray.700">
                                <Text as="span" fontWeight="semibold">
                                  場所：
                                </Text>
                                {volunteer.location}
                              </Text>
                            </HStack>
                            <HStack spacing={2}>
                              <Box
                                w="3"
                                h="3"
                                bg="#FFDDEE"
                                borderRadius="full"
                              />
                              <Text fontSize="sm" color="gray.700">
                                <Text as="span" fontWeight="semibold">
                                  期間：
                                </Text>
                                {formatDate(volunteer.start_date)}〜
                                {formatDate(volunteer.end_date)}
                              </Text>
                            </HStack>
                          </VStack>

                          {/* 詳しく見るボタン */}
                          <Box
                            w="100%"
                            display="flex"
                            justifyContent="flex-end"
                          >
                            <Link href={`/volunteer/${volunteer.id}`}>
                              <Button
                                bg="#FFDDEE"
                                color="black"
                                size="sm"
                                px={6}
                                _hover={{
                                  bg: "#FF9999",
                                  transform: "translateY(-1px)",
                                }}
                                boxShadow="md"
                                borderRadius="lg"
                                fontSize="sm"
                                fontWeight="semibold"
                              >
                                詳しく見る →
                              </Button>
                            </Link>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>
                  </GridItem>
                ))}
              </Grid>
            </VStack>
          ) : lastSearchKeyword ? (
            <Box
              w="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
              minH="400px"
            >
              <VStack spacing={4}>
                <Text fontSize="6xl">🔍</Text>
                <Text fontSize="xl" fontWeight="bold" color="gray.600">
                  「{lastSearchKeyword}
                  」に一致するボランティアが見つかりませんでした
                </Text>
                <Text fontSize="md" color="gray.500">
                  別のキーワードで検索してみてください
                </Text>
              </VStack>
            </Box>
          ) : (
            <Box
              w="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
              minH="400px"
            >
              <VStack spacing={4}>
                <Text fontSize="6xl">�</Text>
                <Text fontSize="xl" fontWeight="bold" color="gray.600">
                  ボランティア一覧
                </Text>
                <Text fontSize="md" color="gray.500">
                  検索してボランティアを探してみましょう
                </Text>
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
