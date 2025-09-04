<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Models\BorantiaContent;
use Illuminate\Support\Facades\Auth;
use App\Models\ChatRoom;

class OrganizationMypageController extends Controller
{
    /**
     * 団体の投稿したボランティア内容と応募者一覧を取得
     *
     * @return JsonResponse
     */
    public function index()
    {
        $organization = Auth::user();

        $borantiaContents = BorantiaContent::with([
            'applyEntries.user',
        ])
        ->where('organization_id', $organization->id)
        ->get()
        ->map(function ($content) {
            return [
                'id' => $content->id,
                'title' => $content->title,
                'location' => $content->location,
                'start_date' => $content->start_date,
                'end_date' => $content->end_date,
                'status' => $content->status,
                'apply_entries' => $content->applyEntries->map(function ($entry) {
                    // ChatRoomを borantia_content_id と user_id から取得
                    $chatRoom = ChatRoom::where('borantia_content_id', $entry->borantia_content_id)
                        ->whereHas('users', function ($query) use ($entry) {
                            $query->where('users.id', $entry->user_id);
                        })
                        ->first();

                    return [
                        'id' => $entry->id,
                        'user' => [
                            'id' => $entry->user->id,
                            'name' => $entry->user->name,
                            'email' => $entry->user->email,
                            'gender' => $entry->user->gender,
                            'birthday' => $entry->user->birthday,
                            'is_has_car' => $entry->user->is_has_car,
                        ],
                        'is_approved' => $entry->is_approved,
                        'chat_room_id' => $chatRoom?->id,
                    ];
                }),
            ];
        });

        return response()->json($borantiaContents);
    }
}
