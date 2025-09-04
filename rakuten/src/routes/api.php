<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ApplyEntryController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\BorantiaContentController;
use App\Http\Controllers\UserMypageController;
use App\Http\Controllers\OrganizationMypageController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\OrganizationProfileController;


Route::get('/test', function (Request $request) {
    return response()->json([
        'message' => "This is a test message from API.",
    ], 200);
});
// 認証系
Route::post('/register/organization', [AuthController::class, 'registerOrganization']);
Route::post('/register/user', [AuthController::class, 'registerUser']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});

Route::delete('/delete/user/{id}', [AuthController::class, 'deleteUserById']);
Route::delete('/delete/organization/{id}', [AuthController::class, 'deleteOrganizationById']);


//応募
//応募の削除
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/apply-entries', [ApplyEntryController::class, 'store']);
    Route::delete('/apply-entries/{id}', [ApplyEntryController::class, 'destroy']);
});
//画像保存
Route::middleware('auth:sanctum')->post('/images', [ImageController::class, 'store']);

//ツールの保存
Route::middleware('auth:sanctum')->post('/tools', [ToolController::class, 'store']);

//ボランティア内容の作成
Route::middleware('auth:sanctum')->post('/borantia-contents', [BorantiaContentController::class, 'store']);

//参加者マイページ情報取得
Route::middleware('auth:sanctum')->get('/users/my-applications', [UserMypageController::class, 'showApplications']);


Route::middleware('auth:sanctum')->group(function () {
    // ユーザー
    Route::get('/users/me', [UserProfileController::class, 'me']);
    Route::put('/users/me', [UserProfileController::class, 'update']);

    // 団体
    Route::get('/organizations/me', [OrganizationProfileController::class, 'me']);
    Route::put('/organizations/me', [OrganizationProfileController::class, 'update']);
});


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/borantia-contents/{id}', [BorantiaContentController::class, 'show']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::delete('/borantia-contents/{id}', [BorantiaContentController::class, 'destroy']);
});


Route::middleware('auth:sanctum')->get(
    '/organizations/my-borantia-contents',
    [OrganizationMypageController::class, 'index']
);

Route::middleware('auth:sanctum')->get('/me/test', function () {
    return response()->json([
        'user' => auth()->user(),
        'role' => auth()->user()?->role,
        'class' => get_class(auth()->user()),
    ]);
});

Route::get('/borantia-contents', [BorantiaContentController::class, 'index']);

//イベントの更新
Route::middleware('auth:sanctum')->put('/borantia-contents/{id}', [BorantiaContentController::class, 'update']);

//イベントの承認非承認
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/apply-entries/{id}/approve', [ApplyEntryController::class, 'approve']);
    Route::post('/apply-entries/{id}/reject', [ApplyEntryController::class, 'reject']);
});

