<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use App\Models\Concerns\HasResourceLimit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

use SimpleSoftwareIO\QrCode\Facades\QrCode;

class Kit extends Model
{
    use BelongsToUser, HasResourceLimit, HasUlids;

    protected $appends = ['qr_code_svg'];

    public function getQrCodeSvgAttribute(): string
    {
        return QrCode::size(200)
            ->format('svg')
            ->generate(route('kits.overview', $this->id))
            ->toHtml();
    }

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'status',
    ];
}
