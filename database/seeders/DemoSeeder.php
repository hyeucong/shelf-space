<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\Category;
use App\Models\Location;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    private User $user;

    public function run(): void
    {
        $this->user = $this->ensureDemoUser();

        // Clean up existing demo data to ensure quality
        $this->clearExistingData();

        $categoryModels = $this->seedCategories();
        $locationModels = $this->seedLocations();
        $tagModels = $this->seedTags();

        $this->seedCuratedAssets($categoryModels, $locationModels, $tagModels);
        $this->seedRandomAssets($categoryModels, $locationModels, $tagModels);
    }

    private function ensureDemoUser(): User
    {
        return User::firstOrCreate(
            ['email' => 'demo@shelfspace.com'],
            [
                'name' => 'Demo User',
                'workos_id' => 'demo-user-id',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
            ]
        );
    }

    private function clearExistingData(): void
    {
        $this->user->assets()->delete();
        $this->user->categories()->delete();
        $this->user->locations()->delete();
        $this->user->tags()->delete();
    }

    private function seedCategories(): array
    {
        $categories = [
            ['name' => 'Laptops', 'hex_color' => '#3b82f6'],
            ['name' => 'Monitors', 'hex_color' => '#8b5cf6'],
            ['name' => 'Audio', 'hex_color' => '#ef4444'],
            ['name' => 'Cameras', 'hex_color' => '#f59e0b'],
            ['name' => 'Networking', 'hex_color' => '#10b981'],
            ['name' => 'Mobile Devices', 'hex_color' => '#06b6d4'],
            ['name' => 'Furniture', 'hex_color' => '#71717a'],
            ['name' => 'Accessories', 'hex_color' => '#d946ef'],
        ];

        $models = [];
        foreach ($categories as $cat) {
            $models[$cat['name']] = Category::create([
                'user_id' => $this->user->id,
                'name' => $cat['name'],
                'slug' => Str::slug($cat['name']),
                'hex_color' => $cat['hex_color'],
            ]);
        }

        return $models;
    }

    private function seedLocations(): array
    {
        $locations = [
            ['name' => 'SF Headquarters', 'address' => '123 Mission St, San Francisco, CA 94105', 'description' => 'Main office in San Francisco, CA', 'lat' => 37.7919, 'lon' => -122.3947],
            ['name' => 'London Design Studio', 'address' => '25 Wardour St, London W1D 6QG, UK', 'description' => 'Design team hub in Soho, London', 'lat' => 51.5126, 'lon' => -0.1332],
            ['name' => 'Tokyo Innovation Hub', 'address' => '1-1-1 Shibuya, Tokyo 150-0002, Japan', 'description' => 'R&D center in Shibuya, Tokyo', 'lat' => 35.6617, 'lon' => 139.7040],
            ['name' => 'Berlin Lab', 'address' => 'Torstraße 1, 10119 Berlin, Germany', 'description' => 'Engineering lab in Mitte, Berlin', 'lat' => 52.5298, 'lon' => 13.4005],
            ['name' => 'Remote', 'address' => 'Global / Distributed', 'description' => 'Distributed workforce assets', 'lat' => null, 'lon' => null],
        ];

        $models = [];
        foreach ($locations as $loc) {
            $models[$loc['name']] = Location::create([
                'user_id' => $this->user->id,
                'name' => $loc['name'],
                'address' => $loc['address'],
                'description' => $loc['description'],
                'latitude' => $loc['lat'],
                'longitude' => $loc['lon'],
            ]);
        }

        return $models;
    }

    private function seedTags(): array
    {
        $tags = [
            ['name' => 'High Value', 'hex_color' => '#ef4444'],
            ['name' => 'In Warranty', 'hex_color' => '#10b981'],
            ['name' => 'On Loan', 'hex_color' => '#3b82f6'],
            ['name' => 'Damaged', 'hex_color' => '#f97316'],
            ['name' => 'Finance Approved', 'hex_color' => '#8b5cf6'],
            ['name' => 'New Purchase', 'hex_color' => '#ec4899'],
            ['name' => 'Critical', 'hex_color' => '#dc2626'],
            ['name' => 'Personal Issue', 'hex_color' => '#6366f1'],
        ];

        $models = [];
        foreach ($tags as $tag) {
            $models[$tag['name']] = Tag::create([
                'user_id' => $this->user->id,
                'name' => $tag['name'],
                'hex_color' => $tag['hex_color'],
            ]);
        }

        return $models;
    }

    private function seedCuratedAssets(array $categories, array $locations, array $tags): void
    {
        $assetData = [
            'Laptops' => [
                ['name' => 'MacBook Pro 16" (M3 Max)', 'val' => 4299.00],
                ['name' => 'MacBook Air 15" (M2)', 'val' => 1499.00],
                ['name' => 'Dell XPS 15 9530', 'val' => 2399.00],
                ['name' => 'ThinkPad X1 Carbon Gen 11', 'val' => 1899.00],
                ['name' => 'Razer Blade 16 (2024)', 'val' => 3599.00],
            ],
            'Monitors' => [
                ['name' => 'Apple Studio Display', 'val' => 1599.00],
                ['name' => 'Dell UltraSharp 32 4K (U3223QE)', 'val' => 949.00],
                ['name' => 'Samsung Odyssey G9 49"', 'val' => 1299.00],
                ['name' => 'LG DualUp 28"', 'val' => 699.00],
                ['name' => 'Pro Display XDR', 'val' => 4999.00],
            ],
            'Audio' => [
                ['name' => 'Sony WH-1000XM5', 'val' => 399.00],
                ['name' => 'AirPods Max', 'val' => 549.00],
                ['name' => 'Shure SM7B Microphone', 'val' => 399.00],
                ['name' => 'Focusrite Scarlett 2i2', 'val' => 179.00],
                ['name' => 'Genelec 8030C Studio Monitors', 'val' => 1400.00],
            ],
            'Cameras' => [
                ['name' => 'Sony A7IV Mirrorless', 'val' => 2499.00],
                ['name' => 'Canon EOS R6 Mark II', 'val' => 2299.00],
                ['name' => 'Blackmagic Pocket 6K Pro', 'val' => 2535.00],
                ['name' => 'GoPro Hero 12 Black', 'val' => 399.00],
                ['name' => 'DJI Mavic 3 Pro', 'val' => 2199.00],
            ],
            'Networking' => [
                ['name' => 'Cisco C9200L-24T Switch', 'val' => 2100.00],
                ['name' => 'Ubiquiti Dream Machine Pro', 'val' => 379.00],
                ['name' => 'Synology DS923+ NAS', 'val' => 599.00],
                ['name' => 'Aruba AP-515 Access Point', 'val' => 850.00],
            ],
            'Mobile Devices' => [
                ['name' => 'iPhone 15 Pro Max', 'val' => 1199.00],
                ['name' => 'Google Pixel 8 Pro', 'val' => 999.00],
                ['name' => 'iPad Pro 12.9" (M2)', 'val' => 1099.00],
                ['name' => 'Samsung Galaxy S23 Ultra', 'val' => 1199.00],
            ],
            'Furniture' => [
                ['name' => 'Herman Miller Aeron', 'val' => 1800.00],
                ['name' => 'Steelcase Gesture', 'val' => 1400.00],
                ['name' => 'Autonomous SmartDesk 2', 'val' => 599.00],
                ['name' => 'Herman Miller Embody', 'val' => 1900.00],
            ],
            'Accessories' => [
                ['name' => 'Keychron K2 V2 Keyboard', 'val' => 99.00],
                ['name' => 'Logitech MX Master 3S', 'val' => 99.00],
                ['name' => 'CalDigit TS4 Dock', 'val' => 399.00],
                ['name' => 'Wacom Intuos Pro (Medium)', 'val' => 379.00],
            ],
        ];

        $statuses = ['available', 'in_use', 'maintenance', 'retired'];

        foreach ($assetData as $categoryName => $items) {
            $category = $categories[$categoryName];

            foreach ($items as $item) {
                $location = collect($locations)->random();

                $asset = Asset::create([
                    'id' => (string) Str::ulid(),
                    'user_id' => $this->user->id,
                    'category_id' => $category->id,
                    'location_id' => $location->id,
                    'name' => $item['name'],
                    'asset_id' => 'AST-'.strtoupper(Str::random(2)).'-'.rand(1000, 9999),
                    'description' => 'Professional '.strtolower($categoryName).' equipment for high-performance teams.',
                    'status' => collect($statuses)->random(),
                    'value' => $item['val'],
                ]);

                $randomTags = collect($tags)->random(rand(1, 3));
                $asset->tags()->sync($randomTags->pluck('id')->toArray());
            }
        }
    }

    private function seedRandomAssets(array $categories, array $locations, array $tags): void
    {
        $statuses = ['available', 'in_use', 'maintenance', 'retired'];

        $secondaryItems = [
            'Laptops' => ['Replacement MacBook Air', 'Intern Workstation', 'Spare Dell Latitude'],
            'Monitors' => ['Standard Office Monitor', 'Wall Display', 'Secondary 24" Screen'],
            'Audio' => ['Basic Office Headset', 'Spare USB Microphone', 'Conference Speaker'],
            'Cameras' => ['Webcam Pro 1080p', 'Compact Camera Kit', 'Tripod Stand'],
            'Networking' => ['Patch Cable Bundle', 'Network Switch 8-Port', 'Wi-Fi Extender'],
            'Mobile Devices' => ['Test Phone (Android)', 'Tablet Case', 'Charging Station'],
            'Furniture' => ['Task Chair', 'Side Table', 'Pedestal Drawer'],
            'Accessories' => ['USB-C Hub', 'Mouse Pad', 'HDMI Adapter', 'Magic Trackpad'],
        ];

        for ($i = 0; $i < 60; $i++) {
            $category = collect($categories)->random();
            $location = collect($locations)->random();

            $categoryName = $category->name;
            $itemNamePool = $secondaryItems[$categoryName] ?? [$categoryName.' Accessory'];
            $itemName = collect($itemNamePool)->random().' '.($i % 5 + 1);

            $asset = Asset::create([
                'id' => (string) Str::ulid(),
                'user_id' => $this->user->id,
                'category_id' => $category->id,
                'location_id' => $location->id,
                'name' => $itemName,
                'asset_id' => 'AST-'.strtoupper(Str::random(2)).'-'.rand(1000, 9999),
                'description' => 'Supplemental equipment unit for '.$location->name.'.',
                'status' => collect($statuses)->random(),
                'value' => rand(50, 800),
            ]);

            $randomTags = collect($tags)->random(rand(1, 2));
            $asset->tags()->sync($randomTags->pluck('id')->toArray());
        }
    }
}
