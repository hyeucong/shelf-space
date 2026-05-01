<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Location;
use App\Queries\AssetQuery;
use App\Services\GeocodingService;
use App\Services\UserResourceCache;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class LocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');
        $perPage = $request->integer('per_page', 20);

        $allowedSorts = ['name', 'created_at'];
        if (! in_array($sort, $allowedSorts)) {
            $sort = 'created_at';
        }

        if (! in_array($perPage, [20, 50, 100], true)) {
            $perPage = 20;
        }

        $order = in_array(strtolower($order), ['asc', 'desc']) ? $order : 'desc';

        $locations = $request->user()->locations()
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($nestedQuery) use ($search) {
                    $nestedQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%");
                });
            })
            ->with('parent:id,name')
            ->withCount('assets')
            ->withCount('children')
            ->orderBy($sort, $order)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('locations/index', [
            'locations' => $locations,
            'parentOptions' => $this->parentOptions($request),
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
        return Inertia::render('locations/create', [
            'parentOptions' => $this->parentOptions($request),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, GeocodingService $geocoding)
    {
        $validated = $this->validatedData($request);

        if (! empty($validated['address'])) {
            $coords = $geocoding->geocode($validated['address']);
            if ($coords) {
                $validated['latitude'] = $coords['lat'];
                $validated['longitude'] = $coords['lon'];
            }
        }

        $validated['user_id'] = $request->user()->id;

        $location = Location::create($validated);

        $redirectTo = $request->string('redirect_to')->toString();
        if ($redirectTo === '' || ! str_starts_with($redirectTo, '/')) {
            $redirectTo = route('locations.index');
        }

        return redirect()->to($redirectTo)->with('createdLocation', [
            'id' => $location->id,
            'name' => $location->name,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Location $location)
    {
        $location->load('parent:id,name')
            ->loadCount(['assets', 'children']);

        return Inertia::render('locations/overview', [
            'location' => $location,
        ]);
    }

    public function assets(Request $request, Location $location, AssetQuery $assetQuery)
    {
        $indexState = $assetQuery->resolveIndexState($request);

        $assets = $assetQuery->handle($request)
            ->where('location_id', $location->id)
            ->paginate($indexState['perPage'])
            ->withQueryString();

        return Inertia::render('locations/assets', [
            'location' => $location,
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

    public function addAssets(Request $request, Location $location, AssetQuery $assetQuery)
    {
        $indexState = $assetQuery->resolveIndexState($request);
        $assets = $assetQuery->handle($request)
            ->paginate($indexState['perPage'])
            ->withQueryString();

        $existingAssetIds = $location->assets()->pluck('id')->all();

        return Inertia::render('locations/add-assets', [
            'location' => $location,
            'existingAssetIds' => $existingAssetIds,
            ...$this->buildAssetIndexProps($request, $assetQuery, $assets, $indexState),
        ]);
    }

    public function storeAssets(Request $request, Location $location)
    {
        $validated = $request->validate([
            'asset_ids' => ['present', 'array'],
            'asset_ids.*' => ['required', 'string'],
        ]);

        // Clear existing location assignments and set new ones
        Asset::query()
            ->where('user_id', $request->user()->id)
            ->where('location_id', $location->id)
            ->update(['location_id' => null]);

        Asset::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('id', $validated['asset_ids'])
            ->update(['location_id' => $location->id]);

        return redirect()->route('locations.assets', $location);
    }

    public function kits(Request $request, Location $location)
    {
        [$sort, $order, $perPage] = $this->resolveKitIndexState($request);

        $kits = $this->buildKitIndexQuery($request, $sort, $order)
            ->where('location_id', $location->id)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('locations/kits', [
            'location' => $location,
            ...$this->buildKitIndexProps($request, $kits, $sort, $order, $perPage),
        ]);
    }

    public function addKits(Request $request, Location $location)
    {
        [$sort, $order, $perPage] = $this->resolveKitIndexState($request);

        $kits = $this->buildKitIndexQuery($request, $sort, $order)
            ->paginate($perPage)
            ->withQueryString();

        $existingKitIds = $location->kits()->pluck('id')->all();

        return Inertia::render('locations/add-kits', [
            'location' => $location,
            'existingKitIds' => $existingKitIds,
            ...$this->buildKitIndexProps($request, $kits, $sort, $order, $perPage),
        ]);
    }

    public function storeKits(Request $request, Location $location)
    {
        $validated = $request->validate([
            'kit_ids' => ['present', 'array'],
            'kit_ids.*' => ['required', 'string'],
        ]);

        // Clear existing location assignments and set new ones
        $location->kits()->update(['location_id' => null]);

        if (!empty($validated['kit_ids'])) {
            $request->user()->kits()
                ->whereIn('id', $validated['kit_ids'])
                ->update(['location_id' => $location->id]);
        }

        return redirect()->route('locations.kits', $location);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Location $location)
    {
        return Inertia::render('locations/create', [
            'location' => $location,
            'parentOptions' => $this->parentOptions($request, $location),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Location $location, GeocodingService $geocoding)
    {
        $validated = $this->validatedData($request, $location);

        if ($request->filled('address') && ($request->input('address') !== $location->address || is_null($location->latitude))) {
            $coords = $geocoding->geocode($validated['address']);
            if ($coords) {
                $validated['latitude'] = $coords['lat'];
                $validated['longitude'] = $coords['lon'];
            }
        }

        $location->update($validated);

        return redirect()->route('locations.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Location $location)
    {
        $location->delete();

        return redirect()->route('assets.index');
    }

    public function duplicate(Request $request, Location $location)
    {
        $request->validate([
            'count' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        $count = (int) $request->input('count');

        for ($i = 1; $i <= $count; $i++) {
            $clone = $location->replicate();
            $clone->name = $location->name . " (Copy {$i})";
            $clone->save();
        }

        return redirect()->route('assets.index')->with('success', "Successfully created {$count} duplicates.");
    }

    /**
     * Validate and normalize location input.
     *
     * @return array<string, mixed>
     */
    private function validatedData(Request $request, ?Location $location = null): array
    {
        $description = $request->input('description');
        $address = $request->input('address');
        $parentLocationId = $request->input('parent_location_id');

        $request->merge([
            'name' => trim((string) $request->input('name', '')),
            'description' => is_string($description) ? trim($description) ?: null : null,
            'address' => is_string($address) ? trim($address) ?: null : null,
            'parent_location_id' => is_string($parentLocationId) && trim($parentLocationId) !== '' ? $parentLocationId : null,
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'parent_location_id' => [
                'nullable',
                'string',
                ...($location ? [Rule::notIn([$location->id])] : []),
                Rule::exists('locations', 'id')->where(fn ($query) => $query->where('user_id', $request->user()->id)),
            ],
        ], [
            'parent_location_id.not_in' => 'A location cannot be its own parent.',
        ]);

        if ($location && isset($validated['parent_location_id'])) {
            $candidateParentId = $validated['parent_location_id'];

            if ($candidateParentId !== 0 && $this->createsHierarchyCycle($location, $candidateParentId)) {
                throw ValidationException::withMessages([
                    'parent_location_id' => 'The selected parent would create a circular location hierarchy.',
                ]);
            }
        }

        return $validated;
    }

    private function createsHierarchyCycle(Location $location, string $candidateParentId): bool
    {
        $currentParent = Location::query()
            ->where('user_id', $location->user_id)
            ->select(['id', 'parent_location_id'])
            ->find($candidateParentId);

        while ($currentParent) {
            if ($currentParent->id === $location->id) {
                return true;
            }

            $nextParentId = $currentParent->parent_location_id;
            $currentParent = $nextParentId
                ? Location::query()->where('user_id', $location->user_id)->select(['id', 'parent_location_id'])->find($nextParentId)
                : null;
        }

        return false;
    }

    private function parentOptions(Request $request, ?Location $excludeLocation = null)
    {
        return $request->user()->locations()
            ->when($excludeLocation, fn ($query) => $query->whereKeyNot($excludeLocation->id))
            ->orderBy('name')
            ->get(['id', 'name']);
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

    private function buildKitIndexQuery(Request $request, string $sort, string $order)
    {
        return $request->user()->kits()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy($sort, $order);
    }

    /**
     * @return array{0: string, 1: string, 2: int}
     */
    private function resolveKitIndexState(Request $request): array
    {
        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');
        $perPage = $request->integer('per_page', 20);

        if (! in_array($sort, ['name', 'status', 'created_at'], true)) {
            $sort = 'created_at';
        }

        if (! in_array($perPage, [20, 50, 100], true)) {
            $perPage = 20;
        }

        if (! in_array(strtolower($order), ['asc', 'desc'], true)) {
            $order = 'desc';
        }

        return [$sort, strtolower($order), $perPage];
    }

    /**
     * @return array<string, mixed>
     */
    private function buildKitIndexProps(Request $request, LengthAwarePaginator $kits, string $sort, string $order, int $perPage): array
    {
        return [
            'kits' => $kits,
            'filters' => [
                'search' => $request->input('search'),
                'per_page' => $perPage,
                'sort' => $sort,
                'order' => $order,
            ],
        ];
    }
}
