<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\Category;
use App\Models\Location;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Faker\Factory;

class PerformanceSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Factory::create();
        
        // 1. Seed Demo User
        $demoUser = User::firstOrCreate(
            ['email' => 'demo@shelfspace.com'],
            [
                'name' => 'Demo User',
                'workos_id' => 'demo-user-id',
                'avatar' => '',
            ]
        );
        
        $this->command->info('Seeding 1,000 users...');
        $now = now();
        $userData = [];
        for ($i=0; $i<1000; $i++) {
            $userData[] = [
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'workos_id' => 'fake-'.Str::random(10),
                'avatar' => '',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('users')->insert($userData);
        $users = User::where('email', '!=', 'demo@shelfspace.com')->get();
        $allUsers = collect([$demoUser])->concat($users);
        
        $this->command->info('Generating categories, locations, and tags for all users...');
        $categoryData = [];
        $locationData = [];
        $tagData = [];
        
        foreach ($allUsers as $user) {
            // 5 categories per user
            $userCategoryNames = [];
            for ($i=0; $i<5; $i++) {
                do {
                    $name = $faker->word . ' ' . $i;
                } while (isset($userCategoryNames[$name]));
                $userCategoryNames[$name] = true;

                $categoryData[] = [
                    'user_id' => $user->id,
                    'name' => ucfirst($name),
                    'slug' => Str::slug($name) . '-' . Str::random(4),
                    'hex_color' => $faker->safeHexColor(),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            // 3 locations per user
            for ($i=0; $i<3; $i++) {
                $locationData[] = [
                    'id' => (string) Str::ulid(),
                    'user_id' => $user->id,
                    'name' => $faker->city . ' ' . $faker->streetSuffix,
                    'description' => $faker->sentence(),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            // 8 tags per user
            $userTagNames = [];
            for ($i=0; $i<8; $i++) {
                do {
                    $name = $faker->word;
                } while (isset($userTagNames[$name]));
                $userTagNames[$name] = true;

                $tagData[] = [
                    'user_id' => $user->id,
                    'name' => $name,
                    'hex_color' => $faker->safeHexColor(),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            
            // Periodically insert to avoid memory issues with huge arrays
            if (count($categoryData) >= 1000) {
                DB::table('categories')->insert($categoryData);
                DB::table('locations')->insert($locationData);
                DB::table('tags')->insert($tagData);
                $categoryData = [];
                $locationData = [];
                $tagData = [];
            }
        }
        
        if (!empty($categoryData)) {
            DB::table('categories')->insert($categoryData);
            DB::table('locations')->insert($locationData);
            DB::table('tags')->insert($tagData);
        }
        
        $this->command->info('Retrieving IDs for mapping...');
        $allCategories = Category::all()->groupBy('user_id');
        $allLocations = Location::all()->groupBy('user_id');
        $allTags = Tag::all()->groupBy('user_id');
        
        $this->command->info('Generating and inserting 1M+ assets...');
        $batchSize = 2000;
        $assetsBatch = [];
        $assetTagBatch = [];
        
        $bar = $this->command->getOutput()->createProgressBar($allUsers->count());
        $bar->start();
        
        foreach ($allUsers as $user) {
            $userCats = $allCategories->get($user->id)?->pluck('id')->toArray() ?? [];
            $userLocs = $allLocations->get($user->id)?->pluck('id')->toArray() ?? [];
            $userTags = $allTags->get($user->id)?->pluck('id')->toArray() ?? [];
            
            if (empty($userCats) || empty($userLocs)) continue;

            // Skip demo account as it's handled by DemoSeeder
            if ($user->email === 'demo@shelfspace.com') continue;

            $count = 100;
            
            for ($i = 0; $i < $count; $i++) {
                $assetUlid = (string) Str::ulid();
                $assetsBatch[] = [
                    'id' => $assetUlid,
                    'user_id' => $user->id,
                    'category_id' => $faker->randomElement($userCats),
                    'location_id' => $faker->randomElement($userLocs),
                    'name' => $faker->words(3, true),
                    'asset_id' => 'AST-' . strtoupper($faker->bothify('??-####')) . '-' . $i,
                    'description' => $faker->sentence(),
                    'status' => $faker->randomElement(['available', 'in_use', 'maintenance', 'retired']),
                    'value' => $faker->randomFloat(2, 10, 5000),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                $tagCount = rand(1, 3);
                $randomTagIds = (array) $faker->randomElements($userTags, min(count($userTags), $tagCount));
                foreach ($randomTagIds as $tagId) {
                    $assetTagBatch[] = [
                        'asset_id' => $assetUlid,
                        'tag_id' => $tagId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                if (count($assetsBatch) >= $batchSize) {
                    DB::table('assets')->insert($assetsBatch);
                    DB::table('asset_tag')->insert($assetTagBatch);
                    $assetsBatch = [];
                    $assetTagBatch = [];
                }
            }
            $bar->advance();
        }
        
        if (!empty($assetsBatch)) {
            DB::table('assets')->insert($assetsBatch);
            DB::table('asset_tag')->insert($assetTagBatch);
        }
        
        $bar->finish();
        $this->command->info("\nSeeding completed successfully.");
    }
}
