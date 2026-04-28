<?php

use App\Models\Asset;
use App\Models\Kit;
use App\Models\User;

test('kit add assets page returns the authenticated users assets', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $kit = Kit::create([
        'user_id' => $user->id,
        'name' => 'Field Kit',
        'description' => 'Primary field kit',
        'status' => 'active',
    ]);

    $visibleAsset = Asset::factory()->for($user)->create([
        'name' => 'Camera Body',
        'asset_id' => 'AST-KIT-001',
    ]);

    Asset::factory()->for($otherUser)->create([
        'name' => 'Hidden Tripod',
        'asset_id' => 'AST-KIT-999',
    ]);

    $response = $this->actingAs($user)->get(route('kits.add-assets', $kit));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('kits/add-assets')
        ->where('kit.id', $kit->id)
        ->where('filters.per_page', 20)
        ->where('sorts.0.field', 'created_at')
        ->where('sorts.0.order', 'desc')
        ->has('assets.data', 1)
        ->where('assets.data.0.id', $visibleAsset->id)
        ->where('assets.data.0.name', 'Camera Body'));
});

test('kit add assets page applies asset filters and sorts', function () {
    $user = User::factory()->create();

    $kit = Kit::create([
        'user_id' => $user->id,
        'name' => 'Audio Kit',
        'description' => 'Recording equipment',
        'status' => 'active',
    ]);

    Asset::factory()->for($user)->create([
        'name' => 'Mixer',
        'asset_id' => 'AST-AUDIO-001',
        'status' => 'retired',
        'value' => 150,
    ]);

    $matchingAsset = Asset::factory()->for($user)->create([
        'name' => 'Recorder',
        'asset_id' => 'AST-AUDIO-002',
        'status' => 'available',
        'value' => 300,
    ]);

    $response = $this->actingAs($user)->get(route('kits.add-assets', [
        'kit' => $kit,
        'status' => 'available',
        'value_min' => '200',
        'sorts' => 'value:desc',
        'per_page' => 100,
    ]));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('kits/add-assets')
        ->where('filters.status', 'available')
        ->where('filters.value_min', '200')
        ->where('filters.per_page', 100)
        ->where('sorts.0.field', 'value')
        ->where('sorts.0.order', 'desc')
        ->has('assets.data', 1)
        ->where('assets.data.0.id', $matchingAsset->id));
});
