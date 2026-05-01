<?php

use App\Http\Controllers\LocationController;
use App\Http\Controllers\Locations\LocationActivityController;
use App\Models\Location;
use Illuminate\Support\Facades\Route;

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
    Route::post('{location}/assets/add-assets', [LocationController::class, 'storeAssets'])
        ->whereUlid('location')
        ->name('store-assets');
    Route::get('{location}/kits', [LocationController::class, 'kits'])
        ->whereUlid('location')
        ->name('kits');
    Route::get('{location}/kits/add-kits', [LocationController::class, 'addKits'])
        ->whereUlid('location')
        ->name('add-kits');
    Route::post('{location}/kits/add-kits', [LocationController::class, 'storeKits'])
        ->whereUlid('location')
        ->name('store-kits');
    Route::post('{location}/duplicate', [LocationController::class, 'duplicate'])
        ->whereUlid('location')
        ->name('duplicate');

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

    Route::delete('select-delete', [LocationController::class, 'selectDelete'])
        ->name('selectDelete');
});

Route::resource('locations', LocationController::class)->except(['show']);
