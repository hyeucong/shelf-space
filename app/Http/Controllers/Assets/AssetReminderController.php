<?php

namespace App\Http\Controllers\Assets;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetReminderController extends Controller
{
    /**
     * Display reminders for the specified asset.
     */
    public function index(Asset $asset)
    {
        $asset->load([
            'category:id,name',
            'location:id,name,latitude,longitude',
            'tags:id,name',
        ]);

        $reminders = $asset->reminders()
            ->latest('remind_at')
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('assets/reminders', [
            'asset' => $asset,
            'reminders' => $reminders,
        ]);
    }

    public function store(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'remind_at' => ['required', 'date'],
        ]);

        $asset->reminders()->create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'description' => $validated['description'],
            'remind_at' => $validated['remind_at'],
            'status' => 'pending',
        ]);

        return redirect()->route('assets.reminders', $asset);
    }
    public function destroy(Asset $asset, \App\Models\Reminder $reminder)
    {
        $reminder->delete();

        return redirect()->route('assets.reminders', $asset);
    }
}
