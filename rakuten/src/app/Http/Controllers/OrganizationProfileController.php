<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class OrganizationProfileController extends Controller
{
    /**
     * 現在の団体のプロフィール情報を取得
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }


    public function update(Request $request)
    {
        $organization = $request->user(); // 👈 ガードなしで取得

        if (!$organization) {
            return response()->json(['message' => '未認証'], 401);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        $organization->update($validated);

        return response()->json(['message' => 'プロフィールを更新しました']);
    }
}
