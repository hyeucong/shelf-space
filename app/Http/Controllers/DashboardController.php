<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $assets = Asset::where('user_id', $userId)
            ->with(['category:id,name', 'location:id,name', 'tags:id,name'])
            ->latest()
            ->limit(5)
            ->get();

        $reminders = \App\Models\Reminder::where('user_id', $userId)
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'assets' => $assets,
            'reminders' => $reminders,
            'stats' => [
                'total_assets' => Asset::where('user_id', $userId)->count(),
                'total_categories' => \App\Models\Category::where('user_id', $userId)->count(),
                'total_locations' => \App\Models\Location::where('user_id', $userId)->count(),
                'total_value' => Asset::where('user_id', $userId)->sum('value'),
            ],
        ]);
    }
}
