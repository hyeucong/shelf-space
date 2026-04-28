<?php

use App\Models\Kit;
use App\Models\Location;
use App\Models\User;

test('location add kits page returns the authenticated users kits', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $location = Location::create([
        'user_id' => $user->id,
        'name' => 'Warehouse',
        'description' => 'Primary storage',
        'address' => '100 Inventory Way',
    ]);

    $visibleKit = Kit::create([
        'user_id' => $user->id,
        'name' => 'Field Kit',
        'description' => 'Primary field kit',
        'status' => 'active',
    ]);

    Kit::create([
        'user_id' => $otherUser->id,
        'name' => 'Hidden Kit',
        'description' => 'Should not appear',
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->get(route('locations.add-kits', $location));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('locations/add-kits')
        ->where('location.id', $location->id)
        ->where('filters.per_page', 20)
        ->where('filters.sort', 'created_at')
        ->where('filters.order', 'desc')
        ->has('kits.data', 1)
        ->where('kits.data.0.id', $visibleKit->id)
        ->where('kits.data.0.name', 'Field Kit'));
});

test('location add kits page applies kit filters and sorts', function () {
    $user = User::factory()->create();

    $location = Location::create([
        'user_id' => $user->id,
        'name' => 'Studio',
        'description' => 'Recording room',
        'address' => '22 Sound St',
    ]);

    Kit::create([
        'user_id' => $user->id,
        'name' => 'Camera Kit',
        'description' => 'Video gear',
        'status' => 'retired',
    ]);

    $matchingKit = Kit::create([
        'user_id' => $user->id,
        'name' => 'Audio Kit',
        'description' => 'Recording gear',
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->get(route('locations.add-kits', [
        'location' => $location,
        'search' => 'Audio',
        'sort' => 'name',
        'order' => 'asc',
        'per_page' => 100,
    ]));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('locations/add-kits')
        ->where('filters.search', 'Audio')
        ->where('filters.per_page', 100)
        ->where('filters.sort', 'name')
        ->where('filters.order', 'asc')
        ->has('kits.data', 1)
        ->where('kits.data.0.id', $matchingKit->id));
});

test('location kits page returns the authenticated users kits', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $location = Location::create([
        'user_id' => $user->id,
        'name' => 'Warehouse',
        'description' => 'Primary storage',
        'address' => '100 Inventory Way',
    ]);

    $visibleKit = Kit::create([
        'user_id' => $user->id,
        'name' => 'Camera Kit',
        'description' => 'Video gear',
        'status' => 'active',
    ]);

    Kit::create([
        'user_id' => $otherUser->id,
        'name' => 'Hidden Kit',
        'description' => 'Should not appear',
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->get(route('locations.kits', $location));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('locations/kits')
        ->where('location.id', $location->id)
        ->where('filters.per_page', 20)
        ->where('filters.sort', 'created_at')
        ->where('filters.order', 'desc')
        ->has('kits.data', 1)
        ->where('kits.data.0.id', $visibleKit->id));
});
