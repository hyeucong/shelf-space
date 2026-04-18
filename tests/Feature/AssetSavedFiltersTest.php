<?php

use App\Models\Asset;
use App\Models\User;

test('users can save asset filters', function () {
    $user = User::factory()->create();

    Asset::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('assets.saved-filters.store'), [
            'name' => 'Available assets',
            'filters' => [
                'status' => 'available',
                'category_id' => '',
                'location_id' => '',
                'asset_id' => '',
                'value_min' => '',
                'value_max' => '',
            ],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('user_view_preferences', [
        'user_id' => $user->id,
        'resource' => 'assets.index',
        'name' => 'Available assets',
    ]);
});

test('assets index only returns the authenticated users saved filters', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    Asset::factory()->for($user)->create();

    $user->viewPreferences()->create([
        'resource' => 'assets.index',
        'key' => 'mine',
        'name' => 'Mine',
        'settings' => [
            'filters' => ['status' => 'available'],
        ],
    ]);

    $otherUser->viewPreferences()->create([
        'resource' => 'assets.index',
        'key' => 'theirs',
        'name' => 'Theirs',
        'settings' => [
            'filters' => ['status' => 'retired'],
        ],
    ]);

    $response = $this->actingAs($user)->get(route('assets.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('assets/index')
        ->has('savedFilters', 1)
        ->where('savedFilters.0.name', 'Mine'));
});
