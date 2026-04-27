<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use Database\Factories\AssetFactory;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\HasActivity;
use Spatie\Activitylog\Support\LogOptions;

#[UseFactory(AssetFactory::class)]
class Asset extends Model
{
    use BelongsToUser, HasActivity, HasFactory;

    protected static array $recordEvents = ['updated'];

    protected $fillable = [
        'user_id',
        'category_id',
        'location_id',
        'asset_id',
        'name',
        'description',
        'value',
        'status',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('asset')
            ->logOnly([
                'name',
                'status',
                'asset_id',
                'location_id',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->withTimestamps();
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(Reminder::class);
    }
}
