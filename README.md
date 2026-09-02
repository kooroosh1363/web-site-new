# Curio — Resource Library

[![Quality](https://github.com/kooroosh1363/web-site-new/actions/workflows/quality.yml/badge.svg)](https://github.com/kooroosh1363/web-site-new/actions/workflows/quality.yml)
[![Deploy](https://github.com/kooroosh1363/web-site-new/actions/workflows/pages.yml/badge.svg)](https://github.com/kooroosh1363/web-site-new/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-c95836.svg)](LICENSE)

Curio is a focused, searchable library of useful web resources. It favors a small, considered collection over an endless feed and keeps the core experience fast, accessible, and private by default.

## Features

- Instant multi-field search across titles, descriptions, categories, types, and tags
- Category filters and four sorting modes
- Device-local bookmarks and theme preference
- Shareable search and filter state through URL parameters
- Keyboard shortcut (`/`) for quick search access
- Accessible native dialog, live result updates, and complete keyboard navigation
- Responsive editorial layout for mobile, tablet, and desktop
- Light and dark themes with reduced-motion support
- Graceful empty, loading, and error states
- Zero runtime dependencies and no tracking

## Run locally

The catalog is loaded with `fetch`, so serve the project over HTTP instead of opening `index.html` directly.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Test

Node.js 20 or newer is required.

```bash
npm test
```

Run syntax checks and the complete test suite together:

```bash
npm run check
```

## Project structure

```text
.
├── index.html                  # Semantic application shell
├── css/styles.css              # Tokens, layout, themes, and responsive states
├── data/resources.json         # Curated catalog data
├── js/
│   ├── app.js                  # UI state, rendering, and interactions
│   ├── catalog.js              # Pure search, filter, and sort functions
│   └── storage.js              # Safe local preference persistence
├── tests/catalog.test.js       # Unit tests for catalog behavior
└── .github/workflows/          # Quality checks and Pages deployment
```

## Architecture

Curio deliberately uses browser-native capabilities. The static JSON catalog is fetched once, pure functions derive the visible collection, and the interface is rendered from a reusable HTML template. Bookmarks and theme preferences remain in `localStorage`; filter state is stored in the URL so a view can be shared without a server.

This separation keeps catalog logic independently testable and makes the site deployable on any static host.

## Accessibility

The interface includes a skip link, semantic landmarks, visible focus states, accessible labels, live result counts, keyboard-operable controls, a native modal dialog, sufficient color contrast, and reduced-motion behavior. The layout remains usable at narrow widths and with enlarged text.

## Add a resource

Add a new object to `data/resources.json` with a unique `id`, valid URL, descriptive copy, category, type, tags, ISO date, and curator order. Keep descriptions concise and explain the practical value in `note`.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

Licensed under the [MIT License](LICENSE).
