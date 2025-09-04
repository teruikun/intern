<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserProfileController extends Controller
{
    /**
     * 現在のユーザーのプロフィール情報を取得
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * ユーザーのプロフィール情報を更新
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'gender' => 'nullable|in:male,female,other',
            'birthday' => 'nullable|date',
            'address' => 'nullable|string',
            'is_has_car' => 'nullable|boolean',
            'note' => 'nullable|string',
        ]);

        $user->update($validated);

            return response()->json(['message' => 'プロフィールを更新しました']);
}
}
