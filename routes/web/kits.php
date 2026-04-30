<?php

use App\Http\Controllers\KitController;
use Illuminate\Support\Facades\Route;

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
