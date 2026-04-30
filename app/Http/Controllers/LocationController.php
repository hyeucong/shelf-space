<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Kit;
use App\Models\Location;
use App\Queries\AssetQuery;
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

        $locations = Location::query()
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
            'parentOptions' => $this->parentOptions(),
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
    public function create()
    {
        return Inertia::render('locations/create', [
            'parentOptions' => $this->parentOptions(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $this->validatedData($request);

        $redirectTo = $request->string('redirect_to')->toString();
        if ($redirectTo === '' || ! str_starts_with($redirectTo, '/')) {
            $redirectTo = route('locations.index');
        }

        $location = Location::create($validated);

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

    public function assets(Location $location)
    {
        $assets = $location->assets()
            ->with('category:id,name')
            ->paginate(20);

        return Inertia::render('locations/assets', [
            'location' => $location,
            'assets' => $assets,
        ]);
    }

    public function addAssets(Request $request, Location $location, AssetQuery $assetQuery)
    {
        $indexState = $assetQuery->resolveIndexState($request);
        $assets = $assetQuery->handle($request)
            ->paginate($indexState['perPage'])
            ->withQueryString();

        return Inertia::render('locations/add-assets', [
            'location' => $location,
            ...$this->buildAssetIndexProps($request, $assetQuery, $assets, $indexState),
        ]);
    }

    public function kits(Request $request, Location $location)
    {
        [$sort, $order, $perPage] = $this->resolveKitIndexState($request);

        $kits = $this->buildKitIndexQuery($request, $sort, $order)
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

        return Inertia::render('locations/add-kits', [
            'location' => $location,
            ...$this->buildKitIndexProps($request, $kits, $sort, $order, $perPage),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Location $location)
    {
        return Inertia::render('locations/create', [
            'location' => $location,
            'parentOptions' => $this->parentOptions($location),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Location $location)
    {
        $location->update($this->validatedData($request, $location));

        return redirect()->route('locations.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Location $location)
    {
        $location->delete();

        return redirect()->route('locations.index');
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
            ->select(['id', 'parent_location_id'])
            ->find($candidateParentId);

        while ($currentParent) {
            if ($currentParent->id === $location->id) {
                return true;
            }

            $nextParentId = $currentParent->parent_location_id;
            $currentParent = $nextParentId
                ? Location::query()->select(['id', 'parent_location_id'])->find($nextParentId)
                : null;
        }

        return false;
    }

    private function parentOptions(?Location $excludeLocation = null)
    {
        return Location::query()
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
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'locations' => Location::query()->orderBy('name')->get(['id', 'name']),
            'savedFilters' => $assetQuery->loadSavedFilters($request),
            'columnPreferences' => $assetQuery->loadColumnPreference($request),
        ];
    }

    private function buildKitIndexQuery(Request $request, string $sort, string $order)
    {
        return Kit::query()
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
