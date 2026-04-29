---
name: pest-testing
description: "Pest v4 testing. Primary and only test framework."
---

# Pest Testing 4

## Mandates
- **Surgical Testing**: Write lean tests ONLY when requested or for high-risk logic.
- **Targeted Runs**: Use `php artisan test --filter Name`.
- **Pest Only**: Use `it()` or `test()` syntax. No PHPUnit classes.

## Quick Patterns
```php
it('behaves correctly', function () {
    $this->get('/')->assertSuccessful();
});

it('validates input', function ($data) {
    $this->post('/submit', $data)->assertInvalid();
})->with('invalid_data');
```

## Features
- **Browser**: `visit('/')->assertSee('...')`.
- **Smoke**: `visit(['/a', '/b'])->assertNoJavaScriptErrors()`.
- **Arch**: `arch('controllers')->expect('...')->toHaveSuffix('Controller')`.

Avoid heavy setups. Use factories with specific states.