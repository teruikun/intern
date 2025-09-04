<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Organization extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * 一括代入可能な属性
     */
    protected $fillable = [
        'email',
        'phone',
        'password',
        'name',
        'address',
        'note',
        'role',
    ];

    /**
     * 属性の型キャスト
     */
    protected $casts = [
        'role' => UserRole::class,
    ];

    /**
     * パスワードを設定
     */
    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = $value; // ハッシュ化をスキップ
    }

    /**
     * 関連：団体が投稿したボランティア募集
     */
    public function borantiaContents()
    {
        return $this->hasMany(BorantiaContent::class);
    }
}
