<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->index();
            $table->string('asset_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('value', 10, 2)->nullable();
            $table->string('status')->default('available');
            $table->timestamps();

            $table->unique(['user_id', 'asset_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
