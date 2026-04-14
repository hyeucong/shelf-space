<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');

        $allowedSorts = ['name', 'asset_id', 'status', 'value', 'created_at'];
        if (!in_array($sort, $allowedSorts)) {
            $sort = 'created_at';
        }

        $order = in_array(strtolower($order), ['asc', 'desc']) ? $order : 'desc';

        $assets = Asset::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('asset_id', 'like', "%{$search}%");
            })
            ->when($request->input('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy($sort, $order)
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('assets/index', [
            'assets' => $assets,
            'filters' => $request->only(['search', 'per_page', 'sort', 'order', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('assets/create', []);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'asset_id' => ['required', 'string', 'max:255', 'unique:assets,asset_id'],
            'value' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        Asset::create($validated);

        return redirect()->route('assets.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
            'asset_id' => ['required', 'string', 'max:255', 'unique:assets,asset_id,'.$asset->id],
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
