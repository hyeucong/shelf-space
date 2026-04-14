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

    Route::resource('assets', AssetController::class);
    Route::resource('kits', KitController::class);

    Route::resource('categories', CategoryController::class);
    Route::resource('tags', TagController::class);
    Route::resource('locations', LocationController::class);
    Route::resource('audits', AuditController::class);
    Route::resource('reminders', ReminderController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
