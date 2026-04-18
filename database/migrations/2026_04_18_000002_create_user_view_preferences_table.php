<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_view_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('resource', 100);
            $table->string('key', 100);
            $table->string('name')->nullable();
            $table->boolean('is_default')->default(false);
            $table->json('settings');
            $table->timestamps();

            $table->unique(['user_id', 'resource', 'key']);
            $table->index(['user_id', 'resource']);
            $table->index(['user_id', 'resource', 'is_default']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_view_preferences');
    }
};
