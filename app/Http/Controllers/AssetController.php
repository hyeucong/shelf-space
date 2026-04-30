<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Category;
use App\Models\Location;
use App\Models\Tag;
use App\Queries\AssetQuery;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AssetController extends Controller
{
    /**
     * @return array{categories: Collection<int, Category>, tags: Collection<int, Tag>, locations: Collection<int, Location>}
     */
    private function assetFormOptions(): array
    {
        return [
            'categories' => Category::query()->orderBy('name')->get(),
            'tags' => Tag::query()->orderBy('name')->get(),
            'locations' => Location::query()->orderBy('name')->get(),
        ];
    }

    /**
     * @return array{id: string, asset_id: string, name: string, description: string|null, value: mixed, category_id: int|null, location_id: int|null, tags: array<int, int>}
     */
    private function assetFormData(Asset $asset): array
    {
        $asset->loadMissing('tags:id');

        return [
            'id' => $asset->id,
            'asset_id' => $asset->asset_id,
            'name' => $asset->name,
            'description' => $asset->description,
            'value' => $asset->value,
            'category_id' => $asset->category_id,
            'location_id' => $asset->location_id,
            'tags' => $asset->tags->modelKeys(),
        ];
    }

    /**
     * @return array{name: string, asset_id: string, value: float|int|string|null, category_id?: int|string|null, location_id?: int|string|null, description?: string|null, tags?: array<int, mixed>}
     */
    private function validateAssetPayload(Request $request, ?Asset $asset = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'asset_id' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('assets', 'asset_id')
                    ->where(fn ($query) => $query->where('user_id', $request->user()->id))
                    ->when($asset !== null, fn ($rule) => $rule->ignore($asset->id)),
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
    }

    /**
     * @param  array<int, mixed>  $tags
     * @return array<int, int>
     */
    private function resolveTagIds(Request $request, array $tags): array
    {
        $tagIds = [];

        foreach ($tags as $tagValue) {
            if (is_numeric($tagValue)) {
                $tagIds[] = (int) $tagValue;

                continue;
            }

            if (! is_string($tagValue) || trim($tagValue) === '') {
                continue;
            }

            $tag = Tag::firstOrCreate([
                'user_id' => $request->user()->id,
                'name' => trim($tagValue),
            ]);

            $tagIds[] = $tag->id;
        }

        return array_values(array_unique($tagIds));
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, AssetQuery $assetQuery)
    {
        $indexState = $assetQuery->resolveIndexState($request);
        $assets = $assetQuery->handle($request)
            ->paginate($indexState['perPage'])
            ->withQueryString();

        return Inertia::render('assets/index', $this->buildAssetIndexProps(
            $request,
            $assetQuery,
            $assets,
            $indexState,
        ));
    }

    /**
     * @param  array{
     *     sort: string,
     *     order: string,
     *     perPage: int,
     *     filters: array<string, string|null>,
     *     sorts: array<int, array{field: string, order: string}>
     * }  $indexState
     * @return array<string, mixed>
     */
    private function buildAssetIndexProps(Request $request, AssetQuery $assetQuery, LengthAwarePaginator $assets, array $indexState): array
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
            'savedFilters' => $assetQuery->loadSavedFilters($request),
            'columnPreferences' => $assetQuery->loadColumnPreference($request),
        ];
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $lastSeq = Asset::where('user_id', $request->user()->id)->max('sequential_number') ?? 0;
        $nextSeq = $lastSeq + 1;

        return Inertia::render('assets/create', [
            ...$this->assetFormOptions(),
            'next_id' => str_pad($nextSeq, 4, '0', STR_PAD_LEFT),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $this->validateAssetPayload($request);

        $tags = $validated['tags'] ?? [];
        unset($validated['tags']);

        $asset = DB::transaction(function () use ($validated, $request) {
            $userId = $request->user()->id;
            
            // Re-calculate the next sequential number to ensure accuracy and handle collisions
            $lastSeq = Asset::where('user_id', $userId)->lockForUpdate()->max('sequential_number') ?? 0;
            $nextSeq = $lastSeq + 1;
            
            $prefix = 'AST';
            
            // We use the next sequence regardless of what the frontend sent, 
            // but we ensure it matches the format the user expects.
            $validated['asset_id'] = $prefix . '-' . str_pad($nextSeq, 4, '0', STR_PAD_LEFT);
            $validated['sequential_number'] = $nextSeq;

            $validated['user_id'] = $userId;

            return Asset::create($validated);
        });

        $tagIds = $this->resolveTagIds($request, $tags);

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
            'location:id,name,latitude,longitude',
            'tags:id,name',
        ]);

        return Inertia::render('assets/overview', [
            'asset' => $asset,
        ]);
    }

    // booking removed

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Asset $asset)
    {
        return Inertia::render('assets/edit', [
            'asset' => $this->assetFormData($asset),
            ...$this->assetFormOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Asset $asset)
    {
        $validated = $this->validateAssetPayload($request, $asset);

        $tags = $validated['tags'] ?? [];
        unset($validated['tags'], $validated['asset_id']);

        $asset->update($validated);
        $asset->tags()->sync($this->resolveTagIds($request, $tags));

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
