<laravel-boost-guidelines>
=== foundation rules ===

# Efficiency & Quota Focus
- **Be Concise**: Skip obvious explanations. Focus on the *why*, not the *what*.
- **No Redundancy**: Don't repeat code or instructions found in skills.
- **Surgical Edits**: Use `replace_file_content` for small changes. Only provide necessary context.
- **Pest Testing Only**: Ignore PHPUnit. Write lean Pest tests ONLY when requested or for critical logic.
- **No Tinkering**: Avoid unnecessary discovery commands if the structure is obvious.
- **Strict Adherence**: Do exactly what is asked. No extra "cleanup".

# Environment
- OS: Windows 11 | Shell: PowerShell 7 (pwsh)
- CRITICAL: No bash/sh. Use `;` not `&&`.

# Portfolio Project Checklist
- **Rich Aesthetics**: WOW factor is mandatory. Use modern design patterns.
- **Performance**: Zero N+1 queries. Use `with()`/`withCount()`.
- **UX**: Smooth transitions, optimistic updates, and loading states (skeletons).
- **Responsive**: Ensure it looks premium on all screen sizes.
- **Clean Code**: Run `pint` after every PHP change.

# Foundational Context
- php 8.4 | laravel 13 | inertia-laravel v3 | react v19 | tailwindcss v4
- pest v4 (Primary Testing) | wayfinder v0 | pint v1

# Skills Activation
- `laravel-best-practices`: Backend logic, Eloquent, Security.
- `wayfinder-development`: Frontend-Backend typed routing.
- `pest-testing`: Lean feature/unit testing.
- `inertia-react-development`: Inertia v3 React patterns.
- `tailwindcss-development`: Modern styling & UI components.

=== boost rules ===

# Laravel Boost Tools
- Use `search-docs` (packages scoped) before code changes.
- Use `database-schema` to inspect DB before migrating/modeling.
- Use `php artisan tinker --execute '...'` for quick debugging.
- Use `vendor/bin/pint --dirty --format agent` before finalizing.

=== inertia rules ===
- Use Inertia v3 features: `useHttp`, optimistic updates, `setLayoutProps`, deferred props.
- ALWAYS use `search-docs` for updated examples.

</laravel-boost-guidelines>
