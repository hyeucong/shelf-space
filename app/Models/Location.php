<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Http;

class Location extends Model
{
    use BelongsToUser, HasFactory;

    protected $fillable = [
        'user_id',
        'parent_location_id',
        'name',
        'description',
        'address',
        'latitude',
        'longitude',
    ];

    protected static function booted()
    {
        static::saving(function (Location $location) {
            if ($location->isDirty('address') && $location->address) {
                try {
                    $response = Http::withHeaders([
                        'User-Agent' => 'ShelfSpace (contact@shelfspace.test)',
                    ])->timeout(5)->get('https://nominatim.openstreetmap.org/search', [
                        'q' => $location->address,
                        'format' => 'json',
                        'limit' => 1,
                    ]);

                    if ($response->successful() && isset($response->json()[0])) {
                        $data = $response->json()[0];
                        $location->latitude = $data['lat'];
                        $location->longitude = $data['lon'];
                    }
                } catch (\Exception $e) {
                    // Silently fail to not block saving if API is down
                    report($e);
                }
            }
        });
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_location_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_location_id');
    }

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }
}
