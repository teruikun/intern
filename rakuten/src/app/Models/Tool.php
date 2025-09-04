<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tool extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'borantia_content_id',
    ];

    /**
     * 紐づくボランティア募集内容
     */
    public function borantiaContent()
    {
        return $this->belongsTo(BorantiaContent::class);
    }
}
