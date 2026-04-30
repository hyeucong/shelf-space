<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use App\Models\Concerns\HasResourceLimit;
use App\Services\UserResourceCache;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use BelongsToUser, HasFactory, HasResourceLimit;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'hex_color',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        $flush = fn (self $model) => UserResourceCache::forgetCategories($model->user_id);

        static::created($flush);
        static::updated($flush);
        static::deleted($flush);
    }

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }
}
