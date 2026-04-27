<?php

use App\Models\Asset;
use App\Models\Location;
use App\Models\User;
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

    $activity = Activity::query()->sole();

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

    expect(Activity::query()->count())->toBe(0);

    $asset->update([
        'description' => 'Updated description only',
    ]);

    expect(Activity::query()->count())->toBe(0);

    $asset->update([
        'status' => 'maintenance',
    ]);

    expect(Activity::query()->count())->toBe(1);
});
