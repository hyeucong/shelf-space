<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;

Route::resource('categories', CategoryController::class)->except(['create', 'edit']);
Route::resource('tags', TagController::class)->except(['create', 'edit']);
Route::resource('reminders', ReminderController::class);
