<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Image;

class ImageController extends Controller
{

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:2048',
        ]);

        $imageFile = $request->file('image');

        // 元のファイル名を取得
        $originalName = $imageFile->getClientOriginalName();

        // 保存（images ディレクトリにオリジナル名で）
        $path = $imageFile->storeAs('images', $originalName, 'public');

        // DBに保存
        $image = Image::create([
            'file_path' => $path,
            'mime_type' => $imageFile->getClientMimeType(),
        ]);

        return response()->json([
            'id' => $image->id,
            'url' => asset('storage/' . $image->file_path),
        ]);
    }
}
