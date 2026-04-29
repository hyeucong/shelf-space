<?php

namespace App\Http\Controllers\Locations;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class LocationActivityController extends Controller
{
    /**
     * Display activity for the specified location.
     */
    public function index(Location $location)
    {
        $location->load('parent:id,name')
            ->loadCount(['assets', 'children']);

        $activities = Activity::query()
            ->where('subject_type', Location::class)
            ->where('subject_id', $location->id)
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function (Activity $a) {
                $note = $a->properties?->get('note');
                $isNote = filled($note);

                return [
                    'id' => $a->id,
                    'description' => $a->description,
                    'event' => $a->event,
                    'is_note' => $isNote,
                    'can_delete' => $isNote,
                    'causer_name' => $a->causer?->name ?? null,
                    'properties' => $a->properties,
                    'created_at' => $a->created_at?->toDateTimeString(),
                ];
            });

        return Inertia::render('locations/activity', [
            'location' => $location,
            'activity' => $activities,
        ]);
    }

    public function store(Request $request, Location $location)
    {
        $validated = $request->validate([
            'note' => 'required|string|min:1',
        ]);

        // Log the note using Spatie Activity Log
        activity()
            ->performedOn($location)
            ->causedBy(auth()->user())
            ->event('note')
            ->inLog('notes')
            ->withProperty('note', $validated['note'])
            ->log('Added a note');

        return back();
    }

    public function destroy(Location $location, Activity $activity): RedirectResponse
    {
        $activity = $this->resolveNoteActivity($location, $activity);

        $activity->delete();

        return to_route('locations.activity', $location);
    }

    private function resolveNoteActivity(Location $location, Activity $activity): Activity
    {
        $matchesLocation = $activity->subject_type === Location::class
            && (int) $activity->subject_id === $location->id;

        if (! $matchesLocation || blank($activity->properties?->get('note'))) {
            abort(404);
        }

        return $activity;
    }
}
