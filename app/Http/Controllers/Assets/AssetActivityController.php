<?php

namespace App\Http\Controllers\Assets;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Inertia\Inertia;

class AssetActivityController extends Controller
{
    /**
     * Display activity for the specified asset (temporary page).
     */
    public function index(Asset $asset)
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
}
