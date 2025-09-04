import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get("location");
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");

  if (!location && (!latitude || !longitude)) {
    return NextResponse.json(
      { error: "場所または座標が指定されていません" },
      { status: 400 }
    );
  }

  try {
    const applicationId = process.env.NEXT_PUBLIC_RAKUTEN_APP_ID;

    if (!applicationId) {
      console.error("楽天アプリケーションIDが設定されていません");
      return NextResponse.json(
        { error: "楽天アプリケーションIDが設定されていません" },
        { status: 500 }
      );
    }

    console.log("=== 楽天ホテル検索API 開始 ===");
    console.log(
      "Application ID:",
      applicationId ? `${applicationId.substring(0, 10)}...` : "未設定"
    );
    console.log("Location:", location);
    console.log("Provided coordinates:", latitude, longitude);

    const apiUrl =
      "https://app.rakuten.co.jp/services/api/Travel/SimpleHotelSearch/20170426";

    // 座標が提供されている場合の処理
    let searchLatitude = "128440.51"; // デフォルト: 東京駅（楽天独自座標系）
    let searchLongitude = "503172.21"; // デフォルト: 東京駅（楽天独自座標系）
    let useDatumType = false;

    if (latitude && longitude) {
      // Google Maps座標をそのまま使用（世界測地系）
      console.log(
        `Google Maps座標（世界測地系）を使用: ${latitude}, ${longitude}`
      );
      searchLatitude = latitude;
      searchLongitude = longitude;
      useDatumType = true; // 世界測地系を指定
    } else {
      console.log(
        "座標が提供されていないため、東京駅の座標（楽天独自座標系）を使用します"
      );
    }

    const searchRadius = "3"; // 3km範囲で検索

    const params = new URLSearchParams({
      format: "json",
      applicationId: applicationId,
      latitude: searchLatitude,
      longitude: searchLongitude,
      searchRadius: searchRadius,
      hits: "5",
      sort: "standard",
    });

    // 世界測地系を使用する場合はdatumType=1を追加
    if (useDatumType) {
      params.set("datumType", "1");
      console.log("世界測地系（datumType=1）で検索します");
    } else {
      console.log("楽天API独自座標系で検索します");
    }

    console.log("=== 楽天ホテルAPI 呼び出し詳細 ===");
    console.log("API URL:", apiUrl);
    console.log("Parameters:", Object.fromEntries(params));
    console.log("Full URL:", `${apiUrl}?${params}`);

    const response = await fetch(`${apiUrl}?${params}`, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NextJS App)",
      },
    });

    console.log("=== 楽天API レスポンス詳細 ===");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    // レスポンステキストを先に取得
    const responseText = await response.text();
    console.log("Raw Response:", responseText.substring(0, 500)); // 最初の500文字のみ表示

    if (!response.ok) {
      console.error("楽天ホテルAPI エラー詳細:");
      console.error("Status:", response.status);
      console.error("Response:", responseText);

      return NextResponse.json(
        {
          error: `楽天ホテルAPI エラー: ${response.status}`,
          details: responseText,
          url: `${apiUrl}?${params}`,
          params: Object.fromEntries(params),
        },
        { status: response.status }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON パースエラー:", parseError);
      console.error("パースできなかった内容:", responseText);

      return NextResponse.json(
        {
          error: "楽天APIレスポンスの解析に失敗しました",
          details: responseText.substring(0, 200),
        },
        { status: 500 }
      );
    }
    console.log("Hotel API Response:", data);

    // 楽天APIエラーチェック
    if (data.error) {
      console.error("楽天API内部エラー:", data.error);
      return NextResponse.json(
        {
          error: "楽天API内部エラー",
          details: data.error,
          code: data.error_description || "不明なエラー",
        },
        { status: 400 }
      );
    }

    // データ存在チェック
    if (!data.hotels || !Array.isArray(data.hotels)) {
      console.log("ホテルデータが見つかりませんでした");
      return NextResponse.json({
        location,
        hotels: [],
        total: 0,
        searchInfo: {
          latitude: searchLatitude,
          longitude: searchLongitude,
          searchRadius: searchRadius,
          coordinates_provided: !!(latitude && longitude),
        },
        message: "指定された条件でホテルが見つかりませんでした",
      });
    }

    // レスポンスデータを整形
    const hotels =
      data.hotels?.map((hotel: any) => ({
        name: hotel.hotel?.[0]?.hotelBasicInfo?.hotelName || "",
        url: hotel.hotel?.[0]?.hotelBasicInfo?.hotelInformationUrl || "",
        imageUrl: hotel.hotel?.[0]?.hotelBasicInfo?.hotelImageUrl || "",
        address: hotel.hotel?.[0]?.hotelBasicInfo?.address1 || "",
        telephoneNo: hotel.hotel?.[0]?.hotelBasicInfo?.telephoneNo || "",
        hotelMinCharge: hotel.hotel?.[0]?.hotelBasicInfo?.hotelMinCharge || 0,
        reviewAverage: hotel.hotel?.[0]?.hotelBasicInfo?.reviewAverage || 0,
        reviewCount: hotel.hotel?.[0]?.hotelBasicInfo?.reviewCount || 0,
      })) || [];

    return NextResponse.json({
      location,
      hotels,
      total: data.pagingInfo?.recordCount || 0,
      searchInfo: {
        latitude: searchLatitude,
        longitude: searchLongitude,
        searchRadius: searchRadius,
        coordinates_provided: !!(latitude && longitude),
        datum_type: useDatumType ? "world_geodetic_system" : "rakuten_original",
        datum_type_code: useDatumType ? 1 : 0,
      },
    });
  } catch (error) {
    console.error("楽天ホテルAPI検索エラー:", error);
    return NextResponse.json(
      {
        error: "ホテル検索に失敗しました",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
