<?php

use App\Models\User;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'name' => 'Updated Name',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Updated Name');
});

use Laravel\WorkOS\Http\Requests\AuthKitAccountDeletionRequest;

test('user can delete their account', function () {
    $user = User::factory()->create();

    $mock = Mockery::mock(AuthKitAccountDeletionRequest::class);
    $mock->shouldReceive('delete')
        ->once()
        ->andReturnUsing(function ($using) use ($user) {
            $user->delete();
            auth()->logout();

            return redirect('/');
        });
    $this->app->bind(AuthKitAccountDeletionRequest::class, fn () => $mock);

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertRedirect('/');

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});