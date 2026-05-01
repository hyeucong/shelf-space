<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;

Route::delete('categories/select-delete', [CategoryController::class, 'selectDelete'])->name('categories.selectDelete');
Route::resource('categories', CategoryController::class)->except(['create', 'edit']);

Route::delete('tags/select-delete', [TagController::class, 'selectDelete'])->name('tags.selectDelete');
Route::resource('tags', TagController::class)->except(['create', 'edit']);

Route::resource('reminders', ReminderController::class);
