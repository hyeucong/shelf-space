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
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Spatie\Activitylog\Models\Concerns\HasActivity;
use Spatie\Activitylog\Support\LogOptions;

#[UseFactory(AssetFactory::class)]
class Asset extends Model
{
    use BelongsToUser, HasActivity, HasFactory;

    protected static array $recordEvents = ['created', 'updated', 'deleted'];

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

    protected $appends = ['qr_code_svg'];

    public function getQrCodeSvgAttribute(): string
    {
        return QrCode::size(200)
            ->format('svg')
            ->generate(route('assets.overview', $this->id))
            ->toHtml();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('asset')
            ->logOnly([
                'name',
                'status',
                'asset_id',
                'location_id',
                'category_id',
                'user_id',
                'value',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(function (string $eventName) {
                $user = auth()->user()?->name ?? 'System';

                return match ($eventName) {
                    'created' => "Initial registration: Asset added to inventory by {$user}",
                    'updated' => "Asset details or custody updated by {$user}",
                    'deleted' => "Asset moved to archive/deleted by {$user}",
                    'restored' => "Asset restored to active inventory by {$user}",
                    default => "Asset record {$eventName} by {$user}",
                };
            });
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
