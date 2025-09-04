<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\ApplyEntry;
use App\Models\BorantiaContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserMypageController extends Controller
{
    public function showApplications()
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json(['message' => '認証が必要です'], 401);
            }

            $applications = ApplyEntry::with(['borantiaContent.organization'])
                ->where('user_id', $user->id)
                ->get()
                ->map(function ($entry) {
                    return [
                        'id' => $entry->id,
                        'is_approved' => $entry->is_approved,
                        'created_at' => $entry->created_at,
                        'borantia_content' => [
                            'id' => $entry->borantiaContent->id,
                            'title' => $entry->borantiaContent->title,
                            'location' => $entry->borantiaContent->location,
                            'start_date' => $entry->borantiaContent->start_date,
                            'end_date' => $entry->borantiaContent->end_date,
                            'organization' => [
                                'id' => $entry->borantiaContent->organization->id,
                                'name' => $entry->borantiaContent->organization->name,
                            ]
                        ]
                    ];
                });

            $waiting = $applications->where('is_approved', false)->values();
            $approved = $applications->where('is_approved', true)->values();

            return response()->json([
                'waiting' => $waiting,
                'approved' => $approved
            ], 200);
        } catch (\Exception $e) {
            Log::error('マイページ情報取得エラー', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);
            return response()->json([
                'message' => 'マイページ情報の取得に失敗しました'
            ], 500);
        }
    }
}
