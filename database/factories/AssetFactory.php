<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssetFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->words(3, true),
            // Including asset_id to match your React interface
            'asset_id' => 'AST-'.strtoupper(fake()->bothify('??-####')),
            'description' => fake()->sentence(),
            'status' => fake()->randomElement(['available', 'in_use', 'maintenance', 'retired']),
            'value' => fake()->randomFloat(2, 10, 5000),
        ];
    }
}
