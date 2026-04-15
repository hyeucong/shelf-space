<?php

use App\Models\Tag;
use App\Models\User;

test('authenticated users can create tags from the index dialog flow', function () {
    $this->actingAs(User::factory()->create());

    $this->post('/tags', [
        'name' => '  Critical  ',
    ])->assertRedirect(route('tags.index'));

    $this->assertDatabaseHas('tags', [
        'name' => 'Critical',
    ]);
});

test('tag names are required and unique', function () {
    $this->actingAs(User::factory()->create());

    Tag::create([
        'name' => 'Critical',
    ]);

    $this->from('/tags')->post('/tags', [
        'name' => '   ',
    ])->assertSessionHasErrors(['name']);

    $this->from('/tags')->post('/tags', [
        'name' => ' Critical ',
    ])->assertSessionHasErrors(['name']);
});

test('authenticated users can update and delete tags', function () {
    $this->actingAs(User::factory()->create());

    $tag = Tag::create([
        'name' => 'Critical',
    ]);

    $this->put("/tags/{$tag->id}", [
        'name' => '  Urgent  ',
    ])->assertRedirect(route('tags.index'));

    $this->assertDatabaseHas('tags', [
        'id' => $tag->id,
        'name' => 'Urgent',
    ]);

    $this->delete("/tags/{$tag->id}")->assertRedirect(route('tags.index'));

    $this->assertDatabaseMissing('tags', [
        'id' => $tag->id,
    ]);
});

test('tag create and edit pages are not exposed', function () {
    $this->actingAs(User::factory()->create());

    $tag = Tag::create([
        'name' => 'Critical',
    ]);

    $this->get('/tags/create')->assertNotFound();
    $this->get("/tags/{$tag->id}/edit")->assertNotFound();
});
