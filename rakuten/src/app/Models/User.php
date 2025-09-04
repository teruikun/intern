<?php

namespace App\Models;

use App\Enums\Gender;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * 一括代入可能な属性
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'address',
        'gender',
        'birthday',
        'is_has_car',
        'note',
        'role',
        'profile_image_id',
    ];

    /**
     * 属性の型キャスト
     */
    protected $casts = [
        'gender' => Gender::class,
        'role' => UserRole::class,
        'birthday' => 'date',
        'is_has_car' => 'boolean',
    ];

    /**
     * パスワードを設定
     */
    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = $value;
    }

    /**
     * 関連：プロフィール画像
     */
    public function profileImage()
    {
        return $this->belongsTo(Image::class, 'profile_image_id');
    }

    /**
     * 関連：応募情報
     */
    public function applyEntries()
    {
        return $this->hasMany(ApplyEntry::class);
    }

    /**
     * 関連：チャット参加情報
     */
    public function chatRoomUsers()
    {
        return $this->hasMany(ChatRoomUser::class);
    }

    /**
     * 関連：メッセージ
     */
    public function chatMessages()
    {
        return $this->hasMany(ChatMessage::class);
    }
}
