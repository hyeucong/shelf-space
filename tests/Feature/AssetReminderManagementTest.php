<?php

use App\Models\Asset;
use App\Models\Reminder;
use App\Models\User;

test('users can create reminders from the asset reminders page', function () {
    $user = User::factory()->create();
    $asset = Asset::factory()->for($user)->create();

    $this->actingAs($user)
        ->from(route('assets.reminders', $asset))
        ->post(route('assets.reminders.store', $asset), [
            'name' => 'Renew warranty',
            'description' => 'Call the vendor before coverage expires.',
            'remind_at' => '2026-05-10',
        ])
        ->assertRedirect(route('assets.reminders', $asset));

    $this->assertDatabaseHas('reminders', [
        'user_id' => $user->id,
        'asset_id' => $asset->id,
        'name' => 'Renew warranty',
        'description' => 'Call the vendor before coverage expires.',
        'remind_at' => '2026-05-10 00:00:00',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($user)->get(route('assets.reminders', $asset));

    $reminder = Reminder::query()->firstOrFail();

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('assets/reminders')
        ->has('reminders.data', 1)
        ->where('reminders.data.0.id', $reminder->id)
        ->where('reminders.data.0.name', 'Renew warranty')
        ->where('reminders.data.0.description', 'Call the vendor before coverage expires.')
        ->where('reminders.data.0.remind_at', '2026-05-10T00:00:00.000000Z'));
});
