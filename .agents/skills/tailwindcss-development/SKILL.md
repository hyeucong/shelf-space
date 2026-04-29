---
name: tailwindcss-development
description: "Tailwind v4 styling. Focus: v4 syntax, performance, UI quality."
---

# Tailwind CSS v4

## v4 Essentials
- **CSS-First**: Use `@theme` in CSS, no `tailwind.config.js`.
- **Imports**: Use `@import "tailwindcss";`.
- **Utilities**: No opacity-specific utilities (e.g., `bg-opacity-*`). Use numeric variants: `bg-black/50`.

## Best Practices
- **Spacing**: Use `gap` over margins where possible.
- **Dark Mode**: Always use `dark:` variants to match project style.
- **WOW Factor**: Use gradients, smooth shadows, and modern HSL/OKLCH colors.
- **Premium UI**: Leverage `resources/css/app.css` for custom theme tokens.

## Common Layouts
- **Flex**: `flex items-center justify-between gap-4`.
- **Grid**: `grid grid-cols-1 md:grid-cols-3 gap-6`.

Check existing components for design tokens before adding new colors.