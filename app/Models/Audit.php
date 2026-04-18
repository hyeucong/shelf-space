<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use Illuminate\Database\Eloquent\Model;

class Audit extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'event',
        'description',
    ];
}
