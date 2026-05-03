<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User']
        );


        User::updateOrCreate(
            ['email' => 'demo@shelfspace.com'],
            ['name' => 'Demo User']
        );


        $this->call(PerformanceSeeder::class);

    }
}
