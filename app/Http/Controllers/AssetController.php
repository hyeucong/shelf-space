<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Category;
use App\Models\Location;
use App\Models\Tag;
use App\Models\UserViewPreference;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AssetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $indexState = $this->resolveIndexState($request);
        $assets = $this->buildAssetIndexQuery($request, $indexState['filters'], $indexState['sorts'])
            ->paginate($indexState['perPage'])
            ->withQueryString();
        $savedFilters = $this->loadSavedFilters($request);

        return Inertia::render('assets/index', $this->buildAssetIndexProps(
            $request,
            $assets,
            $indexState,
            $savedFilters,
        ));
    }

    public function storeSavedFilter(Request $request)
    {
        $validated = $this->validateSavedFilterPayload($request);

        $filters = $this->normalizeAssetFilters($validated['filters']);
        $key = $this->generateSavedFilterKey($request, trim($validated['name']));

        UserViewPreference::create([
            'user_id' => $request->user()->id,
            'resource' => 'assets.index',
            'key' => $key,
            'name' => trim($validated['name']),
            'settings' => [
                'filters' => $filters,
            ],
        ]);

        return back();
    }

    public function updateSavedFilter(Request $request, UserViewPreference $savedFilter)
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

    public function destroySavedFilter(Request $request, UserViewPreference $savedFilter)
    {
        $savedFilter = $this->resolveSavedFilter($request, $savedFilter);
        $savedFilter->delete();

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
                && $savedFilter->resource === 'assets.index',
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
            ->where('resource', 'assets.index')
            ->when($ignoreId !== null, fn (Builder $query) => $query->whereKeyNot($ignoreId))
            ->where('key', $key)
            ->exists()) {
            $key = $baseKey.'-'.$counter++;
        }

        return $key;
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, string|null>
     */
    private function normalizeAssetFilters(array $filters): array
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
     * @return array{
     *     sort: string,
     *     order: string,
     *     perPage: int,
     *     filters: array<string, string|null>,
     *     sorts: array<int, array{field: string, order: string}>
     * }
     */
    private function resolveIndexState(Request $request): array
    {
        $sort = $request->input('sort', 'created_at');
        $order = strtolower($request->input('order', 'desc'));
        $perPage = $request->integer('per_page', 20);
        $filters = $this->normalizeAssetFilters($request->only([
            'status',
            'category_id',
            'location_id',
            'asset_id',
            'value_min',
            'value_max',
        ]));

        $allowedSorts = ['name', 'asset_id', 'status', 'value', 'created_at'];

        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }

        if (! in_array($perPage, [20, 50, 100], true)) {
            $perPage = 20;
        }

        if (! in_array($order, ['asc', 'desc'], true)) {
            $order = 'desc';
        }

        return [
            'sort' => $sort,
            'order' => $order,
            'perPage' => $perPage,
            'filters' => $filters,
            'sorts' => $this->normalizeAssetSorts((string) $request->input('sorts', ''), $sort, $order, $allowedSorts),
        ];
    }

    /**
     * @param  array<string, string|null>  $filters
     * @param  array<int, array{field: string, order: string}>  $sorts
     */
    private function buildAssetIndexQuery(Request $request, array $filters, array $sorts): Builder
    {
        $query = Asset::query()
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
            ->when($filters['status'], fn (Builder $query, string $status) => $query->where('status', '=', $status))
            ->when($filters['category_id'], fn (Builder $query, string $categoryId) => $query->where('category_id', '=', $categoryId))
            ->when($filters['location_id'], fn (Builder $query, string $locationId) => $query->where('location_id', '=', $locationId))
            ->when($filters['asset_id'], fn (Builder $query, string $assetId) => $query->where('asset_id', 'like', "%{$assetId}%"))
            ->when($filters['value_min'], fn (Builder $query, string $valueMin) => $query->where('value', '>=', $valueMin))
            ->when($filters['value_max'], fn (Builder $query, string $valueMax) => $query->where('value', '<=', $valueMax));

        foreach ($sorts as $sortConfig) {
            $query->orderBy($sortConfig['field'], $sortConfig['order']);
        }

        return $query;
    }

    /**
     * @return array<int, array{id: int, key: string, name: string, filters: array<string, string|null>}>
     */
    private function loadSavedFilters(Request $request): array
    {
        return $request->user()
            ->viewPreferences()
            ->where('resource', 'assets.index')
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get()
            ->map(fn (UserViewPreference $preference) => [
                'id' => $preference->id,
                'key' => $preference->key,
                'name' => $preference->name,
                'filters' => $this->normalizeAssetFilters($preference->settings['filters'] ?? []),
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array{
     *     sort: string,
     *     order: string,
     *     perPage: int,
     *     filters: array<string, string|null>,
     *     sorts: array<int, array{field: string, order: string}>
     * }  $indexState
     * @param  array<int, array{id: int, key: string, name: string, filters: array<string, string|null>}>  $savedFilters
     * @return array<string, mixed>
     */
    private function buildAssetIndexProps(Request $request, LengthAwarePaginator $assets, array $indexState, array $savedFilters): array
    {
        return [
            'assets' => $assets,
            'filters' => [
                'search' => $request->input('search'),
                'per_page' => $indexState['perPage'],
                'sort' => $indexState['sort'],
                'order' => $indexState['order'],
                'sorts' => $request->input('sorts'),
                ...$indexState['filters'],
            ],
            'sorts' => $indexState['sorts'],
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'locations' => Location::query()->orderBy('name')->get(['id', 'name']),
            'savedFilters' => $savedFilters,
        ];
    }

    /**
     * @param  array<int, string>  $allowedSorts
     * @return array<int, array{field: string, order: string}>
     */
    private function normalizeAssetSorts(string $sorts, string $fallbackSort, string $fallbackOrder, array $allowedSorts): array
    {
        $normalizedSorts = [];

        foreach (array_filter(array_map('trim', explode(',', $sorts))) as $sortEntry) {
            [$field, $direction] = array_pad(explode(':', $sortEntry, 2), 2, null);

            if (! is_string($field) || ! in_array($field, $allowedSorts, true)) {
                continue;
            }

            $direction = is_string($direction) && in_array(strtolower($direction), ['asc', 'desc'], true)
                ? strtolower($direction)
                : 'desc';

            $normalizedSorts[] = [
                'field' => $field,
                'order' => $direction,
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

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::orderBy('name')->get();
        $tags = Tag::orderBy('name')->get();
        $locations = Location::orderBy('name')->get();

        return Inertia::render('assets/create', [
            'categories' => $categories,
            'tags' => $tags,
            'locations' => $locations,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'asset_id' => [
                'required',
                'string',
                'max:255',
                Rule::unique('assets', 'asset_id')->where(fn ($query) => $query->where('user_id', $request->user()->id)),
            ],
            'value' => ['nullable', 'numeric', 'min:0'],
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where(fn ($query) => $query->where('user_id', $request->user()->id)),
            ],
            'location_id' => [
                'nullable',
                Rule::exists('locations', 'id')->where(fn ($query) => $query->where('user_id', $request->user()->id)),
            ],
            'description' => ['nullable', 'string'],
            'tags' => ['nullable', 'array'],
            'tags.*' => [
                'nullable',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (is_numeric($value)) {
                        if (! Tag::query()->whereKey((int) $value)->exists()) {
                            $fail('The selected tag is invalid.');
                        }

                        return;
                    }

                    if (! is_string($value) || trim($value) === '') {
                        $fail('Each tag must be an existing tag ID or a non-empty tag name.');
                    }
                },
            ],
        ]);

        $tags = $validated['tags'] ?? [];
        unset($validated['tags']);

        $asset = Asset::create($validated);

        // Attach tags (accept tag ids or names)
        $tagIds = [];
        foreach ($tags as $t) {
            if (is_numeric($t)) {
                $tagIds[] = (int) $t;

                continue;
            }

            if (! is_string($t) || trim($t) === '') {
                continue;
            }

            $tag = Tag::firstOrCreate([
                'user_id' => $request->user()->id,
                'name' => trim($t),
            ]);
            $tagIds[] = $tag->id;
        }

        if (! empty($tagIds)) {
            $asset->tags()->sync(array_values(array_unique($tagIds)));
        }

        return redirect()->route('assets.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Asset $asset)
    {
        $asset->load([
            'category:id,name',
            'location:id,name',
            'tags:id,name',
        ]);

        return Inertia::render('assets/overview', [
            'asset' => $asset,
        ]);
    }

    /**
     * Display activity for the specified asset (temporary page).
     */
    public function activity(Asset $asset)
    {
        $asset->load([
            'category:id,name',
            'location:id,name',
            'tags:id,name',
        ]);

        return Inertia::render('assets/activity', [
            'asset' => $asset,
        ]);
    }

    // booking removed

    /**
     * Display reminders for the specified asset (temporary page).
     */
    public function reminders(Asset $asset)
    {
        $asset->load([
            'category:id,name',
            'location:id,name',
            'tags:id,name',
        ]);

        return Inertia::render('assets/reminders', [
            'asset' => $asset,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Asset $asset)
    {
        return Inertia::render('assets/edit', [
            'asset' => $asset,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'asset_id' => [
                'required',
                'string',
                'max:255',
                Rule::unique('assets', 'asset_id')
                    ->where(fn ($query) => $query->where('user_id', $request->user()->id))
                    ->ignore($asset->id),
            ],
            'value' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        $asset->update($validated);

        return redirect()->route('assets.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Asset $asset)
    {
        $asset->delete();

        return redirect()->route('assets.index');
    }
}
