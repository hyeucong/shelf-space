<?php

namespace App\Models\Concerns;

use Illuminate\Validation\ValidationException;

trait HasResourceLimit
{
    /**
     * Boot the trait and register the creating event listener.
     */
    protected static function bootHasResourceLimit(): void
    {
        static::creating(function ($model) {
            $limit = 10000;
            $userId = $model->user_id ?? auth()->id();

            if (! $userId) {
                return; // Can't enforce limit without a user
            }

            $count = self::where('user_id', $userId)->count();

            if ($count >= $limit) {
                $resourceName = strtolower((new \ReflectionClass($model))->getShortName());

                throw ValidationException::withMessages([
                    'limit' => "Action denied. You have reached the limit of {$limit} {$resourceName}s.",
                ]);
            }
        });
    }
}
