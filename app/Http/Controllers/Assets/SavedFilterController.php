<?php

namespace App\Http\Controllers\Assets;

use App\Http\Controllers\Controller;
use App\Models\UserViewPreference;
use App\Queries\AssetQuery;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SavedFilterController extends Controller
{
    private const RESOURCE_KEY = 'assets.index';

    private const COLUMNS_PREFERENCE_KEY = 'columns';

    public function store(Request $request, AssetQuery $assetQuery)
    {
        $validated = $this->validateSavedFilterPayload($request);

        $filters = $assetQuery->normalizeFilters($validated['filters']);
        $name = trim($validated['name']);

        UserViewPreference::create([
            'user_id' => $request->user()->id,
            'resource' => self::RESOURCE_KEY,
            'key' => $this->generateSavedFilterKey($request, $name),
            'name' => $name,
            'settings' => [
                'filters' => $filters,
            ],
        ]);

        return back();
    }

    public function update(Request $request, UserViewPreference $savedFilter)
    {
        $savedFilter = $this->resolveSavedFilter($request, $savedFilter);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $name = trim($validated['name']);

        $savedFilter->update([
            'name' => $name,
            'key' => $this->generateSavedFilterKey($request, $name, $savedFilter->id),
        ]);

        return back();
    }

    public function destroy(Request $request, UserViewPreference $savedFilter)
    {
        $this->resolveSavedFilter($request, $savedFilter)->delete();

        return back();
    }

    /**
     * @return array{name: string, filters: array<string, mixed>}
     */
    private function validateSavedFilterPayload(Request $request): array
    {
        /** @var array{name: string, filters: array<string, mixed>} $validated */
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'filters' => ['required', 'array'],
        ]);

        return $validated;
    }

    private function resolveSavedFilter(Request $request, UserViewPreference $savedFilter): UserViewPreference
    {
        abort_unless(
            $savedFilter->user_id === $request->user()->id
                && $savedFilter->resource === self::RESOURCE_KEY
                && $savedFilter->key !== self::COLUMNS_PREFERENCE_KEY,
            404,
        );

        return $savedFilter;
    }

    private function generateSavedFilterKey(Request $request, string $name, ?int $ignoreId = null): string
    {
        $baseKey = Str::slug($name) ?: 'filter';
        $key = $baseKey;
        $counter = 1;

        while (UserViewPreference::query()
            ->where('user_id', $request->user()->id)
            ->where('resource', self::RESOURCE_KEY)
            ->when($ignoreId !== null, fn (Builder $query) => $query->whereKeyNot($ignoreId))
            ->where('key', '!=', self::COLUMNS_PREFERENCE_KEY)
            ->where('key', $key)
            ->exists()) {
            $key = $baseKey.'-'.$counter++;
        }

        return $key;
    }
}
