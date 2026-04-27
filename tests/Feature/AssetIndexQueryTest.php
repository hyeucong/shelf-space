<?php

use App\Models\Asset;
use App\Models\User;

test('assets index applies filters and sorts from the request', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $highestValueAsset = Asset::factory()->for($user)->create([
        'name' => 'Alpha Scanner',
        'asset_id' => 'AST-MATCH-2',
        'status' => 'available',
        'value' => 300,
    ]);

    $nextValueAsset = Asset::factory()->for($user)->create([
        'name' => 'Bravo Camera',
        'asset_id' => 'AST-MATCH-1',
        'status' => 'available',
        'value' => 200,
    ]);

    Asset::factory()->for($user)->create([
        'name' => 'Below Minimum',
        'asset_id' => 'AST-LOW-1',
        'status' => 'available',
        'value' => 100,
    ]);

    Asset::factory()->for($user)->create([
        'name' => 'Wrong Status',
        'asset_id' => 'AST-STATUS-1',
        'status' => 'retired',
        'value' => 500,
    ]);

    Asset::factory()->for($otherUser)->create([
        'name' => 'Other User Asset',
        'asset_id' => 'AST-OTHER-1',
        'status' => 'available',
        'value' => 1000,
    ]);

    $response = $this->actingAs($user)->get(route('assets.index', [
        'status' => 'available',
        'value_min' => '150',
        'sorts' => 'value:desc,name:asc',
        'per_page' => 100,
    ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('assets/index')
        ->where('filters.status', 'available')
        ->where('filters.value_min', '150')
        ->where('filters.per_page', 100)
        ->where('sorts.0.field', 'value')
        ->where('sorts.0.order', 'desc')
        ->where('sorts.1.field', 'name')
        ->where('sorts.1.order', 'asc')
        ->has('assets.data', 2)
        ->where('assets.data.0.id', $highestValueAsset->id)
        ->where('assets.data.1.id', $nextValueAsset->id));
});
