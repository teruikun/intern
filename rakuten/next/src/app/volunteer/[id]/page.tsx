"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Button,
  Card,
  CardBody,
  Divider,
  Grid,
  GridItem,
  CheckIcon,
  Container,
  Checkbox,
  Loading,
} from "@yamada-ui/react";
import volunteerDataJson from "../mockdata/volunteerData.json";
import Link from "next/link";
import { getToken, isOrganization, isUser } from "../../../utils/auth";
import { useRouter } from "next/navigation";

export const fetchMe = async () => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me/test`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data; // data.user に id, role などが入っている
};

export const deleteVolunteerContent = async (
  contentId: number
): Promise<{ status: "success" | "error"; message: string }> => {
  const token = getToken();
  if (!token) {
    return {
      status: "error",
      message: "ログイン情報が見つかりません。再度ログインしてください。",
    };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/borantia-contents/${contentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "削除に失敗しました");
    }

    return { status: "success", message: data.message };
  } catch (error: any) {
    console.error("削除失敗:", error);
    return {
      status: "error",
      message: error.message || "削除中にエラーが発生しました",
    };
  }
};

export const applyToVolunteer = async (
  borantiaContentId: number
): Promise<{ status: "success" | "error"; message: string }> => {
  const token = getToken();
  if (!token) {
    return {
      status: "error",
      message: "ログイン情報が見つかりません。再度ログインしてください。",
    };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/apply-entries`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          borantia_content_id: borantiaContentId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "応募に失敗しました");
    }

    return { status: "success", message: data.message };
  } catch (error: any) {
    console.error("応募失敗:", error);
    return {
      status: "error",
      message: error.message || "応募処理中にエラーが発生しました",
    };
  }
};

export const cancelApplyEntry = async (
  entryId: number,
  borantiaContentId: number
): Promise<{ status: "success" | "error"; message: string }> => {
  const token = getToken();
  if (!token) {
    return {
      status: "error",
      message: "ログイン情報が見つかりません。再度ログインしてください。",
    };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/apply-entries/${entryId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          borantia_content_id: borantiaContentId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "応募キャンセルに失敗しました");
    }

    return { status: "success", message: data.message };
  } catch (error: any) {
    console.error("キャンセル失敗:", error);
    return {
      status: "error",
      message: error.message || "応募キャンセル中にエラーが発生しました",
    };
  }
};

// 参加者一覧取得API関数
export const fetchParticipants = async (
  contentId: number
): Promise<{ participants: any[]; error?: string }> => {
  const token = getToken();
  if (!token) {
    return { participants: [], error: "ログイン情報が見つかりません" };
  }

  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
      }/api/organizations/my-borantia-contents`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`参加者取得API エラー: ${response.status}`);
    }

    const data = await response.json();

    console.log("=== 参加者取得API 生データ ===");
    console.log("APIから取得したdata:", JSON.stringify(data, null, 2));

    // データが配列として直接返される場合と、data.dataとして返される場合の両方に対応
    const contentsList = Array.isArray(data) ? data : data.data || [];

    console.log("=== コンテンツリスト ===");
    console.log("contentsList:", JSON.stringify(contentsList, null, 2));

    // 指定されたコンテンツIDのデータを検索
    const content = contentsList.find((item: any) => item.id === contentId);

    console.log("=== コンテンツ検索結果 ===");
    console.log("contentId:", contentId);
    console.log("見つかったcontent:", JSON.stringify(content, null, 2));

    if (!content || !content.apply_entries) {
      console.log("contentまたはapply_entriesが見つかりません");
      return { participants: [] };
    }

    console.log("=== apply_entries データ ===");
    console.log(
      "apply_entries:",
      JSON.stringify(content.apply_entries, null, 2)
    );

    // 承認済みの参加者のみをフィルタリング
    const approvedParticipants = content.apply_entries.filter(
      (entry: any) => entry.is_approved === true
    );

    console.log("=== 承認済み参加者 ===");
    console.log(
      "approvedParticipants:",
      JSON.stringify(approvedParticipants, null, 2)
    );

    return { participants: approvedParticipants };
  } catch (error: any) {
    console.error("参加者取得エラー:", error);
    return { participants: [], error: "参加者情報の取得に失敗しました" };
  }
};

// ボランティア情報取得API関数
const fetchVolunteerData = async (id: string) => {
  try {
    console.log(`=== ボランティア情報取得開始 ID: ${id} ===`);

    const token = getToken();
    console.log("取得するトークン:", token);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/borantia-contents/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }), // トークンがある場合のみ追加
        },
      }
    );

    if (!response.ok) {
      throw new Error(`ボランティア情報API エラー: ${response.status}`);
    }

    const data = await response.json();

    console.log(`=== ボランティア情報取得結果 ===`);
    console.log("API Response:", data);

    if (data.error) {
      console.error(`ボランティア情報APIエラー:`, data.error);
      return null;
    }

    // APIレスポンスを内部形式に変換
    const volunteerData = {
      id: data.id?.toString() || id,
      title: data.title || "",
      location: data.location || "",
      start_date: data.start_date || "",
      end_date: data.end_date || "",
      capacity: data.recruiting_number || 0,
      description: data.note || "",
      notes: data.phone ? `連絡先: ${data.phone}` : "",
      accommodation: data.accommodation || "",
      car: data.car || "",
      imageUrl: data.image?.file_path || "",
      requiredItems: data.tools?.map((tool: any) => tool.name) || [],
      productLinks:
        data.tools?.map((tool: any) => ({
          name: tool.name,
          url: "#",
        })) || [],
      hotelLinks: [], // APIから取得後に楽天ホテル検索で更新
      organization: data.organization || null,
      apply_entry: data.apply_entry || null,
    };

    return volunteerData;
  } catch (error) {
    console.error(`ボランティア情報取得エラー:`, error);
    return null;
  }
};

// JSONデータを使用したモックデータ
const createMockDataFromJson = () => {
  const mockData: any = {};
  volunteerDataJson.forEach((data) => {
    const hotelLinks = data.location.includes("新宿")
      ? [
          { name: "新宿プリンスホテル", url: "#" },
          { name: "ホテル新宿", url: "#" },
          { name: "新宿ゲストハウス", url: "#" },
          { name: "新宿ビジネスホテル", url: "#" },
          { name: "センチュリーハイアット", url: "#" },
        ]
      : [
          { name: "軽井沢プリンスホテル", url: "#" },
          { name: "星野リゾート", url: "#" },
          { name: "軽井沢ホテル", url: "#" },
          { name: "ペンション軽井沢", url: "#" },
          { name: "軽井沢マリオット", url: "#" },
        ];

    // 画像URLを直接JSONから取得
    const imageUrl = data.image.file_path;

    mockData[data.id.toString()] = {
      id: data.id.toString(),
      title: data.title,
      location: data.location,
      start_date: data.start_date,
      end_date: data.end_date,
      capacity: data.recruiting_number,
      description: data.note,
      notes: `連絡先: ${data.phone}`,
      accommodation: data.accommodation,
      car: data.car,
      imageUrl: imageUrl,
      requiredItems: data.tools.map((tool) => tool.name),
      productLinks: data.tools.map((tool) => ({
        name: tool.name,
        url: "#",
      })),
      hotelLinks,
      organization: data.organization,
    };
  });
  return mockData;
};

// 楽天商品検索API関数
const searchRakutenProducts = async (keyword: string) => {
  try {
    console.log(`=== ${keyword} の検索開始 ===`);

    const response = await fetch(
      `/api/rakuten?keyword=${encodeURIComponent(keyword)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API エラー: ${response.status}`);
    }

    const data = await response.json();

    console.log(`=== ${keyword} の検索結果 ===`);
    console.log("API Response:", data);

    if (data.error) {
      console.error(`${keyword} のAPIエラー:`, data.error);
      return [];
    }

    if (data.products && data.products.length > 0) {
      data.products.forEach((product: any, index: number) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   価格: ${product.price}円`);
        console.log(`   ショップ: ${product.shopName}`);
        console.log(`   URL: ${product.url}`);
        console.log("---");
      });
    } else {
      console.log(`${keyword} の商品が見つかりませんでした`);
    }

    return data.products || [];
  } catch (error) {
    console.error(`${keyword} の検索エラー:`, error);
    return [];
  }
};

// 楽天ホテル検索API関数（座標対応版）
const searchRakutenHotels = async (location: string) => {
  try {
    console.log(`=== ${location} のホテル検索開始 ===`);

    // まず住所を座標に変換
    console.log("住所を座標に変換中...");
    const geocodingResponse = await fetch(
      `/api/geocoding?address=${encodeURIComponent(location)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let latitude = null;
    let longitude = null;

    if (geocodingResponse.ok) {
      const geocodingData = await geocodingResponse.json();
      console.log("=== 座標変換結果 ===");
      console.log("座標変換データ:", geocodingData);

      if (geocodingData.success && geocodingData.coordinates) {
        latitude = geocodingData.coordinates.latitude;
        longitude = geocodingData.coordinates.longitude;
        console.log(`座標取得成功: ${latitude}, ${longitude}`);
        console.log(
          "整形済み住所:",
          geocodingData.coordinates.formatted_address
        );
      } else {
        console.warn("座標変換に失敗しました:", geocodingData.error);
        console.log("座標変換に失敗したため、ホテル検索をスキップします");
        return {
          hotels: [],
          error: "ホテルが見つかりませんでした",
        };
      }
    } else {
      console.error(
        "座標変換APIの呼び出しに失敗しました:",
        geocodingResponse.status
      );
      console.log(
        "座標変換APIへのアクセスに失敗したため、ホテル検索をスキップします"
      );
      return {
        hotels: [],
        error: "ホテルが見つかりませんでした",
      };
    }

    // ホテル検索APIを呼び出し（座標があれば使用、なければ住所のみ）
    const hotelSearchUrl = new URL(
      "/api/rakuten-hotel",
      window.location.origin
    );
    hotelSearchUrl.searchParams.set("location", location);
    if (latitude && longitude) {
      hotelSearchUrl.searchParams.set("latitude", latitude.toString());
      hotelSearchUrl.searchParams.set("longitude", longitude.toString());
    }

    console.log("ホテル検索URL:", hotelSearchUrl.toString());

    const response = await fetch(hotelSearchUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return { hotels: [], error: "ホテルが見つかりませんでした" };
    }

    const data = await response.json();

    console.log(`=== ${location} のホテル検索結果 ===`);
    console.log("Hotel API Response:", data);

    if (data.error) {
      console.error(`${location} のホテルAPIエラー:`, data.error);
      return { hotels: [], error: "ホテルが見つかりませんでした" };
    }

    if (data.searchInfo) {
      console.log("検索条件:", data.searchInfo);
      console.log(
        `座標: ${data.searchInfo.latitude}, ${data.searchInfo.longitude}`
      );
      console.log(`検索半径: ${data.searchInfo.searchRadius}km`);
      console.log(
        `座標が提供されたか: ${data.searchInfo.coordinates_provided}`
      );
    }

    if (data.hotels && data.hotels.length > 0) {
      data.hotels.forEach((hotel: any, index: number) => {
        console.log(`${index + 1}. ${hotel.name}`);
        console.log(`   住所: ${hotel.address}`);
        console.log(`   最低料金: ${hotel.hotelMinCharge}円`);
        console.log(`   評価: ${hotel.reviewAverage} (${hotel.reviewCount}件)`);
        console.log(`   URL: ${hotel.url}`);
        console.log("---");
      });
    } else {
      console.log(`${location} 付近のホテルが見つかりませんでした`);
    }

    return { hotels: data.hotels || [], error: null };
  } catch (error) {
    console.error(`${location} のホテル検索エラー:`, error);
    return { hotels: [], error: "ホテルが見つかりませんでした" };
  }
};

const mockVolunteerData = createMockDataFromJson();

interface VolunteerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VolunteerDetailPage({
  params,
}: VolunteerDetailPageProps) {
  const resolvedParams = React.use(params);
  const router = useRouter();

  // ボランティア情報の状態管理
  const [volunteerData, setVolunteerData] = useState<any>(null);
  const [isLoadingVolunteer, setIsLoadingVolunteer] = useState(true);

  // 楽天商品データの状態管理
  const [rakutenProducts, setRakutenProducts] = useState<Record<string, any[]>>(
    {}
  );
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // 楽天ホテルデータの状態管理
  const [rakutenHotels, setRakutenHotels] = useState<any[]>([]);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [hotelSearchError, setHotelSearchError] = useState<string | null>(null);

  // ユーザーロールの状態管理
  const [isRegularUser, setIsRegularUser] = useState(false);

  //メーセージの状態管理
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [me, setMe] = useState<{ user: any; role: string } | null>(null);

  // 参加者一覧の状態管理
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const userInfo = await fetchMe();
      setMe(userInfo);
    };

    loadUser();
  }, []);

  const canEdit =
    me?.role === "organization" &&
    volunteerData?.organization &&
    me?.user?.id === volunteerData.organization.id;

  // 参加者データ取得のuseEffect
  useEffect(() => {
    const loadParticipants = async () => {
      if (!volunteerData?.id || !canEdit) return;

      setIsLoadingParticipants(true);
      const result = await fetchParticipants(Number(volunteerData.id));

      if (result.error) {
        console.error("参加者取得エラー:", result.error);
      } else {
        setParticipants(result.participants);
        console.log("取得した参加者データ:", result.participants);
      }

      setIsLoadingParticipants(false);
    };

    loadParticipants();
  }, [volunteerData?.id, canEdit]);

  const handleApply = async () => {
    const result = await applyToVolunteer(Number(volunteerData.id));

    if (result.status === "success") {
      // メッセージ表示やデータ更新（最新データを再取得するなど）
      setStatusMessage("応募が完了しました。団体の承認待ちです");

      // 応募後に最新データを再取得して entry_id を確定
      const updated = await fetchVolunteerData(volunteerData.id);
      if (updated) {
        setVolunteerData(updated);
      }

      // 画面上部にスクロール
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      alert(result.message);
    }
  };

  const handleCancel = async () => {
    if (!volunteerData?.apply_entry?.entry_id || !volunteerData?.id) return;

    const result = await cancelApplyEntry(
      volunteerData.apply_entry.entry_id,
      Number(volunteerData.id)
    );

    if (result.status === "success") {
      setStatusMessage(result.message);
      setVolunteerData((prev) => ({
        ...prev,
        apply_entry: null,
      }));

      // 画面上部にスクロール
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      alert(result.message);
    }
  };

  const handleDelete = async () => {
    const result = await deleteVolunteerContent(Number(volunteerData.id));

    if (result.status === "success") {
      alert("イベントを削除しました");
      // ページ遷移やリロードなど
      router.push("/"); // 一覧ページなどへリダイレクト
    } else {
      alert(result.message);
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

  // 車の必要性表示関数
  const getCarRequirement = (carValue: string) => {
    switch (carValue?.toLowerCase()) {
      case "must":
        return "必要";
      case "preferred":
        return "あればうれしい";
      case "none":
      case "不要":
        return "不要";
      default:
        return carValue || "不明";
    }
  };

  // デバッグ用ログ
  console.log("resolvedParams:", resolvedParams);
  console.log("resolvedParams.id:", resolvedParams.id);

  // ボランティア詳細情報取得のuseEffect
  useEffect(() => {
    const loadVolunteerData = async () => {
      setIsLoadingVolunteer(true);

      // まずAPIから取得を試行
      let data = await fetchVolunteerData(resolvedParams.id);

      // APIから取得できない場合はモックデータを使用
      if (!data) {
        console.log(
          "APIからデータを取得できませんでした。モックデータを使用します。"
        );
        data =
          mockVolunteerData[
            resolvedParams.id as keyof typeof mockVolunteerData
          ];
      }

      setVolunteerData(data);
      setIsLoadingVolunteer(false);
      console.log("取得したボランティア詳細:", data);
    };

    loadVolunteerData();
  }, [resolvedParams.id]);

  // 楽天API商品検索のuseEffect
  useEffect(() => {
    const fetchRakutenData = async () => {
      if (volunteerData && volunteerData.requiredItems) {
        setIsLoadingProducts(true);
        setIsLoadingHotels(true);

        console.log("=== 楽天商品検索開始 ===");
        console.log("検索対象アイテム:", volunteerData.requiredItems);

        const productsData: Record<string, any[]> = {};

        // 商品検索
        for (const item of volunteerData.requiredItems) {
          const products = await searchRakutenProducts(item);
          productsData[item] = products;
          // APIリクエスト間隔を空ける（レート制限対策）
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        setRakutenProducts(productsData);
        setIsLoadingProducts(false);

        // ホテル検索（地域名で検索）
        console.log("=== 楽天ホテル検索開始 ===");
        const hotelResult = await searchRakutenHotels(volunteerData.location);
        setRakutenHotels(hotelResult.hotels);
        setHotelSearchError(hotelResult.error);
        setIsLoadingHotels(false);

        console.log("=== 楽天データ検索完了 ===");
        console.log("取得した商品データ:", productsData);
        console.log("取得したホテルデータ:", hotelResult.hotels);
        if (hotelResult.error) {
          console.log("ホテル検索エラー:", hotelResult.error);
        }
      }
    };

    fetchRakutenData();
  }, [volunteerData]);

  useEffect(() => {
    // キャンセル直後など、メッセージをすでに表示している場合は上書きしない
    if (statusMessage) return;

    if (volunteerData?.apply_entry) {
      if (volunteerData.apply_entry.is_approved === true) {
        setStatusMessage("応募が承認されました");
      } else if (volunteerData.apply_entry.is_approved === false) {
        setStatusMessage("応募が完了しました。団体の承認待ちです");
      }
    } else {
      setStatusMessage(null); // ← 明示的に null にしたい場合だけ残す
    }
  }, [volunteerData]);

  // ユーザーロールの判定
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsRegularUser(isUser());
    }
  }, []);

  if (isLoadingVolunteer) {
    return (
      <Box
        minH="100vh"
        bg="#FFF2F9"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={6} align="center">
          <Loading variant="oval" color="#6A99FF" size="xl" />
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
    );
  }

  if (!volunteerData) {
    return (
      <Box
        minH="100vh"
        bg="#FFDDEE"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Card
          bg="white"
          boxShadow="xl"
          borderRadius="xl"
          border="1px solid"
          borderColor="red.200"
        >
          <CardBody p={8}>
            <VStack spacing={4}>
              <Text fontSize="6xl">😕</Text>
              <Text fontSize="2xl" fontWeight="bold" color="red.600">
                ボランティア情報が見つかりません
              </Text>
              <Text fontSize="lg" color="gray.600">
                ID: {resolvedParams.id}
              </Text>
              <Text fontSize="md" color="gray.500">
                利用可能なID: 1, 2
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="#FFF2F9"
      py={8}
      display="flex"
      justifyContent="center"
    >
      <Container maxW="4xl" px={4} w="100%">
        <VStack spacing={8} align="stretch" w="100%">
          {/* 上部：ステータスメッセージはボタンとは分離 */}
          {statusMessage && isUser() && (
            <Box
              bg="pink.100"
              p={4}
              borderRadius="md"
              textAlign="center"
              mt={4}
            >
              <Text fontWeight="bold" color="pink.800">
                {statusMessage}
              </Text>
            </Box>
          )}
          {/* 戻るボタン */}
          <HStack justify="start" w="100%">
            <Button
              onClick={() => router.back()}
              bg="white"
              color="black"
              size="md"
              px={6}
              _hover={{
                bg: "gray.100",
                transform: "translateY(-2px)",
              }}
              boxShadow="lg"
              borderRadius="lg"
              fontSize="md"
              fontWeight="bold"
            >
              ← 戻る
            </Button>
          </HStack>

          {/* メイン画像 */}
          <Box
            w="100%"
            h="400px"
            overflow="hidden"
            borderRadius="xl"
            boxShadow="2xl"
            position="relative"
          >
            {volunteerData.imageUrl ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/app/public/${volunteerData.imageUrl}`}
                alt={volunteerData.title}
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
                <Text fontSize="2xl" color="gray.500">
                  画像なし
                </Text>
              </Box>
            )}
            {/* 画像上のオーバーレイ */}
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bg="linear-gradient(transparent, rgba(0,0,0,0.7))"
              p={6}
            >
              <Text
                fontSize="3xl"
                fontWeight="bold"
                color="white"
                textShadow="2px 2px 4px rgba(0,0,0,0.5)"
              >
                {volunteerData.title}
              </Text>
            </Box>
          </Box>

          {/* 基本情報 */}
          <Card
            bg="white"
            boxShadow="lg"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.200"
          >
            <CardBody p={6}>
              <Text fontSize="xl" fontWeight="bold" mb={4} color="black">
                📋 基本情報
              </Text>
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                gap={4}
              >
                <VStack spacing={3} align="start">
                  <HStack>
                    <Box w="3" h="3" bg="#FFDDEE" borderRadius="full" />
                    <Text>
                      <Text as="span" fontWeight="semibold">
                        場所：
                      </Text>
                      {volunteerData.location}
                    </Text>
                  </HStack>
                  <HStack>
                    <Box w="3" h="3" bg="#FFDDEE" borderRadius="full" />
                    <Text>
                      <Text as="span" fontWeight="semibold">
                        期間：
                      </Text>
                      {formatDate(volunteerData.start_date)}〜
                      {formatDate(volunteerData.end_date)}
                    </Text>
                  </HStack>
                  <HStack>
                    <Box w="3" h="3" bg="#FFDDEE" borderRadius="full" />
                    <Text>
                      <Text as="span" fontWeight="semibold">
                        募集人数：
                      </Text>
                      {volunteerData.capacity}人
                    </Text>
                  </HStack>
                  <HStack>
                    <Box w="3" h="3" bg="#FFDDEE" borderRadius="full" />
                    <Text>
                      <Text as="span" fontWeight="semibold">
                        宿泊施設：
                      </Text>
                      {volunteerData.accommodation === true
                        ? "団体側が手配"
                        : "自分で予約"}
                    </Text>
                  </HStack>
                </VStack>
                <VStack spacing={3} align="start">
                  <HStack>
                    <Box w="3" h="3" bg="#FFDDEE" borderRadius="full" />
                    <Text>
                      <Text as="span" fontWeight="semibold">
                        車：
                      </Text>
                      {getCarRequirement(volunteerData.car)}
                    </Text>
                  </HStack>
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <Box w="3" h="3" bg="#FFDDEE" borderRadius="full" />
                      <Text fontWeight="semibold">仕事内容</Text>
                    </HStack>
                    <Text pl={5} color="gray.700">
                      {volunteerData.description}
                    </Text>
                  </VStack>
                  <HStack>
                    <Box w="3" h="3" bg="#FFDDEE" borderRadius="full" />
                    <Text>
                      <Text as="span" fontWeight="semibold">
                        備考：
                      </Text>
                      {volunteerData.notes}
                    </Text>
                  </HStack>
                </VStack>
              </Grid>

              {volunteerData.organization && (
                <Box
                  mt={6}
                  p={4}
                  bg="#FFF5F5"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="#FFDDEE"
                >
                  <Text fontSize="lg" fontWeight="bold" mb={3} color="black">
                    🏢 主催団体
                  </Text>
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                    gap={3}
                  >
                    <VStack spacing={2} align="start">
                      <Text>
                        <Text as="span" fontWeight="semibold">
                          団体名：
                        </Text>
                        {volunteerData.organization.name}
                      </Text>
                      <Text>
                        <Text as="span" fontWeight="semibold">
                          電話：
                        </Text>
                        {volunteerData.organization.phone}
                      </Text>
                    </VStack>
                    <VStack spacing={2} align="start">
                      <Text>
                        <Text as="span" fontWeight="semibold">
                          メール：
                        </Text>
                        {volunteerData.organization.email}
                      </Text>
                      <Text>
                        <Text as="span" fontWeight="semibold">
                          住所：
                        </Text>
                        {volunteerData.organization.address}
                      </Text>
                    </VStack>
                  </Grid>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* 必要な道具セクション */}
          <Card
            bg="white"
            boxShadow="lg"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.200"
          >
            <CardBody p={6}>
              <Text fontSize="xl" fontWeight="bold" mb={4} color="black">
                🛠️ 必要な道具
              </Text>

              <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                gap={6}
              >
                <VStack spacing={3} align="start">
                  {volunteerData.requiredItems.map((item, index) => (
                    <HStack key={index} spacing={3} align="start">
                      <Box
                        w="3"
                        h="3"
                        bg="#FFDDEE"
                        borderRadius="full"
                        mt="1"
                      />
                      <Text fontWeight="medium" color="black">
                        {item}
                      </Text>
                    </HStack>
                  ))}
                </VStack>

                <VStack spacing={4} align="stretch">
                  <Text fontWeight="bold" color="black" fontSize="lg">
                    🛒 持っていない場合はこちらから
                  </Text>

                  {isLoadingProducts ? (
                    <Text color="gray.500" fontSize="sm">
                      商品情報を読み込み中...
                    </Text>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {volunteerData.requiredItems.map((item, itemIndex) => {
                        const products = rakutenProducts[item] || [];
                        return (
                          <Box key={itemIndex}>
                            <Text
                              fontWeight="semibold"
                              color="black"
                              fontSize="md"
                              mb={2}
                            >
                              {item}
                            </Text>
                            <HStack spacing={2} wrap="wrap">
                              {products.length > 0 ? (
                                products
                                  .slice(0, 3)
                                  .map((product, productIndex) => (
                                    <Button
                                      key={productIndex}
                                      as="a"
                                      href={product.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      bg="white"
                                      color="black"
                                      size="sm"
                                      p={3}
                                      _hover={{
                                        bg: "#FFF5F5",
                                        transform: "translateY(-2px)",
                                        boxShadow: "lg",
                                      }}
                                      boxShadow="md"
                                      borderRadius="lg"
                                      border="1px solid"
                                      borderColor="#FFDDEE"
                                      flexShrink={0}
                                      fontSize="xs"
                                      minW="200px"
                                      maxW="200px"
                                      h="280px"
                                      whiteSpace="normal"
                                      textAlign="center"
                                      display="flex"
                                      flexDirection="column"
                                      alignItems="center"
                                      justifyContent="flex-start"
                                      title={`${product.name} - ${product.price}円`}
                                      lineHeight="1.2"
                                    >
                                      {/* 商品画像 */}
                                      <Box
                                        w="100%"
                                        h="140px"
                                        mb={2}
                                        overflow="hidden"
                                        borderRadius="md"
                                        bg="gray.50"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                      >
                                        {product.imageUrl ? (
                                          <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            w="100%"
                                            h="100%"
                                            objectFit="cover"
                                          />
                                        ) : (
                                          <Text fontSize="xs" color="gray.400">
                                            画像なし
                                          </Text>
                                        )}
                                      </Box>

                                      {/* 商品名 */}
                                      <Text
                                        fontSize="xs"
                                        mb={2}
                                        px={2}
                                        lineHeight="1.3"
                                      >
                                        {product.name.length > 30
                                          ? product.name.substring(0, 30) +
                                            "..."
                                          : product.name}
                                      </Text>

                                      {/* 価格 */}
                                      <Text
                                        fontSize="sm"
                                        color="red.600"
                                        fontWeight="bold"
                                      >
                                        ¥{product.price.toLocaleString()}
                                      </Text>

                                      {/* ショップ名 */}
                                      <Text
                                        fontSize="xs"
                                        color="gray.500"
                                        mt={1}
                                      >
                                        {product.shopName}
                                      </Text>
                                    </Button>
                                  ))
                              ) : (
                                <Text fontSize="xs" color="gray.400">
                                  商品が見つかりませんでした
                                </Text>
                              )}
                            </HStack>
                          </Box>
                        );
                      })}
                    </VStack>
                  )}
                </VStack>
              </Grid>
            </CardBody>
          </Card>

          {/* 宿泊施設セクション */}
          <Card
            bg="white"
            boxShadow="lg"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.200"
          >
            <CardBody p={6}>
              <Text fontSize="xl" fontWeight="bold" mb={4} color="black">
                🏨 宿泊施設（付近のホテル）
              </Text>

              {isLoadingHotels ? (
                <Text color="gray.500" fontSize="sm">
                  ホテル情報を読み込み中...
                </Text>
              ) : (
                <Box
                  overflowX="auto"
                  pb={2}
                  w="100%"
                  h="320px"
                  sx={{
                    "&::-webkit-scrollbar": {
                      height: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "#f1f1f1",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#FFDDEE",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      background: "#FF9999",
                    },
                  }}
                >
                  <HStack
                    spacing={3}
                    minW="fit-content"
                    h="100%"
                    align="center"
                  >
                    {rakutenHotels.length > 0 ? (
                      rakutenHotels.map((hotel, index) => (
                        <Button
                          key={index}
                          as="a"
                          href={hotel.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          bg="white"
                          color="black"
                          size="md"
                          w="240px"
                          h="300px"
                          minW="240px"
                          minH="300px"
                          maxW="240px"
                          maxH="300px"
                          _hover={{
                            bg: "#FFF5F5",
                            transform: "translateY(-2px)",
                            boxShadow: "xl",
                          }}
                          boxShadow="lg"
                          borderRadius="lg"
                          border="1px solid"
                          borderColor="#FFDDEE"
                          whiteSpace="normal"
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          justifyContent="flex-start"
                          textAlign="center"
                          p={3}
                          flexShrink={0}
                        >
                          {/* ホテル画像 */}
                          <Box
                            w="100%"
                            h="120px"
                            mb={3}
                            overflow="hidden"
                            borderRadius="md"
                            bg="gray.50"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            {hotel.imageUrl ? (
                              <Image
                                src={hotel.imageUrl}
                                alt={hotel.name}
                                w="100%"
                                h="100%"
                                objectFit="cover"
                              />
                            ) : (
                              <Text fontSize="xs" color="gray.400">
                                画像なし
                              </Text>
                            )}
                          </Box>

                          {/* ホテル名 */}
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            mb={2}
                            lineHeight="1.3"
                          >
                            {hotel.name.length > 20
                              ? hotel.name.substring(0, 20) + "..."
                              : hotel.name}
                          </Text>

                          {/* 住所 */}
                          <Text
                            fontSize="xs"
                            color="gray.600"
                            mb={2}
                            lineHeight="1.2"
                          >
                            {hotel.address.length > 25
                              ? hotel.address.substring(0, 25) + "..."
                              : hotel.address}
                          </Text>

                          {/* 料金 */}
                          {hotel.hotelMinCharge > 0 && (
                            <Text
                              fontSize="sm"
                              color="red.600"
                              fontWeight="bold"
                              mb={1}
                            >
                              ¥{hotel.hotelMinCharge.toLocaleString()}円〜
                            </Text>
                          )}

                          {/* 評価 */}
                          {hotel.reviewAverage > 0 && (
                            <Text fontSize="xs" color="orange.500">
                              ⭐ {hotel.reviewAverage} ({hotel.reviewCount}件)
                            </Text>
                          )}
                        </Button>
                      ))
                    ) : (
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        h="100%"
                        w="100%"
                      >
                        <Text color="gray.400" fontSize="sm" textAlign="center">
                          {hotelSearchError ||
                            "ホテル情報が見つかりませんでした"}
                        </Text>
                      </Box>
                    )}
                  </HStack>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* 下部：ボタン表示制御 */}
          {isRegularUser && (
            <HStack justify="center" w="100%" py={6}>
              {!volunteerData.apply_entry ? (
                <Button
                  onClick={handleApply}
                  bg="linear-gradient(135deg, #FF6B9D, #C44569)"
                  color="white"
                  size="lg"
                  px={12}
                  py={6}
                  fontSize="lg"
                  fontWeight="bold"
                  borderRadius="xl"
                  boxShadow="lg"
                  _hover={{
                    bg: "linear-gradient(135deg, #FF5A8A, #B13A5C)",
                    transform: "translateY(-2px)",
                    boxShadow: "xl",
                  }}
                  _active={{
                    transform: "translateY(0px)",
                  }}
                  transition="all 0.2s ease"
                >
                  💝 応募する
                </Button>
              ) : (
                <Button
                  onClick={() => handleCancel(volunteerData.apply_entry.id)}
                  bg="linear-gradient(135deg, #6C757D, #495057)"
                  color="white"
                  size="lg"
                  px={12}
                  py={6}
                  fontSize="lg"
                  fontWeight="bold"
                  borderRadius="xl"
                  boxShadow="lg"
                  _hover={{
                    bg: "linear-gradient(135deg, #5A6268, #3D4347)",
                    transform: "translateY(-2px)",
                    boxShadow: "xl",
                  }}
                  _active={{
                    transform: "translateY(0px)",
                  }}
                  transition="all 0.2s ease"
                >
                  ❌ 応募をキャンセル
                </Button>
              )}
            </HStack>
          )}

          {canEdit && (
            <>
              {/* 参加者一覧セクション */}
              <Card
                bg="white"
                boxShadow="lg"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.200"
                mb={4}
              >
                <CardBody p={6}>
                  <Text fontSize="xl" fontWeight="bold" mb={4} color="black">
                    👥 参加者一覧
                  </Text>

                  {isLoadingParticipants ? (
                    <Text color="gray.500" fontSize="sm">
                      参加者情報を読み込み中...
                    </Text>
                  ) : participants.length > 0 ? (
                    <HStack spacing={4} wrap="wrap" align="start">
                      {participants.map((participant) => (
                        <Card
                          key={participant.id}
                          bg="gray.50"
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="lg"
                          p={4}
                          minW="200px"
                          maxW="250px"
                          flexShrink={0}
                        >
                          <VStack align="center" spacing={2}>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="black"
                              textAlign="center"
                            >
                              {participant.user?.name || "名前未設定"}
                            </Text>
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              textAlign="center"
                            >
                              {participant.user?.email ||
                                "メールアドレス未設定"}
                            </Text>
                          </VStack>
                        </Card>
                      ))}
                    </HStack>
                  ) : (
                    <Text
                      color="gray.500"
                      fontSize="sm"
                      textAlign="center"
                      py={4}
                    >
                      まだ承認済みの参加者はいません
                    </Text>
                  )}
                </CardBody>
              </Card>

              {/* 編集・削除ボタン */}
              <HStack justify="center" spacing={4}>
                <Button colorScheme="red" onClick={handleDelete}>
                  削除
                </Button>
                <Link href={`/volunteer/${volunteerData.id}/fix`}>
                  <Button colorScheme="blue">編集</Button>
                </Link>
              </HStack>
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
