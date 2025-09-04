import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "住所が指定されていません" },
        { status: 400 }
      );
    }

    console.log("=== Google Maps Geocoding API 呼び出し開始 ===");
    console.log("検索住所:", address);

    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleMapsApiKey) {
      console.error("GOOGLE_MAPS_API_KEYが設定されていません");
      return NextResponse.json(
        { error: "Google Maps API keyが設定されていません" },
        { status: 500 }
      );
    }

    // Google Maps Geocoding API呼び出し
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${googleMapsApiKey}&language=ja&region=jp`;

    console.log(
      "Geocoding API URL:",
      geocodingUrl.replace(googleMapsApiKey, "***API_KEY***")
    );

    const response = await fetch(geocodingUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("=== Google Maps API レスポンス ===");
    console.log("Status:", data.status);
    console.log("Results count:", data.results?.length || 0);

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.error("住所が見つかりませんでした:", data.status);
      return NextResponse.json(
        {
          error: "住所を座標に変換できませんでした",
          status: data.status,
          address: address,
        },
        { status: 404 }
      );
    }

    const result = data.results[0];
    const location = result.geometry.location;

    const coordinates = {
      latitude: location.lat,
      longitude: location.lng,
      formatted_address: result.formatted_address,
      address_components: result.address_components,
      place_id: result.place_id,
    };

    console.log("=== 座標変換結果 ===");
    console.log("緯度:", coordinates.latitude);
    console.log("経度:", coordinates.longitude);
    console.log("整形済み住所:", coordinates.formatted_address);

    return NextResponse.json({
      success: true,
      coordinates: coordinates,
      original_address: address,
    });
  } catch (error) {
    console.error("=== Geocoding API エラー ===");
    console.error("エラー詳細:", error);

    return NextResponse.json(
      {
        error: "住所の座標変換に失敗しました",
        details: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 }
    );
  }
}
