<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Category;
use App\Models\Location;
use App\Models\Tag;
use App\Models\UserViewPreference;
use App\Queries\AssetQuery;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AssetController extends Controller
{
    private const RESOURCE_KEY = 'assets.index';

    private const COLUMNS_PREFERENCE_KEY = 'columns';

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, AssetQuery $assetQuery)
    {
        $indexState = $assetQuery->resolveIndexState($request);
        $assets = $assetQuery->handle($request)
            ->paginate($indexState['perPage'])
            ->withQueryString();
        $savedFilters = $this->loadSavedFilters($request, $assetQuery);

        return Inertia::render('assets/index', $this->buildAssetIndexProps(
            $request,
            $assets,
            $indexState,
            $savedFilters,
        ));
    }

    public function storeSavedFilter(Request $request, AssetQuery $assetQuery)
    {
        $validated = $this->validateSavedFilterPayload($request);

        $filters = $assetQuery->normalizeFilters($validated['filters']);
        $key = $this->generateSavedFilterKey($request, trim($validated['name']));

        UserViewPreference::create([
            'user_id' => $request->user()->id,
            'resource' => self::RESOURCE_KEY,
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

    public function storeLayout(Request $request)
    {
        $validated = $request->validate([
            'columns' => ['required', 'array'],
            'columns.*.key' => ['required', 'string', Rule::in(['id', 'asset_id', 'status', 'category', 'location', 'tags', 'description', 'value', 'created_at', 'updated_at'])],
            'columns.*.visible' => ['required', 'boolean'],
        ]);

        $columns = $this->normalizeAssetColumnPreferences($validated['columns']);

        UserViewPreference::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'resource' => self::RESOURCE_KEY,
                'key' => self::COLUMNS_PREFERENCE_KEY,
            ],
            [
                'name' => 'Layout',
                'settings' => [
                    'columns' => $columns,
                ],
            ],
        );

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

    /**
     * @return array<int, array{id: int, key: string, name: string, filters: array<string, string|null>}>
     */
    private function loadSavedFilters(Request $request, AssetQuery $assetQuery): array
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
                'filters' => $assetQuery->normalizeFilters($preference->settings['filters'] ?? []),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{key: string, visible: bool}>
     */
    private function loadColumnPreference(Request $request): array
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
    private function normalizeAssetColumnPreferences(mixed $columns): array
    {
        $defaults = [
            'id',
            'asset_id',
            'status',
            'category',
            'location',
            'tags',
            'description',
            'value',
            'created_at',
            'updated_at',
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
            'columnPreferences' => $this->loadColumnPreference($request),
        ];
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

        $reminders = $asset->reminders()
            ->latest('remind_at')
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('assets/reminders', [
            'asset' => $asset,
            'reminders' => $reminders,
        ]);
    }

    public function storeReminder(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'remind_at' => ['required', 'date'],
        ]);

        $asset->reminders()->create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'description' => $validated['description'],
            'remind_at' => $validated['remind_at'],
            'status' => 'pending',
        ]);

        return redirect()->route('assets.reminders', $asset);
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
