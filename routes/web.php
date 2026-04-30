<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\KitController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\Locations\LocationActivityController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\TagController;
use App\Models\Location;
use Illuminate\Support\Facades\Route;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;

Route::inertia('/', 'landing/welcome')->name('home');

Route::middleware([
    'auth',
    ValidateSessionWithWorkOS::class,
])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    require __DIR__.'/web/assets.php';

    Route::prefix('kits')->name('kits.')->group(function () {
        Route::get('{kit}/overview', [KitController::class, 'show'])
            ->whereUlid('kit')
            ->name('overview');
        Route::get('{kit}/assets', [KitController::class, 'assets'])
            ->whereUlid('kit')
            ->name('assets');
        Route::get('{kit}/assets/add-assets', [KitController::class, 'addAssets'])
            ->whereUlid('kit')
            ->name('add-assets');
    });

    Route::resource('kits', KitController::class);

    Route::resource('categories', CategoryController::class)->except(['create', 'edit']);
    Route::resource('tags', TagController::class)->except(['create', 'edit']);
    Route::prefix('locations')->name('locations.')->group(function () {
        Route::get('{location}/overview', [LocationController::class, 'show'])
            ->whereUlid('location')
            ->name('overview');
        Route::get('{location}/assets', [LocationController::class, 'assets'])
            ->whereUlid('location')
            ->name('assets');
        Route::get('{location}/assets/add-assets', [LocationController::class, 'addAssets'])
            ->whereUlid('location')
            ->name('add-assets');
        Route::get('{location}/kits', [LocationController::class, 'kits'])
            ->whereUlid('location')
            ->name('kits');
        Route::get('{location}/kits/add-kits', [LocationController::class, 'addKits'])
            ->whereUlid('location')
            ->name('add-kits');

        Route::get('{location}/activity', [LocationActivityController::class, 'index'])
            ->whereUlid('location')
            ->name('activity');
        Route::post('{location}/activity', [LocationActivityController::class, 'store'])
            ->whereUlid('location')
            ->name('activity.store');
        Route::delete('{location}/activity/{activity}', [LocationActivityController::class, 'destroy'])
            ->whereUlid('location')
            ->name('activity.destroy');

        Route::get('{location}', function (Location $location) {
            return redirect()->route('locations.overview', $location);
        })->whereUlid('location');
    });

    Route::resource('locations', LocationController::class)->except(['show']);
    Route::resource('reminders', ReminderController::class);
});

Route::get('/ping', function () {
    return response('Awake', 200);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
