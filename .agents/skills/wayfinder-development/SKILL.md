---
name: wayfinder-development
description: "Typed routing with Laravel Wayfinder."
---

# Wayfinder

## Usage
- **Regenerate**: `php artisan wayfinder:generate`.
- **Import**: `import { show } from '@/actions/PostController'`.
- **Call**: `show.url(id)` or `show.post(id, { query: { ... } })`.
- **Forms**: `<Form {...store.form()}>`.

## Efficiency
- Use named imports for tree-shaking.
- Never hardcode URLs in React components.
- Always use `wayfinder:generate` after modifying routes.