<?php

use App\Http\Controllers\QuickFindController;
use App\Http\Middleware\ValidateWorkOSSession;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'landing/welcome')->name('home');

Route::post('/login/demo', [\App\Http\Controllers\Auth\DemoLoginController::class, 'store'])
    ->middleware('guest')
    ->name('login.demo');


Route::middleware([
    'auth',
    ValidateWorkOSSession::class,
])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('quick-find', QuickFindController::class)->name('quick-find');

    require __DIR__.'/web/assets.php';
    require __DIR__.'/web/kits.php';
    require __DIR__.'/web/locations.php';
    require __DIR__.'/web/resources.php';
});

Route::get('/ping', function () {
    return response('Awake', 200);
});

Route::fallback(function () {
    abort(404);
})->middleware('auth');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
