<?php

namespace App\Http\Controllers;

use App\Models\VolunteerContent;

class VolunteerContentController extends Controller
{  
    public function index() // ボランティア内容の取得
    {
        $contents = VolunteerContent::with('organization', 'image') // image が1枚の場合
            ->where('status', 'recruiting') // 募集中のみ
            ->orderBy('start_date') // 開始日で並び替え
            ->get() // データを取得
            ->map(function ($content) { // データを加工
                return [
                    'id' => $content->id, // ボランティア内容のID
                    'title' => $content->title, // ボランティア内容のタイトル
                    'location' => $content->location, // ボランティア内容の場所
                    'start_date' => $content->start_date, // ボランティア内容の開始日
                    'end_date' => $content->end_date, // ボランティア内容の終了日
                    'status' => $content->status, // ボランティア内容のステータス
                    'image_url' => optional($content->image)->file_path, // ボランティア内容の画像のURL
                    'people_count' => $content->people_count, // ボランティア内容の人数
                    'phone_number' => $content->phone_number, // ボランティア内容の電話番号
                    'tools' => $content->tools, // ボランティア内容の道具
                    'organization' => [
                        'id' => $content->organization->id, // ボランティア内容の組織のID
                        'name' => $content->organization->name, // ボランティア内容の組織の名前
                    ],
                ];
            });

        return response()->json($contents);
    }
}