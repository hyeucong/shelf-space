<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\KitController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;

Route::inertia('/', 'landing/welcome')->name('home');

Route::middleware([
    'auth',
    ValidateSessionWithWorkOS::class,
])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::post('assets/saved-filters', [AssetController::class, 'storeSavedFilter'])->name('assets.saved-filters.store');
    Route::patch('assets/saved-filters/{savedFilter}', [AssetController::class, 'updateSavedFilter'])->name('assets.saved-filters.update');
    Route::delete('assets/saved-filters/{savedFilter}', [AssetController::class, 'destroySavedFilter'])->name('assets.saved-filters.destroy');
    Route::resource('assets', AssetController::class);
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
