import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword');

  if (!keyword) {
    return NextResponse.json(
      { error: 'キーワードが指定されていません' },
      { status: 400 }
    );
  }

  try {
    const applicationId = process.env.NEXT_PUBLIC_RAKUTEN_APP_ID;
    
    if (!applicationId) {
      return NextResponse.json(
        { error: '楽天アプリケーションIDが設定されていません' },
        { status: 500 }
      );
    }

    const apiUrl = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601';
    
    const params = new URLSearchParams({
      format: 'json',
      keyword: keyword,
      applicationId: applicationId,
      hits: '5',
      sort: 'standard',
    });

    const response = await fetch(`${apiUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`楽天API エラー: ${response.status}`);
    }

    const data = await response.json();
    
    // レスポンスデータを整形
    const products = data.Items?.map((item: any) => ({
      name: item.Item.itemName,
      price: item.Item.itemPrice,
      url: item.Item.itemUrl,
      imageUrl: item.Item.mediumImageUrls?.[0]?.imageUrl || '',
      shopName: item.Item.shopName,
    })) || [];

    return NextResponse.json({
      keyword,
      products,
      total: data.count || 0,
    });

  } catch (error) {
    console.error('楽天API検索エラー:', error);
    return NextResponse.json(
      { error: '商品検索に失敗しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
