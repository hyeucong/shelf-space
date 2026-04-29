<?php

namespace App\Http\Controllers\Assets;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

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

        $activities = Activity::query()
            ->where('subject_type', Asset::class)
            ->where('subject_id', $asset->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Activity $a) {
                return [
                    'id' => $a->id,
                    'description' => $a->description,
                    'event' => $a->event,
                    'causer_name' => $a->causer?->name ?? null,
                    'attribute_changes' => $a->attribute_changes,
                    'properties' => $a->properties,
                    'created_at' => $a->created_at?->toDateTimeString(),
                ];
            });

        return Inertia::render('assets/activity', [
            'asset' => $asset,
            'activity' => $activities,
        ]);
    }

    public function store(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'note' => 'required|string|min:1',
        ]);

        // Log the note using Spatie Activity Log
        activity()
            ->performedOn($asset)
            ->causedBy(auth()->user())
            ->event('note')
            ->inLog('notes')
            ->withProperty('note', $validated['note'])
            ->log('Added a note');

        return back();
    }
}
