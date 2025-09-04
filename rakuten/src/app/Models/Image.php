<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    use HasFactory;

    protected $fillable = [
        'file_path',
        'mime_type',
    ];

    /**
     * ユーザーのプロフィール画像として使われている場合
     */
    public function users()
    {
        return $this->hasMany(User::class, 'profile_image_id');
    }

    /**
     * ボランティア内容の画像として使われている場合
     */
    public function borantiaContents()
    {
        return $this->hasMany(BorantiaContent::class, 'borantia_image_id');
    }

    public function scopeProfileImages($query)
    {
        return $query->whereHas('users');
    }

    public function scopeBorantiaImages($query)
    {
        return $query->whereHas('borantiaContents');
    }
}
