<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplyEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'borantia_content_id',
        'is_approved',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
    ];

    /**
     * 応募者（User）とのリレーション
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 募集内容（BorantiaContent）とのリレーション
     */
    public function borantiaContent()
    {
        return $this->belongsTo(BorantiaContent::class);
    }


}
