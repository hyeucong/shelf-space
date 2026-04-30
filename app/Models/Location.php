<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use App\Models\Concerns\HasResourceLimit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Support\Facades\Http;



class Location extends Model
{
    use BelongsToUser, HasFactory, HasResourceLimit, HasUlids;

    protected $appends = [];



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
        // Geocoding is now handled in the LocationController via GeocodingService
        // to comply with OSM TOS and ensure better control over requests.
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
