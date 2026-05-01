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
    Route::post('{kit}/assets/add-assets', [KitController::class, 'storeAssets'])
        ->whereUlid('kit')
        ->name('store-assets');
    Route::post('{kit}/duplicate', [KitController::class, 'duplicate'])
        ->whereUlid('kit')
        ->name('duplicate');
});

Route::resource('kits', KitController::class);
