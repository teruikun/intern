import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("API Route: 受信データ", body);

    // Laravel APIへのリクエスト
    const response = await fetch("http://web.local:9090/api/register/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("API Route: Laravel APIレスポンスステータス", response.status);

    const data = await response.json();
    console.log("API Route: Laravel APIレスポンスデータ", data);

    if (!response.ok) {
      console.log("API Route: エラーレスポンス", data);
      return NextResponse.json(
        {
          error: data.message || "ユーザー登録に失敗しました",
          errors: data.errors,
        },
        { status: response.status }
      );
    }

    console.log("API Route: 成功レスポンス", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route: エラー詳細:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
