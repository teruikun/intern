<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ChatRoom;
use App\Models\ChatRoomUser;
use App\Models\BorantiaContent;
use App\Models\ApplyEntry;
use Illuminate\Support\Facades\DB;
use App\Models\User;


class ApplyEntryController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'borantia_content_id' => 'required|exists:borantia_contents,id',
        ]);

        $user = User::find(auth()->id());  // 応募者

        // ボランティアイベントの取得
        $event = BorantiaContent::findOrFail($validated['borantia_content_id']);

        DB::beginTransaction();

        try {
            $alreadyApplied = ApplyEntry::where('user_id', $user->id)
                ->where('borantia_content_id', $event->id)
                ->exists();

            if ($alreadyApplied) {
                return response()->json([
                    'message' => 'すでにこのボランティアに応募しています。'
                ], 400);
            }
            // 応募レコードの作成
            $entry = ApplyEntry::create([
                'user_id' => $user->id,
                'borantia_content_id' => $event->id,
                'is_approved' => false,
            ]);

            // チャットルームの重複チェック
            $chatRoom = ChatRoom::where('borantia_content_id', $event->id)
                ->whereHas('users', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->first();

            // なければ作成
            if (!$chatRoom) {
                $chatRoom = ChatRoom::create([
                    'borantia_content_id' => $event->id,
                ]);

                ChatRoomUser::create([
                    'chat_room_id' => $chatRoom->id,
                    'user_id' => $user->id,
                ]);

                if ($event->organization_id) {
                    ChatRoomUser::create([
                        'chat_room_id' => $chatRoom->id,
                        'user_id' => $event->organization_id,
                    ]);
                }
            } // ← これを追加

            DB::commit();

            return response()->json([
                'message' => '応募が完了し、チャットルームが作成されました。',
                'chat_room_id' => $chatRoom->id,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => '処理中にエラーが発生しました',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function approve($id)
    {
        $entry = ApplyEntry::with('borantiaContent')->findOrFail($id);

        // すでに承認済みなら2重加算を防止
        if ($entry->is_approved) {
            return response()->json(['message' => 'すでに承認済みです']);
        }

        $entry->is_approved = true;
        $entry->save();

        // 応募イベントの応募人数を+1する
        $entry->borantiaContent->increment('applicants_number');

        return response()->json(['message' => '承認しました']);
    }

    public function reject($id)
    {
        $entry = ApplyEntry::findOrFail($id);
        $entry->is_approved = false;
        $entry->save();

        return response()->json(['message' => '拒否しました']);
    }

    public function destroy($id)
    {
        $entry = ApplyEntry::where('id', $id)
        ->where('user_id', auth()->id())
        ->firstOrFail();

        $entry->delete();

        return response()->json(['message' => '応募がキャンセルされました']);
    }
}
