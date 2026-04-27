<?php

use App\Models\Asset;
use App\Models\User;

test('users can save asset column layout preferences', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('assets.layout.store'), [
            'columns' => [
                ['key' => 'id', 'visible' => false],
                ['key' => 'asset_id', 'visible' => true],
                ['key' => 'status', 'visible' => true],
            ],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('user_view_preferences', [
        'user_id' => $user->id,
        'resource' => 'assets.index',
        'key' => 'columns',
        'name' => 'Layout',
    ]);
});

test('assets index returns the saved column preferences', function () {
    $user = User::factory()->create();

    Asset::factory()->for($user)->create();

    $user->viewPreferences()->create([
        'resource' => 'assets.index',
        'key' => 'columns',
        'name' => 'Layout',
        'settings' => [
            'columns' => [
                ['key' => 'id', 'visible' => false],
                ['key' => 'asset_id', 'visible' => true],
                ['key' => 'status', 'visible' => true],
            ],
        ],
    ]);

    $response = $this->actingAs($user)->get(route('assets.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('assets/index')
        ->where('columnPreferences.0.key', 'id')
        ->where('columnPreferences.0.visible', false)
        ->where('columnPreferences.1.key', 'asset_id')
        ->where('columnPreferences.1.visible', true));
});
