<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Kit;
use App\Models\Location;
use App\Queries\AssetQuery;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
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

        $kits = Kit::query()
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
    public function create()
    {
        $categories = Category::orderBy('name')->get(['id', 'name']);
        $locations = Location::orderBy('name')->get(['id', 'name']);

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

        return redirect()->route('kits.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Kit $kit)
    {
        return Inertia::render('kits/overview', [
            'kit' => $kit,
        ]);
    }

    public function assets(Kit $kit)
    {

        return Inertia::render('kits/assets', [
            'kit' => $kit,
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
        //
    }

    public function addAssets(Request $request, Kit $kit, AssetQuery $assetQuery)
    {
        $indexState = $assetQuery->resolveIndexState($request);
        $assets = $assetQuery->handle($request)
            ->paginate($indexState['perPage'])
            ->withQueryString();

        return Inertia::render('kits/add-assets', [
            'kit' => $kit,
            ...$this->buildAssetIndexProps($request, $assetQuery, $assets, $indexState),
        ]);
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
}
