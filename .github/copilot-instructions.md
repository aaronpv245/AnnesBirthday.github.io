<!-- Copilot / AI agent instructions for the PubBingo static site -->
# Copilot Instructions — PubBingo (aaronpv245.github.io)

Purpose: make small, safe, repository-focused edits that preserve the single-file, static-site nature of this project.

- **Big picture**: This is a single-page static site served via GitHub Pages. The UI lives entirely in `index.html`: markup, styling, and client-side JavaScript. The app constructs a 7x7 interactive bingo board and a decorative high-resolution background canvas.

- **Major components (single file)**:
  - `#main-container` (scaling container): app is designed for a base canvas and then scaled to fit the viewport. See the `resizeApp()` logic and the `transform: scale(...)` use in `index.html`.
  - Bingo grid: `BINGO_TASKS` array (list of 49 tasks), `initGrid()`, `toggleCell()` and `updateGridUI()` implement the board behavior.
  - Persistence: `STORAGE_KEY = 'anne_bingo_state_v2'` in `index.html` — state is stored in `localStorage`.
  - Background generator: Canvas with id `patternCanvas` and the `CONFIG` object (`CONFIG.sheetSize`, `CONFIG.squareSize`, `CONFIG.layoutSeed`, etc.). The generator caps devicePixelRatio at 2 to avoid oversized canvases.

- **Why structure is this way**:
  - Single-file delivery keeps the site trivial to host on GitHub Pages (no build step).
  - Inline JS/CSS simplifies small edits and preserves the intended precise visual layout and deterministic ordering used by seeded layout functions.

- **Project-specific conventions & patterns**:
  - Deterministic layout seed: `CONFIG.layoutSeed` controls the layoutRandom() LCG. To preserve reproducible decorative art, change the single seed value rather than refactoring random calls.
  - Organic shapes: cell border radii are randomized in `initGrid()` to create varied shapes — keep the generator when editing cell markup.
  - Minimal external deps: only a Google font link and browser APIs (Canvas, localStorage). Avoid adding heavy runtime dependencies or bundlers unless you migrate the whole project and update README/CNAME accordingly.

- **Developer workflows & useful commands**:
  - Clear saved board state for testing:
    - Run in console: `localStorage.removeItem('anne_bingo_state_v2')` or use the on-page `Reset Board` button.
  - Domain info: `CNAME` exists — this repo is configured for a custom domain. Avoid removing CNAME without coordination.

- **Integration points & external behavior**:
  - No backend services. All persistence uses `localStorage` and UI state.
  - External resources: Google Fonts (Playfair Display). Keep the link tag if visuals matter.

- **When making changes, prefer**:
  - Small, focused edits to `index.html`. If you split JS into modules, keep the same behavior and update `index.html` to load them; prefer relative paths and avoid introducing build steps unless requested.
  - Preserving the `STORAGE_KEY` string unless intentionally migrating the storage format (document migration steps clearly when changing the key).
  - Keeping canvas DPR cap (devicePixelRatio clamp to 2) to avoid huge memory/canvas overhead on high-DPI devices.

- **Concrete examples in repo**:
  - Tasks list: see `BINGO_TASKS` array in `index.html` (around the top of the inline script).
  - Storage key: `STORAGE_KEY = 'anne_bingo_state_v2'` (used by `loadState()` / `saveState()`).
  - Canvas config: `CONFIG.sheetSize` and `CONFIG.squareSize` control pattern density and artwork bounds.

- **Safety/caution for AI edits**:
  - This repo is user-visible on GitHub Pages (CNAME present). Avoid force-pushing large repo reorganizations without human sign-off.
  - Don't remove the `CNAME` file or significantly change the published URL without asking.
  - Large refactors (introducing build tooling, transpilers, or new packages) are out-of-scope for small PRs — propose a migration plan first.

- **Testing guidance**:
  - Manual QA is primary: preview locally, test resizing, check canvas renders, toggle cells and refresh to verify persistence.
  - Use browser DevTools to inspect `localStorage` and to throttle devicePixelRatio for testing.

If anything is unclear or you want the file split into modular JS/CSS with a build step, tell me and I will draft a migration plan and update README accordingly.
