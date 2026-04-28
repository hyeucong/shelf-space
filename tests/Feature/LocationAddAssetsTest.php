<?php

use App\Models\Asset;
use App\Models\Location;
use App\Models\User;

test('location add assets page returns the authenticated users assets', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $location = Location::create([
        'user_id' => $user->id,
        'name' => 'Warehouse',
        'description' => 'Primary storage',
        'address' => '100 Inventory Way',
    ]);

    $visibleAsset = Asset::factory()->for($user)->create([
        'name' => 'Camera Body',
        'asset_id' => 'AST-LOC-001',
    ]);

    Asset::factory()->for($otherUser)->create([
        'name' => 'Hidden Tripod',
        'asset_id' => 'AST-LOC-999',
    ]);

    $response = $this->actingAs($user)->get(route('locations.add-assets', $location));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('locations/add-assets')
        ->where('location.id', $location->id)
        ->where('filters.per_page', 20)
        ->where('sorts.0.field', 'created_at')
        ->where('sorts.0.order', 'desc')
        ->has('assets.data', 1)
        ->where('assets.data.0.id', $visibleAsset->id)
        ->where('assets.data.0.name', 'Camera Body'));
});

test('location add assets page applies asset filters and sorts', function () {
    $user = User::factory()->create();

    $location = Location::create([
        'user_id' => $user->id,
        'name' => 'Studio',
        'description' => 'Recording room',
        'address' => '22 Sound St',
    ]);

    Asset::factory()->for($user)->create([
        'name' => 'Mixer',
        'asset_id' => 'AST-STUDIO-001',
        'status' => 'retired',
        'value' => 150,
    ]);

    $matchingAsset = Asset::factory()->for($user)->create([
        'name' => 'Recorder',
        'asset_id' => 'AST-STUDIO-002',
        'status' => 'available',
        'value' => 300,
    ]);

    $response = $this->actingAs($user)->get(route('locations.add-assets', [
        'location' => $location,
        'status' => 'available',
        'value_min' => '200',
        'sorts' => 'value:desc',
        'per_page' => 100,
    ]));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('locations/add-assets')
        ->where('filters.status', 'available')
        ->where('filters.value_min', '200')
        ->where('filters.per_page', 100)
        ->where('sorts.0.field', 'value')
        ->where('sorts.0.order', 'desc')
        ->has('assets.data', 1)
        ->where('assets.data.0.id', $matchingAsset->id));
});
