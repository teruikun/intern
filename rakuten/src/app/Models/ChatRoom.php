<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatRoom extends Model
{
    use HasFactory;

    protected $fillable = [
        'borantia_content_id',
    ];

    /**
     * 紐づくボランティア募集
     */
    public function borantiaContent()
    {
        return $this->belongsTo(BorantiaContent::class);
    }

    /**
     * チャットルームに所属するユーザー（多対多）
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'chat_room_users')
            ->withTimestamps();
    }

    /**
     * このチャットルームのメッセージ一覧
     */
    public function messages()
    {
        return $this->hasMany(ChatMessage::class);
    }
}
