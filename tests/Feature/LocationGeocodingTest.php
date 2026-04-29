<?php

use App\Models\Location;
use App\Models\User;
use Illuminate\Support\Facades\Http;

test('it geocodes address when creating a location', function () {
    $user = User::factory()->create();

    Http::fake([
        'nominatim.openstreetmap.org/*' => Http::response([
            [
                'lat' => '51.5074',
                'lon' => '-0.1278',
            ]
        ], 200)
    ]);

    $location = Location::create([
        'user_id' => $user->id,
        'name' => 'London Eye',
        'address' => 'London, UK',
    ]);

    expect($location->latitude)->toBe('51.5074');
    expect($location->longitude)->toBe('-0.1278');

    Http::assertSent(function ($request) {
        return str_contains($request->url(), 'nominatim.openstreetmap.org') &&
               $request['q'] === 'London, UK';
    });
});

test('it updates geocoding when address changes', function () {
    $user = User::factory()->create();

    $location = Location::create([
        'user_id' => $user->id,
        'name' => 'Original Name',
        'address' => 'Old Address',
        'latitude' => '1.0000',
        'longitude' => '1.0000',
    ]);

    Http::fake([
        'nominatim.openstreetmap.org/*' => Http::response([
            [
                'lat' => '48.8566',
                'lon' => '2.3522',
            ]
        ], 200)
    ]);

    $location->update([
        'address' => 'Paris, France',
    ]);

    expect($location->latitude)->toBe('48.8566');
    expect($location->longitude)->toBe('2.3522');
});

test('it does not geocode if address has not changed', function () {
    Http::fake();
    $user = User::factory()->create();
    
    $location = Location::create([
        'user_id' => $user->id,
        'name' => 'Static',
        'address' => 'Same Place',
        'latitude' => '10.0000',
        'longitude' => '20.0000',
    ]);

    $location->update(['name' => 'Updated Name']);

    Http::assertSentCount(1); // Only sent once during creation
    expect((float)$location->latitude)->toBe(10.0);
    expect((float)$location->longitude)->toBe(20.0);
});
