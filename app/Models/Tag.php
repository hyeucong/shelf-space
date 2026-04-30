<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use App\Models\Concerns\HasResourceLimit;
use App\Services\UserResourceCache;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use BelongsToUser, HasResourceLimit;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'hex_color',
    ];

    protected static function booted(): void
    {
        $flush = fn (self $model) => UserResourceCache::forgetTags($model->user_id);

        static::created($flush);
        static::updated($flush);
        static::deleted($flush);
    }

    public function assets(): BelongsToMany
    {
        return $this->belongsToMany(Asset::class)->withTimestamps();
    }
}
