<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Location;
use App\Models\Tag;
use Illuminate\Support\Facades\Cache;

class UserResourceCache
{
    private const TTL = 3600; // 1 hour

    // --- Cache Keys ---

    public static function categoriesKey(int $userId): string
    {
        return "user:{$userId}:categories";
    }

    public static function tagsKey(int $userId): string
    {
        return "user:{$userId}:tags";
    }

    public static function locationsKey(int $userId): string
    {
        return "user:{$userId}:locations";
    }

    // --- Getters (return plain arrays, safe to serialize) ---

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function categories(int $userId): array
    {
        return Cache::remember(
            self::categoriesKey($userId),
            self::TTL,
            fn () => Category::where('user_id', $userId)->orderBy('name')->get()->toArray()
        );
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function tags(int $userId): array
    {
        return Cache::remember(
            self::tagsKey($userId),
            self::TTL,
            fn () => Tag::where('user_id', $userId)->orderBy('name')->get()->toArray()
        );
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function locations(int $userId): array
    {
        return Cache::remember(
            self::locationsKey($userId),
            self::TTL,
            fn () => Location::where('user_id', $userId)->orderBy('name')->get()->toArray()
        );
    }

    /**
     * @return array<int, array{id: mixed, name: string}>
     */
    public static function locationsForSelect(int $userId): array
    {
        return Cache::remember(
            self::locationsKey($userId).':select',
            self::TTL,
            fn () => Location::where('user_id', $userId)->orderBy('name')->get(['id', 'name'])->toArray()
        );
    }

    /**
     * @return array<int, array{id: mixed, name: string}>
     */
    public static function categoriesForSelect(int $userId): array
    {
        return Cache::remember(
            self::categoriesKey($userId).':select',
            self::TTL,
            fn () => Category::where('user_id', $userId)->orderBy('name')->get(['id', 'name'])->toArray()
        );
    }

    // --- Invalidators ---

    public static function forgetCategories(int $userId): void
    {
        Cache::forget(self::categoriesKey($userId));
        Cache::forget(self::categoriesKey($userId).':select');
    }

    public static function forgetTags(int $userId): void
    {
        Cache::forget(self::tagsKey($userId));
    }

    public static function forgetLocations(int $userId): void
    {
        Cache::forget(self::locationsKey($userId));
        Cache::forget(self::locationsKey($userId).':select');
    }
}
