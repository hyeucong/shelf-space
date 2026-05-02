<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use App\Models\Concerns\HasResourceLimit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\SvgWriter;

class Kit extends Model
{
    use BelongsToUser, HasResourceLimit, HasUlids;

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    protected $appends = ['qr_code_svg'];

    public function getQrCodeSvgAttribute(): string
    {
        return (new Builder(
            writer: new SvgWriter(),
            data: route('kits.overview', $this->id),
            size: 200,
            margin: 0
        ))->build()->getString();
    }

    protected $fillable = [
        'user_id',
        'location_id',
        'category_id',
        'name',
        'description',
        'status',
    ];
}
