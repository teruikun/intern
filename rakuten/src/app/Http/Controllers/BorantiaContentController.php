<?php

namespace App\Http\Controllers;

use App\Models\BorantiaContent;
use App\Models\ApplyEntry;
use App\Models\Tool;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class BorantiaContentController extends Controller
{
    public function index() // ボランティア内容の取得
    {
        $contents = BorantiaContent::with('organization', 'image') // image が1枚の場合
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
                    'recruiting_number' => $content->recruiting_num, // ボランティア内容の募集人数
                    'applicants_number' => $content->applicants_num, // ボランティア内容の応募人数
                    'accommodation' => $content->accommodation, // ボランティア内容の宿泊
                    'car' => $content->car, // ボランティア内容の車の有無
                    'image_url' => $content->getImagePath(), // ボランティア内容の画像のURL
                    'organization' => [
                        'id' => $content->organization->id, // ボランティア内容の組織のID
                        'name' => $content->organization->name, // ボランティア内容の組織の名前
                    ],
                ];
            });

        return response()->json($contents);
    }

    public function show($id)
    {
        try {
            $content = BorantiaContent::with(['organization', 'tools', 'image'])
                ->findOrFail($id);

            $user = auth()->user();

            $entry = $user
                ? ApplyEntry::where('borantia_content_id', $content->id)
                ->where('user_id', $user->id)
                ->first()
                : null;

            return response()->json([
                'id' => $content->id,
                'title' => $content->title,
                'location' => $content->location,
                'start_date' => $content->start_date,
                'end_date' => $content->end_date,
                'recruiting_number' => $content->recruiting_number,
                'applicants_number' => $content->applicants_number,
                'phone' => $content->phone,
                'accommodation' => $content->accommodation,
                'car' => $content->car,
                'note' => $content->note,
                'organization' => $content->organization ? [
                    'id' => $content->organization->id,
                    'name' => $content->organization->name,
                    'email' => $content->organization->email,
                    'phone' => $content->organization->phone,
                    'address' => $content->organization->address,
                ] : null,
                'tools' => $content->tools->map(function ($tool) {
                    return [
                        'id' => $tool->id,
                        'name' => $tool->name,
                    ];
                }),
                'image' => $content->image ? [
                    'id' => $content->image->id,
                    'file_path' => $content->image->file_path,
                ] : null,
                'apply_entry' => $entry ? [
                    'entry_id' => $entry->id,
                    'is_approved' => $entry->is_approved,
                ] : null,
                'created_at' => $content->created_at,
                'updated_at' => $content->updated_at,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '指定されたボランティア内容が見つかりません'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => '作成中にエラーが発生しました',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'recruiting_number' => 'required|integer|min:1',
            'phone' => 'required|string|max:20',
            'accommodation' => 'required|boolean',
            'car' => 'required|in:must,preferred,none',
            'note' => 'nullable|string',
            'borantia_image_id' => 'nullable|exists:images,id',
            'tools' => 'nullable|array',
            'tools.*' => 'string|max:255',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => '認証が必要です'], 401);
        }

        DB::beginTransaction();
        try {
            $borantia = BorantiaContent::where('organization_id', auth()->id())
                ->where('id', $id)
                ->first();

            if (!$borantia) {
                return response()->json([
                    'message' => 'ボランティアが見つかりません',
                    'organization_id' => auth()->id(),
                    'borantia_id' => $id,
                ], 404);
            }

            $borantia->update(Arr::except($validated, ['tools']));

            // 旧tool削除 → 再登録
            $borantia->tools()->delete();
            if (!empty($validated['tools'])) {
                foreach ($validated['tools'] as $toolName) {
                    $borantia->tools()->create(['name' => $toolName]);
                }
            }

            DB::commit();

            return response()->json(['message' => '更新に成功しました'], 200);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => '更新中にエラーが発生しました',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'recruiting_number' => 'required|integer|min:1',
            'phone' => 'required|string|max:20',
            'accommodation' => 'required|boolean',
            'car' => 'required|in:must,preferred,none',
            'note' => 'nullable|string',
            'borantia_image_id' => 'nullable|exists:images,id',
            'tools' => 'nullable|array',
            'tools.*' => 'string|max:255',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => '認証が必要です'], 401);
        }


        DB::beginTransaction();
        try {
            $borantia = BorantiaContent::create(array_merge(
                Arr::except($validated, ['tools']),
                [
                    'organization_id' => auth()->id(),
                    'status' => 'recruiting',
                    'applicants_number' => 0,
                ]
            ));

            // toolsを保存
            if (!empty($validated['tools'])) {
                foreach ($validated['tools'] as $toolName) {
                    Tool::create([
                        'borantia_content_id' => $borantia->id,
                        'name' => $toolName,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'ボランティア作成成功',
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => '作成中にエラーが発生しました',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }


    public function destroy($id)
    {
        // ログイン済み団体ユーザーの取得
        $organization = auth()->user(); // 認証済み団体ユーザー

        $content = BorantiaContent::where('id', $id) // ボランティア内容のIDを指定してデータを取得
            ->where('organization_id', $organization->id) // ボランティア内容の組織のIDを指定してデータを取得
            ->firstOrFail(); // ボランティア内容の組織のIDを指定してデータを取得

        $content->delete(); // ボランティア内容を削除

        return response()->json(['message' => '削除しました。'], 200); // 削除しました。と返す
    }
}
