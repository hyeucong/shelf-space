<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Tag;
use App\Queries\AssetQuery;
use App\Services\UserResourceCache;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AssetController extends Controller
{
    /**
     * @return array{categories: array<int, mixed>, tags: array<int, mixed>, locations: array<int, mixed>}
     */
    private function assetFormOptions(Request $request): array
    {
        $userId = $request->user()->id;

        return [
            'categories' => UserResourceCache::categories($userId),
            'tags' => UserResourceCache::tags($userId),
            'locations' => UserResourceCache::locations($userId),
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
            'status' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'tags.*' => [
                'nullable',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    // Just verify it's a number or a valid string.
                    // We let resolveTagIds() securely handle the DB relationship later.
                    if (! is_numeric($value) && (! is_string($value) || trim($value) === '')) {
                        $fail('Each tag must be a valid ID or a non-empty name.');
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
        $userId = $request->user()->id;
        $allTags = UserResourceCache::tags($userId);

        $numericTags = array_filter($tags, 'is_numeric');
        $stringTags = array_map('trim', array_filter($tags, fn ($tag) => is_string($tag) && trim($tag) !== ''));

        $tagIds = [];
        $existingNamesMap = []; // lowercase name => id
        $existingIds = [];

        foreach ($allTags as $t) {
            $existingNamesMap[strtolower($t['name'])] = $t['id'];
            $existingIds[] = (string) $t['id'];
        }

        // 1. Add IDs that are valid for this user
        foreach ($numericTags as $id) {
            if (in_array((string) $id, $existingIds)) {
                $tagIds[] = $id;
            }
        }

        // 2. Add names if they exist, or create new ones
        foreach ($stringTags as $name) {
            $lowerName = strtolower($name);
            if (isset($existingNamesMap[$lowerName])) {
                $tagIds[] = $existingNamesMap[$lowerName];
            } else {
                $tag = Tag::create([
                    'user_id' => $userId,
                    'name' => $name,
                ]);
                $tagIds[] = $tag->id;
            }
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
            'categories' => UserResourceCache::categoriesForSelect($request->user()->id),
            'locations' => UserResourceCache::locationsForSelect($request->user()->id),
            'tags' => UserResourceCache::tagsForSelect($request->user()->id),
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
            ...$this->assetFormOptions($request),
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
            // Inside the store method's DB::transaction block
            $lastAsset = Asset::where('user_id', $userId)
                ->lockForUpdate()
                ->orderBy('sequential_number', 'desc')
                ->first();

            $lastSeq = $lastAsset ? $lastAsset->sequential_number : 0;
            $nextSeq = $lastSeq + 1;

            $prefix = 'AST';

            // We use the next sequence regardless of what the frontend sent,
            // but we ensure it matches the format the user expects.
            $validated['asset_id'] = $prefix.'-'.str_pad($nextSeq, 4, '0', STR_PAD_LEFT);
            $validated['sequential_number'] = $nextSeq;

            $validated['user_id'] = $userId;

            return Asset::create($validated);
        });

        $tagIds = $this->resolveTagIds($request, $tags);

        if (! empty($tagIds)) {
            $asset->tags()->sync(array_values(array_unique($tagIds)));
        }

        return redirect()->route('assets.index')->with('success', 'Asset created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Asset $asset)
    {
        Gate::authorize('view', $asset);

        // 1. Core Data: Loads instantly for the "Overview" tab
        $asset->load([
            'category:id,name',
            'location:id,name',
            'tags:id,name',
        ]);

        return Inertia::render('assets/overview', [
            'asset' => $asset,

            // v3 Standard: Replaces lazy(). Only loads when explicitly requested by router.reload()
            'activities' => Inertia::optional(fn () => $asset->activities()->latest()->get()),
            'reminders' => Inertia::optional(fn () => $asset->reminders()->get()),
        ]);
    }

    // booking removed

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Asset $asset)
    {
        Gate::authorize('update', $asset);

        return Inertia::render('assets/edit', [
            'asset' => $this->assetFormData($asset),
            ...$this->assetFormOptions($request),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Asset $asset)
    {
        Gate::authorize('update', $asset);

        $validated = $this->validateAssetPayload($request, $asset);

        $tags = $validated['tags'] ?? [];
        unset($validated['tags'], $validated['asset_id']);

        $asset->update($validated);
        $asset->tags()->sync($this->resolveTagIds($request, $tags));

        return redirect()->route('assets.index')->with('success', 'Asset updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Asset $asset)
    {
        Gate::authorize('delete', $asset);

        $asset->delete();

        return redirect()->route('assets.index')->with('success', 'Asset deleted successfully.');
    }

    public function selectDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'string'],
        ]);

        $request->user()->assets()->whereIn('id', $validated['ids'])->delete();

        return redirect()->route('assets.index')->with('success', 'Selected assets deleted successfully.');
    }

    /**
     * Update the status of the specified resource.
     */
    public function updateStatus(Request $request, Asset $asset)
    {
        Gate::authorize('update', $asset);

        $validated = $request->validate([
            'status' => ['required', 'string', 'max:255'],
        ]);

        $asset->update($validated);

        return back()->with('success', 'Status updated successfully.');
    }

    public function duplicate(Request $request, Asset $asset)
    {
        Gate::authorize('view', $asset);

        // 1. Validate that the count is a number between 1 and 10
        $request->validate([
            'count' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        $count = (int) $request->input('count');
        $userId = $request->user()->id;

        // 3. Database Transaction: All-or-nothing protection
        DB::transaction(function () use ($asset, $count, $userId) {
            // Lock the sequence to prevent other requests from grabbing the same number
            $lastAsset = Asset::where('user_id', $userId)
                ->orderBy('sequential_number', 'desc')
                ->lockForUpdate()
                ->first();

            $lastSeq = $lastAsset ? $lastAsset->sequential_number : 0;

            // Load the tag IDs from the original so we can copy them
            $asset->loadMissing('tags:id');
            $tagIds = $asset->tags->modelKeys();

            for ($i = 1; $i <= $count; $i++) {
                $nextSeq = $lastSeq + $i;

                // replicate() creates a fresh copy of the model without an ID
                $clone = $asset->replicate();

                // Customize the new item
                $clone->name = $asset->name." (Copy {$i})";
                $clone->sequential_number = $nextSeq;

                // Format the custom AST ID just like in your store method[cite: 2]
                $clone->asset_id = 'AST-'.str_pad($nextSeq, 4, '0', STR_PAD_LEFT);

                $clone->save();

                // Sync the many-to-many tags to the new clone
                if (! empty($tagIds)) {
                    $clone->tags()->sync($tagIds);
                }
            }
        });

        return redirect()->route('assets.index')->with('success', "Successfully created {$count} duplicates.");
    }

    public function selectUpdateTags(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'string'],
            'tag_id' => ['nullable', 'string', 'exists:tags,id'],
        ]);

        DB::transaction(function () use ($validated) {
            // 1. Remove all existing tag relationships for these assets in one query
            DB::table('asset_tag')->whereIn('asset_id', $validated['ids'])->delete();

            // 2. If a tag was selected, attach it to all assets in one query
            if ($validated['tag_id']) {
                $insertData = array_map(fn ($assetId) => [
                    'asset_id' => $assetId,
                    'tag_id' => $validated['tag_id'],
                ], $validated['ids']);

                DB::table('asset_tag')->insert($insertData);
            }
        });

        return back()->with('success', 'Selected tags updated successfully.');
    }

    public function selectUpdateCategory(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'string'],
            'category_id' => ['nullable', 'string', 'exists:categories,id'],
        ]);

        $request->user()->assets()
            ->whereIn('id', $validated['ids'])
            ->update(['category_id' => $validated['category_id']]);

        return back()->with('success', 'Selected category updated successfully.');
    }
}
