<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'asset_id',
        'name',
        'description',
        'remind_at',
        'status',
    ];

    protected $casts = [
        'remind_at' => 'date',
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
