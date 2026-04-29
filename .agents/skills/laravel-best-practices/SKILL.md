---
name: laravel-best-practices
description: "Laravel backend patterns. Focus: Eloquent, Security, Performance."
---

# Laravel Best Practices

## Core Directives
1. **Consistency**: Match existing codebase patterns first.
2. **Performance**: 
   - Eager load (`with()`, `withCount()`) to kill N+1.
   - Use `select()` to limit columns.
   - Index DB columns used in filters/sorts.
3. **Security**: 
   - Use Policies for every action.
   - Validate with Form Requests.
   - No raw SQL with user input.
4. **Eloquent**: 
   - Local scopes for query reuse.
   - Use `casts()` method for attributes.
   - Return type hints on relationships.

## Quick Reference
- **N+1**: Check with `Model::preventLazyLoading()`.
- **Logic**: Extract to Actions/Services if > 10 lines in Controller.
- **Config**: Use `config()`, never `env()` outside config files.
- **Clean Code**: Run `pint` after every edit.

Use `search-docs` for specific implementation details.