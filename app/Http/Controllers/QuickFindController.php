<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class QuickFindController extends Controller
{
    /**
     * Handle the global search request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $query = $request->string('q')->trim();

        // 1. Performance: Minimum character threshold
        if ($query->length() < 2) {
            return response()->json(['results' => []]);
        }

        // 2. Security & Performance: Atomic Scoping
        // We chain through the user relationship to prevent IDOR
        // and only select the columns we actually need for the UI.
        $assets = $request->user()->assets()
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('asset_id', 'like', "%{$query}%");
            })
            ->select(['id', 'name', 'asset_id'])
            ->limit(5)
            ->get()
            ->map(fn ($asset) => [
                'id' => $asset->id,
                'group' => 'Assets',
                'title' => $asset->name,
                'subtitle' => $asset->asset_id,
                'url' => route('assets.overview', $asset->id),
            ]);

        $kits = $request->user()->kits()
            ->where('name', 'like', "%{$query}%")
            ->select(['id', 'name'])
            ->limit(3)
            ->get()
            ->map(fn ($kit) => [
                'id' => $kit->id,
                'group' => 'Kits',
                'title' => $kit->name,
                'subtitle' => 'System Kit',
                'url' => route('kits.overview', $kit->id),
            ]);

        // 3. UX: Standardized Output
        // Grouping results on the backend makes the Shadcn <CommandGroup> 
        // much easier to render via Object.entries()
        $results = collect([...$assets, ...$kits])->groupBy('group');

        return response()->json(['results' => $results]);
    }
}
