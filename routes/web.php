<?php

use App\Http\Controllers\AssetController;
use Illuminate\Support\Facades\Route;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;

Route::inertia('/', 'welcome')->name('home');

Route::middleware([
    'auth',
    ValidateSessionWithWorkOS::class,
])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('assets', AssetController::class);

    Route::inertia('categories', 'categories/index')->name('categories.index');
    Route::inertia('tags', 'tags/index')->name('tags.index');
    Route::inertia('locations', 'locations/index')->name('locations.index');
    Route::inertia('audits', 'audits/index')->name('audits.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
