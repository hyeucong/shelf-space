<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\KitController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\TagController;
use App\Models\Asset;
use Illuminate\Support\Facades\Route;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;

Route::inertia('/', 'landing/welcome')->name('home');

Route::middleware([
    'auth',
    ValidateSessionWithWorkOS::class,
])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::prefix('assets')->name('assets.')->group(function () {
        Route::post('layout', [AssetController::class, 'storeLayout'])->name('layout.store');
        Route::post('saved-filters', [AssetController::class, 'storeSavedFilter'])->name('saved-filters.store');
        Route::patch('saved-filters/{savedFilter}', [AssetController::class, 'updateSavedFilter'])->name('saved-filters.update');
        Route::delete('saved-filters/{savedFilter}', [AssetController::class, 'destroySavedFilter'])->name('saved-filters.destroy');

        Route::get('/', [AssetController::class, 'index'])->name('index');
        Route::get('create', [AssetController::class, 'create'])->name('create');
        Route::post('/', [AssetController::class, 'store'])->name('store');

        Route::get('{asset}/overview', [AssetController::class, 'show'])
            ->whereNumber('asset')
            ->name('overview');

        Route::get('{asset}/activity', [AssetController::class, 'activity'])
            ->whereNumber('asset')
            ->name('activity');

        Route::get('{asset}/reminders', [AssetController::class, 'reminders'])
            ->whereNumber('asset')
            ->name('reminders');

        // compatibility: redirect legacy `/assets/{asset}` GET to the overview route
        Route::get('{asset}', function (Asset $asset) {
            return redirect()->route('assets.overview', $asset);
        })->whereNumber('asset');

        Route::get('{asset}/edit', [AssetController::class, 'edit'])
            ->whereNumber('asset')
            ->name('edit');

        Route::match(['put', 'patch'], '{asset}', [AssetController::class, 'update'])
            ->whereNumber('asset')
            ->name('update');

        Route::delete('{asset}', [AssetController::class, 'destroy'])
            ->whereNumber('asset')
            ->name('destroy');
    });

    Route::resource('kits', KitController::class);

    Route::resource('categories', CategoryController::class)->except(['create', 'edit']);
    Route::resource('tags', TagController::class)->except(['create', 'edit']);
    Route::resource('locations', LocationController::class);
    Route::resource('audits', AuditController::class);
    Route::resource('reminders', ReminderController::class);
});

Route::get('/ping', function () {
    return response('Awake', 200);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
