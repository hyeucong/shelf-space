<?php

use App\Models\Category;
use App\Models\User;

test('authenticated users can create categories from the index dialog flow', function () {
    $this->actingAs(User::factory()->create());

    $this->post('/categories', [
        'name' => '  Electronics  ',
        'description' => '  Devices and accessories  ',
        'hex_color' => '  #ab339f  ',
    ])->assertRedirect(route('categories.index'));

    $this->assertDatabaseHas('categories', [
        'name' => 'Electronics',
        'description' => 'Devices and accessories',
        'hex_color' => '#ab339f',
    ]);
});

test('category input is validated and normalized', function () {
    $this->actingAs(User::factory()->create());

    $this->from('/categories')->post('/categories', [
        'name' => '   ',
        'description' => '  ',
        'hex_color' => 'bad-color',
    ])->assertSessionHasErrors(['name', 'hex_color']);
});

test('authenticated users can update and delete categories', function () {
    $this->actingAs(User::factory()->create());

    $category = Category::create([
        'name' => 'Old Name',
        'slug' => 'old-name',
        'description' => 'Old description',
        'hex_color' => '#ab339f',
    ]);

    $this->put("/categories/{$category->id}", [
        'name' => '  New Name  ',
        'description' => '   ',
        'hex_color' => '   ',
    ])->assertRedirect(route('categories.index'));

    $category->refresh();

    expect($category->name)->toBe('New Name');
    expect($category->description)->toBeNull();
    expect($category->hex_color)->toBeNull();
    expect($category->slug)->toBe('new-name');

    $this->delete("/categories/{$category->id}")->assertRedirect(route('categories.index'));

    $this->assertDatabaseMissing('categories', [
        'id' => $category->id,
    ]);
});

test('category create and edit pages are not exposed', function () {
    $this->actingAs(User::factory()->create());

    $category = Category::create([
        'name' => 'Electronics',
        'slug' => 'electronics',
    ]);

    $this->get('/categories/create')->assertNotFound();
    $this->get("/categories/{$category->id}/edit")->assertNotFound();
});
