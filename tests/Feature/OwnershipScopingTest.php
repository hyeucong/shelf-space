<?php

use App\Models\Asset;
use App\Models\Category;
use App\Models\Location;
use App\Models\Tag;
use App\Models\User;

test('assets index only returns the authenticated users assets', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $visibleAsset = Asset::factory()->for($user)->create([
        'name' => 'Visible Laptop',
        'asset_id' => 'AST-VISIBLE-1',
    ]);

    Asset::factory()->for($otherUser)->create([
        'name' => 'Hidden Laptop',
        'asset_id' => 'AST-HIDDEN-1',
    ]);

    $response = $this->actingAs($user)->get(route('assets.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('assets/index')
        ->has('assets.data', 1)
        ->where('assets.data.0.id', $visibleAsset->id)
        ->where('assets.data.0.name', 'Visible Laptop'));
});

test('users cannot view another users category route binding', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $foreignCategory = Category::create([
        'user_id' => $otherUser->id,
        'name' => 'Foreign Category',
        'slug' => 'foreign-category',
    ]);

    $this->actingAs($user)
        ->put("/categories/{$foreignCategory->id}", [
            'name' => 'Updated',
            'description' => null,
            'hex_color' => null,
        ])
        ->assertNotFound();
});

test('assets cannot be attached to another users related records', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $foreignCategory = Category::create([
        'user_id' => $otherUser->id,
        'name' => 'Other Category',
        'slug' => 'other-category',
    ]);

    $foreignLocation = Location::create([
        'user_id' => $otherUser->id,
        'name' => 'Other Location',
    ]);

    $foreignTag = Tag::create([
        'user_id' => $otherUser->id,
        'name' => 'Other Tag',
    ]);

    $this->actingAs($user)
        ->from(route('assets.create'))
        ->post(route('assets.store'), [
            'name' => 'Scoped Asset',
            'asset_id' => 'AST-SCOPED-1',
            'category_id' => $foreignCategory->id,
            'location_id' => $foreignLocation->id,
            'tags' => [$foreignTag->id],
        ])
        ->assertRedirect(route('assets.create'))
        ->assertSessionHasErrors(['category_id', 'location_id', 'tags.0']);

    $this->assertDatabaseMissing('assets', [
        'name' => 'Scoped Asset',
        'user_id' => $user->id,
    ]);
});

test('tag names are unique per user instead of globally', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    Tag::create([
        'user_id' => $otherUser->id,
        'name' => 'Critical',
    ]);

    $this->actingAs($user)
        ->post(route('tags.store'), [
            'name' => 'Critical',
        ])
        ->assertRedirect(route('tags.index'));

    $this->assertDatabaseHas('tags', [
        'user_id' => $user->id,
        'name' => 'Critical',
    ]);
});
