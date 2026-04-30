<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\Assets\AssetActivityController;
use App\Http\Controllers\Assets\AssetReminderController;
use App\Http\Controllers\Assets\LayoutController;
use App\Http\Controllers\Assets\SavedFilterController;
use Illuminate\Support\Facades\Route;

Route::prefix('assets')->name('assets.')->group(function () {

    // --- 1. Global Asset Actions ---
    Route::get('/', [AssetController::class, 'index'])->name('index');
    Route::get('create', [AssetController::class, 'create'])->name('create');
    Route::post('/', [AssetController::class, 'store'])->name('store');
    Route::post('layout', [LayoutController::class, 'store'])->name('layout.store');
    Route::post('/assets/{asset}/duplicate', [AssetController::class, 'duplicate'])->name('assets.duplicate');

    // --- 2. Saved Filters ---
    Route::prefix('saved-filters')->name('saved-filters.')->group(function () {
        Route::post('/', [SavedFilterController::class, 'store'])->name('store');
        Route::patch('{savedFilter}', [SavedFilterController::class, 'update'])->name('update');
        Route::delete('{savedFilter}', [SavedFilterController::class, 'destroy'])->name('destroy');
    });

    // --- 3. Individual Asset Management ---
    Route::group(['prefix' => '{asset}'], function () {
        // Overview & Redirects
        Route::get('overview', [AssetController::class, 'show'])->name('overview');
        Route::get('/', fn ($asset) => redirect()->route('assets.overview', $asset));

        // Core CRUD
        Route::get('edit', [AssetController::class, 'edit'])->name('edit');
        Route::match(['put', 'patch'], '/', [AssetController::class, 'update'])->name('update');
        Route::delete('/', [AssetController::class, 'destroy'])->name('destroy');

        // Nested Features: Activity
        Route::get('activity', [AssetActivityController::class, 'index'])->name('activity');
        Route::post('activity', [AssetActivityController::class, 'store'])->name('activity.store');
        Route::delete('activity/{activity}', [AssetActivityController::class, 'destroy'])->name('activity.destroy');

        // Nested Features: Reminders
        Route::get('reminders', [AssetReminderController::class, 'index'])->name('reminders');
        Route::post('reminders', [AssetReminderController::class, 'store'])->name('reminders.store');
    });
});
