<?php

namespace App\Models;

use App\Enums\BorantiaStatus;
use App\Enums\CarRequirement;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BorantiaContent extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'title',
        'location',
        'start_date',
        'end_date',
        'recruiting_number',
        'applicants_number',
        'phone',
        'accommodation',
        'car',
        'note',
        'status',
        'borantia_image_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'accommodation' => 'boolean',
        'car' => CarRequirement::class,
        'status' => BorantiaStatus::class,
    ];

    /**
     * 団体（主催者）とのリレーション
     */
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * 応募一覧とのリレーション
     */
    public function applyEntries()
    {
        return $this->hasMany(ApplyEntry::class);
    }

    /**
     * 関連するツール一覧
     */
    public function tools()
    {
        return $this->hasMany(Tool::class);
    }

    /**
     * 関連画像
     */
    public function image()
    {
        return $this->belongsTo(Image::class, 'borantia_image_id');
    }

    public function getImagePath()
    {
        return optional($this->image)->file_path;
    }

    /**
     * チャットルーム
     */
    public function chatRoom()
    {
        return $this->hasOne(ChatRoom::class);
    }
}
