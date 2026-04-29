---
name: inertia-react-development
description: "Inertia v3 React patterns. Focus: forms, navigation, v3 features."
---

# Inertia React v3

## Core Hooks & Components
- `<Link>`: Prefetching (`prefetch`), methods (`method="post"`).
- `<Form>`: Integrated validation, `wasSuccessful`, `processing`.
- `useForm`: Programmatic form state.
- `useHttp`: Standalone XHR (non-Inertia visits).
- `usePoll(ms)`: Automatic data refreshing.
- `setLayoutProps({})`: Dynamic layout data.

## v3 Features
- **Optimistic Updates**: `router.optimistic((props) => (...)).post(...)`.
- **Instant Visits**: `<Link href="..." component="Page" pageProps={{...}}>`.
- **Deferred Props**: Use skeletons for `undefined` states.
- **Lazy Loading**: `WhenVisible`, `InfiniteScroll`.

## Efficiency Tips
- Use `search-docs` for full API signatures.
- Follow existing component patterns in `resources/js/pages`.
- Avoid `axios`; use built-in XHR via `router` or `useHttp`.