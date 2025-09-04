"use client";

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Link from "next/link";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Badge,
  Avatar,
  SimpleGrid,
  Container,
  Spacer,
  Center,
} from "@yamada-ui/react";
import { useParams } from "next/navigation";
import {
  getToken,
  getRole,
  getUserData,
  clearUserData,
  isAuthenticated,
  isOrganization,
  isUser,
} from "../../utils/auth";
import mockData from "./mock.json";

const MyPage = () => {
  const {
    mockUsers,
    mockVolunteerContents,
    mockApplications,
    mockAllVolunteers,
  } = mockData;
  const params = useParams();
  const user_id = 3;
  // const currentUser = users.find((user) => user.id === user_id);
  // const userType = currentUser?.role;
  const [profile, setProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [applications, setApplications] = useState({
    waiting: [],
    approved: [],
  });
  const [volunteerContents, setVolunteerContents] = useState([]);
  const [allVolunteerList, setAllVolunteerList] = useState([]);
  const fetchUser = async (token) => {
    try {
      console.log("ユーザー取得開始");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`ユーザー取得エラー：${response.status}`);
      }

      const data = await response.json();

      console.log("ユーザー情報");
      console.log("API Response:", data);

      if (data.error) {
        console.error("ユーザー取得エラー：", data.error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("ユーザー取得エラー：", error);
      return [];
    }
  };

  const fetchApplications = async (token) => {
    try {
      console.log("申込情報取得開始");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/my-applications`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`申込情報取得エラー：${response.status}`);
      }

      const data = await response.json();

      console.log("申込情報");
      console.log("API Response:", data);

      return data || [];
    } catch (error) {
      console.error("申込情報取得エラー：", error);
      return [];
    }
  };

  const fetchVolunteerContents = async (token) => {
    try {
      console.log("ボランティアコンテンツ取得開始");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/organizations/my-borantia-contents`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`ボランティアコンテンツ取得エラー：${response.status}`);
      }

      const data = await response.json();

      console.log("ボランティアコンテンツ");
      console.log("API Response:", data);

      return data || [];
    } catch (error) {
      console.error("ボランティアコンテンツ取得エラー：", error);
      return [];
    }
  };

  const fetchAllVolunteerList = async () => {
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

  const getApprovedVolunteer = async () => {};

  const handleApproveApplication = async (entryId: number, jobId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/apply-entries/${entryId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`承認処理エラー: ${response.status}`);
      }

      const data = await response.json();

      // 成功時に画面を更新
      const updatedVolunteerContents = volunteerContents.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            apply_entries: job.apply_entries.map((entry) => {
              if (entry.id === entryId) {
                return { ...entry, is_approved: true };
              }
              return entry;
            }),
          };
        }
        return job;
      });
      setVolunteerContents(updatedVolunteerContents);

      // APIからのメッセージをアラートで表示
      alert(data.message || "承認処理が成功しました");

      // ページをリロード
      window.location.reload();
    } catch (error) {
      console.error("承認処理エラー:", error);
      alert("承認処理に失敗しました。もう一度お試しください。");
    }
  };

  const handleRejectApplication = async (entryId: number, jobId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/apply-entries/${entryId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`拒否処理エラー: ${response.status}`);
      }

      const data = await response.json();

      // 成功時に承認待ちリストから削除
      const updatedVolunteerContents = volunteerContents.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            apply_entries: job.apply_entries.filter(
              (entry) => entry.id !== entryId
            ),
          };
        }
        return job;
      });
      setVolunteerContents(updatedVolunteerContents);

      // APIからのメッセージをアラートで表示
      alert(data.message || "拒否処理が成功しました");

      // ページをリロード
      window.location.reload();
    } catch (error) {
      console.error("拒否処理エラー:", error);
      alert("拒否処理に失敗しました。もう一度お試しください。");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const currentToken = getToken();
      const currentRole = getRole();

      setToken(currentToken);
      setRole(currentRole);

      console.log("取得したトークンとロール:", currentToken, currentRole);

      if (currentToken) {
        try {
          const fetchedUser = await fetchUser(currentToken);
          setProfile(fetchedUser);
          console.log("取得したプロファイル:", profile);
          if (currentRole === "user") {
            const fetchedApplications = await fetchApplications(currentToken);
            // const fetchedApplications = mockApplications; // モックデータを使用
            setApplications(fetchedApplications);
            console.log("取得した申込情報:", fetchedApplications);
          } else if (currentRole === "organization") {
            const fetchedVolunteerContents = await fetchVolunteerContents(
              currentToken
            );
            // const fetchedVolunteerContents = mockVolunteerContents; // モックデータを使用
            setVolunteerContents(fetchedVolunteerContents);
            console.log(
              "取得したボランティアコンテンツ:",
              fetchedVolunteerContents
            );
            // const fetchedAllVolunteerList = await fetchAllVolunteerList();
            // const fetchedAllVolunteerList = mockAllVolunteers; // モックデータを使用
            // setAllVolunteerList(fetchedAllVolunteerList);
          }
        } catch (error) {
          console.error("プロファイル取得エラー:", error);
        }
      }
    };

    fetchData();
  }, []);

  return (
    <Box bg="#FFF2F9" minH="100vh">
      <Center minH="100vh">
        <Container maxW="6xl" py={8}>
          <Box mb={8}>
            <HStack justify="space-between" align="center">
              <Heading size="xl">マイページ</Heading>
            </HStack>
          </Box>
          <VStack spacing={8} align="stretch">
            <Center>
              <Card
                maxW="2xl"
                w="full"
                borderColor="gray.200"
                borderWidth="1px"
                bg="white"
                shadow="md"
              >
                {role === "organization" ? (
                  <>
                    <CardHeader>
                      <HStack justify="space-between" align="center">
                        <HStack>
                          <Avatar name={profile?.name || "Unknown"} size="md" />
                          <Heading size="lg">アカウント情報</Heading>
                        </HStack>
                        <Link href={`/mypage/edit`}>
                          <Button size="sm" variant="ghost">
                            ✏️ 修正する
                          </Button>
                        </Link>
                      </HStack>
                    </CardHeader>

                    <CardBody>
                      {profile ? (
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Box>
                            <Text fontWeight="bold" mb={1}>
                              団体名
                            </Text>
                            <Text>{profile.name}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold" mb={1}>
                              所在地
                            </Text>
                            <Text>{profile.address}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold" mb={1}>
                              メールアドレス
                            </Text>
                            <Text>{profile.email}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold" mb={1}>
                              電話番号
                            </Text>
                            <Text>{profile.phone}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold" mb={1}>
                              備考
                            </Text>
                            <Text>{profile.note}</Text>
                          </Box>
                        </SimpleGrid>
                      ) : (
                        <Text>プロファイル情報を読み込み中...</Text>
                      )}
                    </CardBody>
                  </>
                ) : (
                  <>
                    <CardHeader>
                      <HStack justify="space-between" align="center">
                        <HStack>
                          <Avatar name={profile?.name || "Unknown"} size="md" />
                          <Heading size="lg">アカウント情報</Heading>
                        </HStack>
                        <Link href={`/mypage/edit`}>
                          <Button size="sm" variant="ghost">
                            ✏️ 修正する
                          </Button>
                        </Link>
                      </HStack>
                    </CardHeader>

                    <CardBody>
                      {profile ? (
                        <>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <Box>
                              <Text fontWeight="bold" mb={1}>
                                名前
                              </Text>
                              <Text>{profile.name}</Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold" mb={1}>
                                住所
                              </Text>
                              <Text>{profile.address}</Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold" mb={1}>
                                生年月日
                              </Text>
                              <Text>{profile.birthday}</Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold" mb={1}>
                                性別
                              </Text>
                              <Text>{profile.gender}</Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold" mb={1}>
                                車の有無
                              </Text>
                              <Text>{profile.is_has_car}</Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold" mb={1}>
                                メールアドレス
                              </Text>
                              <Text>{profile.email}</Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold" mb={1}>
                                電話番号
                              </Text>
                              <Text>{profile.phone}</Text>
                            </Box>
                          </SimpleGrid>
                          <Box mt={4}>
                            <Text fontWeight="bold" mb={1}>
                              一言コメント
                            </Text>
                            <Text>{profile.note}</Text>
                          </Box>
                        </>
                      ) : (
                        <Text>プロファイル情報を読み込み中...</Text>
                      )}
                    </CardBody>
                  </>
                )}
              </Card>
            </Center>

            {role === "organization" ? (
              // 募集側の表示
              <>
                <Center>
                  <Link href="/recruit">
                    <Button
                      bg="#FF6B6B"
                      color="white"
                      size="lg"
                      px={8}
                      _hover={{ bg: "#FF5252" }}
                      shadow="md"
                    >
                      👥 ボランティアを募集する
                    </Button>
                  </Link>
                </Center>

                <Box maxW="6xl">
                  <Heading size="lg" mb={4}>
                    募集中のボランティア一覧
                  </Heading>
                  <Box display="flex" flexWrap="wrap" gap={4}>
                    {volunteerContents.map((job) => (
                      <Card
                        key={job.id}
                        flex="1"
                        minW="250px"
                        maxW="300px"
                        borderColor="gray.200"
                        borderWidth="1px"
                        bg="white"
                        shadow="sm"
                      >
                        <CardBody>
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <Heading size="md">{job.title}</Heading>
                              <Badge colorScheme="green">{job.status}</Badge>
                            </HStack>
                            <HStack>
                              <Text fontSize="sm">📍 場所：{job.location}</Text>
                            </HStack>
                            <HStack>
                              <Text fontSize="sm">
                                📅 期間：
                                {new Date(job.start_date).toLocaleDateString(
                                  "ja-JP"
                                )}
                                ～
                                {new Date(job.end_date).toLocaleDateString(
                                  "ja-JP"
                                )}
                              </Text>
                            </HStack>
                            <Link href={`/volunteer/${job.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.600"
                                _hover={{ bg: "gray.50" }}
                              >
                                詳しく見る →
                              </Button>
                            </Link>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </Box>
                </Box>

                <Box maxW="6xl">
                  <Heading size="lg" mb={4}>
                    承認待ちリスト
                  </Heading>
                  <Box display="flex" flexWrap="wrap" gap={4}>
                    {volunteerContents.flatMap((job) =>
                      job.apply_entries
                        .filter((entry) => entry.is_approved === false)
                        .map((entry) => (
                          <Card
                            key={`${job.id}-${entry.user.id}`}
                            flex="1"
                            minW="250px"
                            maxW="300px"
                            borderColor="gray.200"
                            borderWidth="1px"
                            bg="white"
                            shadow="sm"
                          >
                            <CardBody>
                              <VStack align="stretch" spacing={3}>
                                <HStack justify="space-between" align="start">
                                  <VStack align="start" spacing={1}>
                                    <Heading size="md">
                                      {entry.user.name}
                                    </Heading>
                                    <Text fontSize="sm" color="gray.600">
                                      応募先: {job.title}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                      生年月日: {entry.user.birthday}
                                    </Text>
                                  </VStack>
                                  {/* <Button
                                    size="sm"
                                    bg="#6A99FF"
                                    color="white"
                                    _hover={{ bg: "#5A89FF" }}
                                  >
                                    💬 チャット
                                  </Button> */}
                                </HStack>
                                <Text fontSize="sm">
                                  <strong>車の有無:</strong>{" "}
                                  {entry.user.is_has_car ? "あり" : "なし"}
                                </Text>
                                <Text fontSize="sm">
                                  <strong>性別:</strong>{" "}
                                  {entry.user.gender === "male"
                                    ? "男性"
                                    : "女性"}
                                </Text>
                                <Text fontSize="sm">
                                  <strong>メール:</strong> {entry.user.email}
                                </Text>
                                <VStack spacing={2}>
                                  <HStack spacing={2} width="100%">
                                    <Button
                                      size="sm"
                                      bg="#FF6B6B"
                                      color="white"
                                      flex={1}
                                      _hover={{ bg: "#FF5252" }}
                                      onClick={() =>
                                        handleApproveApplication(
                                          entry.id,
                                          job.id
                                        )
                                      }
                                    >
                                      承認
                                    </Button>
                                    <Button
                                      size="sm"
                                      bg="#FF8080"
                                      color="white"
                                      flex={1}
                                      _hover={{ bg: "#FF6060" }}
                                      onClick={() =>
                                        handleRejectApplication(
                                          entry.id,
                                          job.id
                                        )
                                      }
                                    >
                                      拒否
                                    </Button>
                                  </HStack>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    borderColor="gray.300"
                                    color="gray.600"
                                    width="100%"
                                    _hover={{ bg: "gray.50" }}
                                    onClick={() => {
                                      setSelectedApplicant({ entry, job });
                                      setIsModalOpen(true);
                                    }}
                                  >
                                    詳しく見る →
                                  </Button>
                                </VStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))
                    )}
                  </Box>
                </Box>
              </>
            ) : (
              // 参加者側の表示
              <>
                <Box maxW="6xl">
                  <Heading size="lg" mb={4}>
                    参加予定のボランティア一覧
                  </Heading>
                  <Box display="flex" flexWrap="wrap" gap={4}>
                    {applications?.waiting?.map((volunteer) => (
                      <Card
                        key={volunteer.id}
                        flex="1"
                        minW="250px"
                        maxW="300px"
                        borderColor="gray.200"
                        borderWidth="1px"
                        bg="white"
                        shadow="sm"
                      >
                        <CardBody>
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <Heading size="md">
                                {volunteer.borantia_content.title}
                              </Heading>
                            </HStack>
                            <HStack>
                              <Text fontSize="sm">
                                📍 場所：{volunteer.borantia_content.location}
                              </Text>
                            </HStack>
                            <Text fontSize="sm">
                              主催：
                              {volunteer.borantia_content.organization.name}
                            </Text>
                            <Link
                              href={`/volunteer/${volunteer.borantia_content.id}`}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.600"
                                _hover={{ bg: "gray.50" }}
                              >
                                詳しく見る →
                              </Button>
                            </Link>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </Box>
                </Box>

                <Box maxW="6xl">
                  <Heading size="lg" mb={4}>
                    参加したボランティア一覧
                  </Heading>
                  <Box display="flex" flexWrap="wrap" gap={4}>
                    {applications?.approved?.map((volunteer) => (
                      <Card
                        key={volunteer.id}
                        flex="1"
                        minW="250px"
                        maxW="300px"
                        borderColor="gray.200"
                        borderWidth="1px"
                        bg="white"
                        shadow="sm"
                      >
                        <CardBody>
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <Heading size="md">
                                {volunteer.borantia_content.title}
                              </Heading>
                            </HStack>
                            <HStack>
                              <Text fontSize="sm">
                                📍 場所：{volunteer.borantia_content.location}
                              </Text>
                            </HStack>
                            <Text fontSize="sm">
                              主催：
                              {volunteer.borantia_content.organization.name}
                            </Text>
                            <Link
                              href={`/volunteer/${volunteer.borantia_content.id}`}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.600"
                                _hover={{ bg: "gray.50" }}
                              >
                                詳しく見る →
                              </Button>
                            </Link>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </Box>
                </Box>
              </>
            )}
          </VStack>
        </Container>
      </Center>

      {/* 申込者詳細モーダル */}
      {isModalOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          zIndex="1000"
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={() => setIsModalOpen(false)}
        >
          <Card
            maxW="2xl"
            w="90%"
            maxH="90vh"
            bg="white"
            shadow="xl"
            onClick={(e) => e.stopPropagation()}
            overflow="hidden"
          >
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="lg">申込者詳細情報</Heading>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕
                </Button>
              </HStack>
            </CardHeader>
            <CardBody overflowY="auto">
              {selectedApplicant && (
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      応募先ボランティア詳細
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      <Box>
                        <Text fontWeight="semibold">活動名</Text>
                        <Text>{selectedApplicant.job.title}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="semibold">場所</Text>
                        <Text>{selectedApplicant.job.location}</Text>
                      </Box>
                    </SimpleGrid>
                    {selectedApplicant.job.description && (
                      <Box mt={3}>
                        <Text fontWeight="semibold">仕事内容</Text>
                        <Text>{selectedApplicant.job.description}</Text>
                      </Box>
                    )}
                  </Box>
                  <Divider />
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      申込者情報
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box>
                        <Text fontWeight="semibold">名前</Text>
                        <Text>{selectedApplicant.entry.user.name}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="semibold">生年月日</Text>
                        <Text>{selectedApplicant.entry.user.birthday}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="semibold">性別</Text>
                        <Text>
                          {selectedApplicant.entry.user.gender === "male"
                            ? "男性"
                            : "女性"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="semibold">車の有無</Text>
                        <Text>
                          {selectedApplicant.entry.user.is_has_car
                            ? "あり"
                            : "なし"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="semibold">メールアドレス</Text>
                        <Text>{selectedApplicant.entry.user.email}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="semibold">電話番号</Text>
                        <Text>{selectedApplicant.entry.user.phone}</Text>
                      </Box>
                    </SimpleGrid>
                    {selectedApplicant.entry.user.address && (
                      <Box mt={4}>
                        <Text fontWeight="semibold">住所</Text>
                        <Text>{selectedApplicant.entry.user.address}</Text>
                      </Box>
                    )}
                    {selectedApplicant.entry.user.note && (
                      <Box mt={4}>
                        <Text fontWeight="semibold">一言コメント</Text>
                        <Text>{selectedApplicant.entry.user.note}</Text>
                      </Box>
                    )}
                  </Box>
                  <Divider />
                  <HStack spacing={3} justify="flex-end">
                    <Button
                      bg="#FF6B6B"
                      color="white"
                      _hover={{ bg: "#FF5252" }}
                      onClick={() => {
                        if (selectedApplicant) {
                          handleApproveApplication(
                            selectedApplicant.entry.id,
                            selectedApplicant.job.id
                          );
                          setIsModalOpen(false);
                        }
                      }}
                    >
                      承認
                    </Button>
                    <Button
                      bg="#FF8080"
                      color="white"
                      _hover={{ bg: "#FF6060" }}
                      onClick={() => {
                        if (selectedApplicant) {
                          handleRejectApplication(
                            selectedApplicant.entry.id,
                            selectedApplicant.job.id
                          );
                          setIsModalOpen(false);
                        }
                      }}
                    >
                      拒否
                    </Button>
                    {/* <Button
                      bg="#6A99FF"
                      color="white"
                      _hover={{ bg: "#5A89FF" }}
                    >
                      💬 チャット
                    </Button> */}
                    <Button
                      variant="ghost"
                      onClick={() => setIsModalOpen(false)}
                    >
                      閉じる
                    </Button>
                  </HStack>
                </VStack>
              )}
            </CardBody>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default MyPage;
