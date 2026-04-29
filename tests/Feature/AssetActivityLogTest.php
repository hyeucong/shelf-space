<?php

use App\Models\Asset;
use App\Models\Location;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Activitylog\Models\Activity;

test('updating a tracked asset field writes an activity log entry', function () {
    $user = User::factory()->create();
    $originalLocation = Location::create([
        'user_id' => $user->id,
        'name' => 'Shelf A',
    ]);
    $newLocation = Location::create([
        'user_id' => $user->id,
        'name' => 'Shelf B',
    ]);

    $asset = Asset::factory()->for($user)->create([
        'name' => 'Office Laptop',
        'asset_id' => 'AST-LOG-1',
        'status' => 'available',
        'location_id' => $originalLocation->id,
    ]);

    $this->actingAs($user);

    $asset->update([
        'name' => 'Office Laptop Pro',
        'location_id' => $newLocation->id,
    ]);

    $activity = Activity::query()
        ->where('event', 'updated')
        ->sole();

    expect($activity->log_name)->toBe('asset')
        ->and($activity->event)->toBe('updated')
        ->and($activity->subject_type)->toBe(Asset::class)
        ->and((int) $activity->subject_id)->toBe($asset->id)
        ->and($activity->attribute_changes?->get('attributes'))->toMatchArray([
            'name' => 'Office Laptop Pro',
            'location_id' => $newLocation->id,
        ])
        ->and($activity->attribute_changes?->get('old'))->toMatchArray([
            'name' => 'Office Laptop',
            'location_id' => $originalLocation->id,
        ]);
});

test('asset activity log skips unchanged and untracked updates', function () {
    $user = User::factory()->create();
    $asset = Asset::factory()->for($user)->create([
        'name' => 'Inventory Scanner',
        'asset_id' => 'AST-LOG-2',
        'status' => 'available',
        'description' => 'Original description',
    ]);

    $this->actingAs($user);

    $asset->save();

    expect(Activity::query()->count())->toBe(1);

    $asset->update([
        'description' => 'Updated description only',
    ]);

    expect(Activity::query()->count())->toBe(1);

    $asset->update([
        'status' => 'maintenance',
    ]);

    expect(Activity::query()->count())->toBe(2);
});

test('asset activity page marks note entries as manageable and standard activity as not manageable', function () {
    $user = User::factory()->create();
    $asset = Asset::factory()->for($user)->create([
        'name' => 'Office Laptop',
        'asset_id' => 'AST-ACT-1',
        'status' => 'available',
    ]);

    $this->actingAs($user);

    $asset->update([
        'status' => 'maintenance',
    ]);

    activity()
        ->performedOn($asset)
        ->causedBy($user)
        ->event('note')
        ->inLog('notes')
        ->withProperty('note', '<p>Check battery cycle count.</p>')
        ->log('Added a note');

    $response = $this->get(route('assets.activity', $asset));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('assets/activity')
        ->has('activity', 3));

    $activities = collect($response->inertiaPage()['props']['activity']);

    expect($activities->contains(fn (array $activity) => $activity['event'] === 'note'
        && $activity['is_note'] === true
        && $activity['can_delete'] === true
        && $activity['properties']['note'] === '<p>Check battery cycle count.</p>'))->toBeTrue()
        ->and($activities->contains(fn (array $activity) => $activity['event'] === 'updated'
            && $activity['is_note'] === false
            && $activity['can_delete'] === false))->toBeTrue()
        ->and($activities->contains(fn (array $activity) => $activity['event'] === 'created'
            && $activity['is_note'] === false
            && $activity['can_delete'] === false))->toBeTrue();
});

test('users can delete note activity entries for their asset', function () {
    $user = User::factory()->create();
    $asset = Asset::factory()->for($user)->create([
        'name' => 'Docking Station',
        'asset_id' => 'AST-ACT-2',
        'status' => 'available',
    ]);

    $this->actingAs($user);

    activity()
        ->performedOn($asset)
        ->causedBy($user)
        ->event('note')
        ->inLog('notes')
        ->withProperty('note', '<p>Replace HDMI cable.</p>')
        ->log('Added a note');

    $noteActivity = Activity::query()
        ->where('event', 'note')
        ->sole();

    $this->delete(route('assets.activity.destroy', ['asset' => $asset, 'activity' => $noteActivity]))
        ->assertRedirect(route('assets.activity', $asset));

    expect(Activity::query()->whereKey($noteActivity->id)->exists())->toBeFalse();
});

test('users cannot delete standard asset activity entries through the note endpoint', function () {
    $user = User::factory()->create();
    $asset = Asset::factory()->for($user)->create([
        'name' => 'USB Hub',
        'asset_id' => 'AST-ACT-3',
        'status' => 'available',
    ]);

    $this->actingAs($user);

    $asset->update([
        'status' => 'maintenance',
    ]);

    $standardActivity = Activity::query()
        ->where('event', 'updated')
        ->sole();

    $this->delete(route('assets.activity.destroy', ['asset' => $asset, 'activity' => $standardActivity]))
        ->assertNotFound();

    expect(Activity::query()->whereKey($standardActivity->id)->exists())->toBeTrue();
});
