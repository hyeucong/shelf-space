<?php

namespace App\Http\Controllers\Assets;

use App\Http\Controllers\Controller;
use App\Models\UserViewPreference;
use App\Queries\AssetQuery;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LayoutController extends Controller
{
    private const RESOURCE_KEY = 'assets.index';

    private const COLUMNS_PREFERENCE_KEY = 'columns';

    public function store(Request $request, AssetQuery $assetQuery)
    {
        $validated = $request->validate([
            'columns' => ['required', 'array'],
            'columns.*.key' => ['required', 'string', Rule::in(['id', 'asset_id', 'status', 'category', 'location', 'tags', 'description', 'value', 'created_at', 'updated_at'])],
            'columns.*.visible' => ['required', 'boolean'],
        ]);

        UserViewPreference::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'resource' => self::RESOURCE_KEY,
                'key' => self::COLUMNS_PREFERENCE_KEY,
            ],
            [
                'name' => 'Layout',
                'settings' => [
                    'columns' => $this->normalizeAssetColumnPreferences($assetQuery, $validated['columns']),
                ],
            ],
        );

        return back();
    }

    /**
     * @return array<int, array{key: string, visible: bool}>
     */
    private function normalizeAssetColumnPreferences(AssetQuery $assetQuery, mixed $columns): array
    {
        return $assetQuery->normalizeAssetColumnPreferences($columns);
    }
}
