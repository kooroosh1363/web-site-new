# Curio — Resource Library

[![Quality](https://github.com/kooroosh1363/web-site-new/actions/workflows/quality.yml/badge.svg)](https://github.com/kooroosh1363/web-site-new/actions/workflows/quality.yml)
[![Deploy](https://github.com/kooroosh1363/web-site-new/actions/workflows/pages.yml/badge.svg)](https://github.com/kooroosh1363/web-site-new/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-c95836.svg)](LICENSE)

Curio is a focused, searchable library of useful web resources. It favors a small, considered collection over an endless feed and keeps the core experience fast, accessible, resilient, and private by default.

The project deliberately uses browser-native HTML, CSS, and JavaScript instead of a framework. That keeps the runtime dependency-free while still providing URL-backed application state, local persistence, validation, automated tests, and continuous delivery.

## Product capabilities

- Instant multi-field search across titles, descriptions, categories, types, and tags
- Category filters and four sorting modes
- Device-local bookmarks and theme preference
- Shareable search, category, sort, and saved-resource state through URL parameters
- Browser Back/Forward restoration for filter state
- Keyboard shortcut (`/`) for quick search access
- Accessible native dialog, live result updates, semantic landmarks, and keyboard navigation
- Responsive editorial layout for mobile, tablet, and desktop
- Light and dark themes, including system-theme changes when no preference is stored
- Graceful empty, loading, storage-disabled, invalid-data, and network-error behavior
- Zero runtime dependencies and no tracking

## Engineering decisions

### Browser-native first

Curio does not need a client framework for its current scale. Static JSON is fetched once, pure functions derive the visible catalog, and a reusable HTML template renders cards. This reduces bundle size, dependency churn, and deployment complexity.

### Explicit state boundaries

The application keeps three kinds of state intentionally separate:

- **Catalog state** — immutable resource data loaded from `data/resources.json`
- **Shareable view state** — query, category, sort, and saved-only filter stored in the URL
- **Device preference state** — bookmarks and explicit theme preference stored in `localStorage`

URL parsing and serialization live in a pure module so navigation behavior can be tested outside the browser UI.

### Data is treated as production input

The catalog is validated both in CI and at runtime. Invalid records fail fast instead of producing partially broken cards.

Validation covers:

- required non-empty fields
- lowercase kebab-case IDs
- unique resource IDs
- non-empty and non-duplicated tags
- HTTPS resource URLs
- real `YYYY-MM-DD` dates
- positive, unique curator-order values

### Progressive resilience

Storage access is wrapped so the core experience remains usable when local storage is blocked. Catalog fetch and validation failures surface a recoverable error state instead of failing silently.

## Run locally

The catalog is loaded with `fetch`, so serve the project over HTTP instead of opening `index.html` directly.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Quality checks

Node.js 20 or newer is required.

Run the complete quality gate:

```bash
npm run check
```

That command performs:

1. JavaScript syntax checks
2. production catalog validation
3. the complete Node test suite

Run individual checks with:

```bash
npm run validate:data
npm test
```

## Project structure

```text
.
├── index.html
├── css/
│   └── styles.css
├── data/
│   └── resources.json
├── js/
│   ├── app.js
│   ├── catalog.js
│   ├── resource-schema.js
│   ├── storage.js
│   └── url-state.js
├── scripts/
│   └── validate-resources.js
├── tests/
│   ├── catalog.test.js
│   ├── resource-schema.test.js
│   └── url-state.test.js
└── .github/workflows/
    ├── pages.yml
    └── quality.yml
```

## Architecture flow

```text
resources.json
     │
     ▼
resource validation
     │
     ▼
 application state ◄──── URL state
     │                    ▲
     │                    │ Back / Forward
     ▼
filter + sort
     │
     ▼
HTML template rendering
     │
     ├── bookmarks ─────► localStorage
     └── theme ─────────► localStorage / OS preference
```

The search/filter/sort functions and URL-state logic are pure modules, which keeps behavior independently testable and avoids coupling data rules to DOM rendering.

## Accessibility

The interface includes:

- a skip link and semantic landmarks
- visible keyboard focus
- accessible control labels and pressed states
- live result-count and bookmark feedback
- keyboard-operable filters and dialog
- a native modal dialog with browser-managed focus behavior
- responsive layouts for enlarged and narrow viewports
- reduced-motion support
- light and dark color systems

Accessibility is treated as part of the interaction model rather than a final styling pass.

## Continuous integration and deployment

The **Quality** workflow runs on pull requests and on pushes to `main`. A change cannot pass that gate when JavaScript syntax, catalog validation, or tests fail.

The **GitHub Pages** workflow performs the same production-readiness gate before upload and deployment. It also requests Pages enablement through GitHub's Pages action when the account/repository plan permits it.

> Repository settings and GitHub plan rules can still determine whether Pages is available for a private repository. The workflow does not change repository visibility.

## Add a resource

Add a new object to `data/resources.json` with a unique ID, valid HTTPS URL, descriptive copy, category, type, tags, ISO date, and curator order.

Then run:

```bash
npm run check
```

Invalid catalog entries are rejected before deployment.

## Trade-offs

Curio intentionally does **not** include a backend, user account, cross-device bookmark synchronization, or a search index. Those would add operational complexity that is not justified by the current catalog size.

Full browser end-to-end testing is also a logical next quality layer if the interaction surface grows significantly. The current suite focuses on the most failure-prone pure behavior and validates the real production catalog.

## Roadmap

Potential next steps, driven by product need rather than framework churn:

- automated browser-level accessibility and interaction tests
- import/export for saved resources
- optional tag-level filtering
- offline/PWA support
- richer resource health checks for stale or unavailable links
- social preview assets once the public deployment URL is finalized

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

Licensed under the [MIT License](LICENSE).
