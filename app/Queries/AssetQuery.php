<?php

namespace App\Queries;

use App\Models\Asset;
use App\Models\UserViewPreference;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class AssetQuery
{
    private const DEFAULT_SORT = 'created_at';

    private const DEFAULT_ORDER = 'desc';

    private const RESOURCE_KEY = 'assets.index';

    private const COLUMNS_PREFERENCE_KEY = 'columns';

    /**
     * @var array<int, string>
     */
    private const ALLOWED_SORTS = ['name', 'asset_id', 'status', 'value', 'created_at'];

    /**
     * @var array<int, int>
     */
    private const ALLOWED_PER_PAGE = [20, 50, 100];

    public function handle(Request $request): Builder
    {
        $indexState = $this->resolveIndexState($request);

        return Asset::query()
            ->with([
                'category:id,name',
                'location:id,name',
                'tags:id,name',
            ])
            ->when($request->input('search'), function (Builder $query, string $search): void {
                $query->where(function (Builder $searchQuery) use ($search): void {
                    $searchQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('asset_id', 'like', "%{$search}%");
                });
            })
            ->when($indexState['filters']['status'], fn (Builder $query, string $status) => $query->where('status', '=', $status))
            ->when($indexState['filters']['category_id'], fn (Builder $query, string $categoryId) => $query->where('category_id', '=', $categoryId))
            ->when($indexState['filters']['location_id'], fn (Builder $query, string $locationId) => $query->where('location_id', '=', $locationId))
            ->when($indexState['filters']['asset_id'], fn (Builder $query, string $assetId) => $query->where('asset_id', 'like', "%{$assetId}%"))
            ->when($indexState['filters']['value_min'], fn (Builder $query, string $valueMin) => $query->where('value', '>=', $valueMin))
            ->when($indexState['filters']['value_max'], fn (Builder $query, string $valueMax) => $query->where('value', '<=', $valueMax))
            ->tap(function (Builder $query) use ($indexState): void {
                foreach ($indexState['sorts'] as $sortConfig) {
                    $query->orderBy($sortConfig['field'], $sortConfig['order']);
                }
            });
    }

    /**
     * @return array{
     *     sort: string,
     *     order: string,
     *     perPage: int,
     *     filters: array<string, string|null>,
     *     sorts: array<int, array{field: string, order: string}>
     * }
     */
    public function resolveIndexState(Request $request): array
    {
        $sort = $request->input('sort', self::DEFAULT_SORT);
        $order = strtolower($request->input('order', self::DEFAULT_ORDER));
        $perPage = $request->integer('per_page', self::ALLOWED_PER_PAGE[0]);
        $filters = $this->normalizeFilters($request->only([
            'status',
            'category_id',
            'location_id',
            'asset_id',
            'value_min',
            'value_max',
        ]));

        if (! in_array($sort, self::ALLOWED_SORTS, true)) {
            $sort = self::DEFAULT_SORT;
        }

        if (! in_array($perPage, self::ALLOWED_PER_PAGE, true)) {
            $perPage = self::ALLOWED_PER_PAGE[0];
        }

        if (! in_array($order, ['asc', 'desc'], true)) {
            $order = self::DEFAULT_ORDER;
        }

        return [
            'sort' => $sort,
            'order' => $order,
            'perPage' => $perPage,
            'filters' => $filters,
            'sorts' => $this->normalizeSorts((string) $request->input('sorts', ''), $sort, $order),
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, string|null>
     */
    public function normalizeFilters(array $filters): array
    {
        $valueMin = $filters['value_min'] ?? null;
        $valueMax = $filters['value_max'] ?? null;

        return [
            'status' => $this->normalizeStringFilter($filters['status'] ?? null),
            'category_id' => $this->normalizeIdFilter($filters['category_id'] ?? null),
            'location_id' => $this->normalizeIdFilter($filters['location_id'] ?? null),
            'asset_id' => $this->normalizeStringFilter($filters['asset_id'] ?? null),
            'value_min' => is_numeric($valueMin) ? (string) $valueMin : null,
            'value_max' => is_numeric($valueMax) ? (string) $valueMax : null,
        ];
    }

    /**
     * @return array<int, array{id: int, key: string, name: string, filters: array<string, string|null>}>
     */
    public function loadSavedFilters(Request $request): array
    {
        return $request->user()
            ->viewPreferences()
            ->where('resource', self::RESOURCE_KEY)
            ->where('key', '!=', self::COLUMNS_PREFERENCE_KEY)
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get()
            ->map(fn (UserViewPreference $preference) => [
                'id' => $preference->id,
                'key' => $preference->key,
                'name' => $preference->name,
                'filters' => $this->normalizeFilters($preference->settings['filters'] ?? []),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{key: string, visible: bool}>
     */
    public function loadColumnPreference(Request $request): array
    {
        $preference = $request->user()
            ->viewPreferences()
            ->where('resource', self::RESOURCE_KEY)
            ->where('key', self::COLUMNS_PREFERENCE_KEY)
            ->first();

        return $this->normalizeAssetColumnPreferences($preference?->settings['columns'] ?? []);
    }

    /**
     * @return array<int, array{key: string, visible: bool}>
     */
    public function normalizeAssetColumnPreferences(mixed $columns): array
    {
        $defaults = [
            'asset_id',
            'status',
            'category',
            'location',
            'tags',
            'description',
            'value',
            'created_at',
            'updated_at',
            'actions',
        ];

        if (! is_array($columns)) {
            return array_map(fn (string $key) => ['key' => $key, 'visible' => true], $defaults);
        }

        $normalized = [];

        foreach ($columns as $column) {
            if (! is_array($column)) {
                continue;
            }

            $key = $column['key'] ?? null;

            if (! is_string($key) || ! in_array($key, $defaults, true) || array_key_exists($key, $normalized)) {
                continue;
            }

            $normalized[$key] = [
                'key' => $key,
                'visible' => (bool) ($column['visible'] ?? false),
            ];
        }

        foreach ($defaults as $key) {
            if (! array_key_exists($key, $normalized)) {
                $normalized[$key] = [
                    'key' => $key,
                    'visible' => true,
                ];
            }
        }

        return array_values($normalized);
    }

    private function normalizeStringFilter(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $normalized = trim($value);

        return $normalized !== '' ? $normalized : null;
    }

    private function normalizeIdFilter(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (! is_numeric($value)) {
            return null;
        }

        return (string) (int) $value;
    }

    /**
     * @return array<int, array{field: string, order: string}>
     */
    private function normalizeSorts(string $sorts, string $fallbackSort, string $fallbackOrder): array
    {
        $normalizedSorts = [];

        foreach (array_filter(array_map('trim', explode(',', $sorts))) as $sortEntry) {
            [$field, $direction] = array_pad(explode(':', $sortEntry, 2), 2, null);

            if (! is_string($field) || ! in_array($field, self::ALLOWED_SORTS, true)) {
                continue;
            }

            $normalizedSorts[] = [
                'field' => $field,
                'order' => is_string($direction) && in_array(strtolower($direction), ['asc', 'desc'], true)
                    ? strtolower($direction)
                    : self::DEFAULT_ORDER,
            ];
        }

        if ($normalizedSorts !== []) {
            return $normalizedSorts;
        }

        return [[
            'field' => $fallbackSort,
            'order' => $fallbackOrder,
        ]];
    }
}
