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

test('assets edit renders the same related option lists and selected values as create', function () {
    $user = User::factory()->create();

    $category = Category::create([
        'user_id' => $user->id,
        'name' => 'Computers',
        'slug' => 'computers',
    ]);

    $location = Location::create([
        'user_id' => $user->id,
        'name' => 'Desk A',
    ]);

    $tag = Tag::create([
        'user_id' => $user->id,
        'name' => 'Portable',
    ]);

    $asset = Asset::factory()->for($user)->create([
        'name' => 'Travel Laptop',
        'asset_id' => 'AST-EDIT-1',
        'category_id' => $category->id,
        'location_id' => $location->id,
    ]);

    $asset->tags()->sync([$tag->id]);

    $response = $this->actingAs($user)->get(route('assets.edit', $asset));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('assets/edit')
        ->where('asset.id', $asset->id)
        ->where('asset.category_id', $category->id)
        ->where('asset.location_id', $location->id)
        ->where('asset.tags.0', $tag->id)
        ->where('categories.0.id', $category->id)
        ->where('locations.0.id', $location->id)
        ->where('tags.0.id', $tag->id));
});

test('assets can be updated with category location and tags from the edit form', function () {
    $user = User::factory()->create();

    $originalTag = Tag::create([
        'user_id' => $user->id,
        'name' => 'Old Tag',
    ]);

    $newCategory = Category::create([
        'user_id' => $user->id,
        'name' => 'Accessories',
        'slug' => 'accessories',
    ]);

    $newLocation = Location::create([
        'user_id' => $user->id,
        'name' => 'Drawer 2',
    ]);

    $newTag = Tag::create([
        'user_id' => $user->id,
        'name' => 'Checked Out',
    ]);

    $asset = Asset::factory()->for($user)->create([
        'name' => 'USB Adapter',
        'asset_id' => 'AST-EDIT-2',
        'description' => 'Original',
    ]);

    $asset->tags()->sync([$originalTag->id]);

    $this->actingAs($user)
        ->patch(route('assets.update', $asset), [
            'name' => 'USB-C Adapter',
            'asset_id' => 'AST-EDIT-2',
            'description' => 'Updated description',
            'value' => '49.99',
            'category_id' => $newCategory->id,
            'location_id' => $newLocation->id,
            'tags' => [$newTag->id],
        ])
        ->assertRedirect(route('assets.index'));

    $asset->refresh();

    expect($asset->name)->toBe('USB-C Adapter')
        ->and($asset->description)->toBe('Updated description')
        ->and($asset->category_id)->toBe($newCategory->id)
        ->and($asset->location_id)->toBe($newLocation->id)
        ->and((float) $asset->value)->toBe(49.99)
        ->and($asset->tags()->pluck('tags.id')->all())->toBe([$newTag->id]);
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
