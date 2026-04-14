<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\Category;
use App\Models\Location;
use App\Models\Tag;
use Faker\Factory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AssetSeeder extends Seeder
{
    public function run()
    {
        $faker = Factory::create();

        $categoryNames = ['Electronics', 'Furniture', 'Office', 'Audio', 'Tools'];
        $locationNames = ['Main Office', 'Warehouse', 'Remote'];

        for ($i = 0; $i < 30; $i++) {
            $catName = $faker->randomElement($categoryNames);
            $category = Category::firstOrCreate(
                ['name' => $catName],
                ['slug' => Str::slug($catName)]
            );

            $locName = $faker->randomElement($locationNames);
            $location = Location::firstOrCreate(
                ['name' => $locName],
                ['description' => $faker->sentence()]
            );

            $asset = Asset::create([
                'name' => $faker->words(3, true),
                'asset_id' => 'AST-'.strtoupper($faker->bothify('??-####')),
                'description' => $faker->sentence(),
                'value' => $faker->randomFloat(2, 10, 5000),
                'category_id' => $category->id,
                'location_id' => $location->id,
            ]);

            $possibleTags = ['laptop', 'monitor', 'chair', 'phone', 'printer', 'cable', 'adapter', 'camera'];
            $chosen = $faker->randomElements($possibleTags, rand(1, 3));
            $tagIds = [];
            foreach ($chosen as $t) {
                $tagIds[] = Tag::firstOrCreate(['name' => $t])->id;
            }

            $asset->tags()->sync(array_values(array_unique($tagIds)));
        }
    }
}
