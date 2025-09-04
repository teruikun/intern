<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Organization;

class AuthController extends Controller
{
    public function registerOrganization(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:organizations,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:organization',
            'address' => 'required|string|max:255',
            'note' => 'nullable|string|max:500',
        ]);

        $org = Organization::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'note' => $validated['note'] ?? null,
            'password' => $validated['password'],
            'role' => $validated['role'],
        ]);

        $token = $org->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => '団体の登録が完了しました。',
            'access_token' => $token,
            'role' => $org->role,
        ], 201);
    }
    public function registerUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|in:male,female,other',
            'birthday' => 'nullable|date',
            'address' => 'required|string',
            'is_has_car' => 'nullable|boolean',
            'note' => 'nullable|string',
            'role' => 'required|in:user,organization',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'phone' => $validated['phone'],
            'gender' => $validated['gender'] ?? null,
            'birthday' => $validated['birthday'] ?? null,
            'address' => $validated['address'],
            'is_has_car' => $validated['is_has_car'] ?? false,
            'note' => $validated['note'] ?? null,
            'role' => $validated['role'],
        ]);

        $token = $user->createToken('access_token')->plainTextToken;

        return response()->json([
            'message' => '登録が完了しました。',
            'access_token' => $token,
            'role' => $user->role,
        ], 201);
    }
    /**
     * ユーザーログイン
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'role' => 'required|in:user,organization',
        ]);

        // ロールに応じてモデルを選択
        $model = $request->role === 'user' ? User::class : Organization::class;

        $user = $model::where('email', $request->input('email'))->first();

        if (!$user) {
            return response()->json(['message' => '認証に失敗しました'], 401);
        }

        if ($request->input('password') !== $user->password) {
            return response()->json(['message' => '認証に失敗しました'], 401);
        }

        $token = $user->createToken('access_token')->plainTextToken;

        return response()->json([
            'message' => 'ログイン成功',
            'access_token' => $token,
            'role' => $user->role,
        ], 200);
    }

    public function logout(Request $request)
    {
        PersonalAccessToken::findToken($request->bearerToken())->delete();
        return response()->json(['message' => 'ログアウトしました。'], 201);
    }

    public function deleteUserById($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'ユーザーが見つかりませんでした。'
            ], 404);
        }

        $user->delete();

        return response()->json([
            'message' => 'ユーザーを削除しました。'
        ], 200);
    }

    public function deleteOrganizationById($id)
    {
        $organization = Organization::find($id);

        if (!$organization) {
            return response()->json([
                'message' => '団体が見つかりませんでした。'
            ], 404);
        }

        $organization->delete();

        return response()->json([
            'message' => '団体を削除しました。'
        ], 200);
    }
}
