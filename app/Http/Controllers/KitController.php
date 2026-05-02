<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Kit;
use App\Queries\AssetQuery;
use App\Services\UserResourceCache;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class KitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');
        $perPage = $request->integer('per_page', 20);

        $allowedSorts = ['name', 'status', 'created_at'];
        if (! in_array($sort, $allowedSorts)) {
            $sort = 'created_at';
        }

        if (! in_array($perPage, [20, 50, 100], true)) {
            $perPage = 20;
        }

        $order = in_array(strtolower($order), ['asc', 'desc']) ? $order : 'desc';

        $kits = $request->user()->kits()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy($sort, $order)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('kits/index', [
            'kits' => $kits,
            'filters' => [
                'search' => $request->input('search'),
                'per_page' => $perPage,
                'sort' => $sort,
                'order' => $order,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $categories = UserResourceCache::categoriesForSelect($request->user()->id);
        $locations = UserResourceCache::locationsForSelect($request->user()->id);

        return Inertia::render('kits/create', [
            'categories' => $categories,
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
            'description' => ['nullable', 'string'],
        ]);

        $kit = Kit::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        return redirect()->route('kits.index')->with('success', 'Kit created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Kit $kit)
    {
        Gate::authorize('view', $kit);

        return Inertia::render('kits/overview', [
            'kit' => $kit,
        ]);
    }

    public function assets(Request $request, Kit $kit, AssetQuery $assetQuery)
    {
        Gate::authorize('view', $kit);

        $indexState = $assetQuery->resolveIndexState($request);

        $assets = $assetQuery->handle($request)
            ->where('kit_id', $kit->id)
            ->paginate($indexState['perPage'])
            ->withQueryString();

        return Inertia::render('kits/assets', [
            'kit' => $kit,
            'assets' => $assets,
            'filters' => [
                'search' => $request->input('search'),
                'per_page' => $indexState['perPage'],
                'sort' => $indexState['sort'],
                'order' => $indexState['order'],
                ...$indexState['filters'],
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Kit $kit)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Kit $kit)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Kit $kit)
    {
        Gate::authorize('delete', $kit);

        $kit->assets()->update(['kit_id' => null]);
        $kit->delete();

        return redirect()->route('kits.index')->with('success', 'Kit deleted successfully.');
    }

    public function selectDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'string'],
        ]);

        Asset::query()
            ->whereIn('kit_id', $validated['ids'])
            ->update(['kit_id' => null]);

        $request->user()->kits()->whereIn('id', $validated['ids'])->delete();

        return redirect()->route('kits.index')->with('success', 'Selected kits deleted successfully.');
    }

    public function duplicate(Request $request, Kit $kit)
    {
        Gate::authorize('view', $kit);

        $request->validate([
            'count' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        $count = (int) $request->input('count');

        for ($i = 1; $i <= $count; $i++) {
            $clone = $kit->replicate();
            $clone->name = $kit->name." (Copy {$i})";
            $clone->save();
        }

        return redirect()->route('kits.index')->with('success', "Successfully created {$count} duplicates.");
    }



    public function addAssets(Request $request, Kit $kit, AssetQuery $assetQuery)
    {
        Gate::authorize('update', $kit);

        $indexState = $assetQuery->resolveIndexState($request);
        $assets = $assetQuery->handle($request)
            ->paginate($indexState['perPage'])
            ->withQueryString();

        $existingAssetIds = $kit->assets()->pluck('id')->all();

        return Inertia::render('kits/add-assets', [
            'kit' => $kit,
            'existingAssetIds' => $existingAssetIds,
            ...$this->buildAssetIndexProps($request, $assetQuery, $assets, $indexState),
        ]);
    }

    public function storeAssets(Request $request, Kit $kit)
    {
        Gate::authorize('update', $kit);

        $validated = $request->validate([
            'asset_ids' => ['present', 'array'],
            'asset_ids.*' => ['required', 'string'],
            'force' => ['nullable', 'boolean'],
        ]);

        if (! $request->boolean('force') && ! empty($validated['asset_ids'])) {
            $conflictsCount = Asset::query()
                ->where('user_id', $request->user()->id)
                ->whereIn('id', $validated['asset_ids'])
                ->whereNotNull('kit_id')
                ->where('kit_id', '!=', $kit->id)
                ->count();

            if ($conflictsCount > 0) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'conflicts' => $conflictsCount,
                ]);
            }
        }

        // Clear existing kit assignments and set new ones
        Asset::query()
            ->where('user_id', $request->user()->id)
            ->where('kit_id', $kit->id)
            ->update(['kit_id' => null]);

        Asset::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('id', $validated['asset_ids'])
            ->update(['kit_id' => $kit->id]);

        return redirect()->route('kits.assets', $kit);
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
            'savedFilters' => $assetQuery->loadSavedFilters($request),
            'columnPreferences' => $assetQuery->loadColumnPreference($request),
        ];
    }
    /**
     * Update the status of the specified resource.
     */
    public function updateStatus(Request $request, Kit $kit)
    {
        Gate::authorize('update', $kit);

        $validated = $request->validate([
            'status' => ['required', 'string', 'max:255'],
        ]);

        $kit->update($validated);

        // Also update all assets in this kit
        $kit->assets()->update(['status' => $validated['status']]);

        return back()->with('success', 'Kit and associated assets status updated successfully.');
    }
}
