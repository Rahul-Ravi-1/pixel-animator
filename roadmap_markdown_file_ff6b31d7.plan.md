---
name: Roadmap Markdown File
overview: Plan a single standalone markdown document (no code changes) that captures future todos, a modular architecture target aligned with your current App.jsx responsibilities, deployment options including Render and installable paths, MVP feature scope, and an explicit note about today’s single-file coupling problem.
todos:
  - id: choose-path
    content: "Pick file path: ROADMAP.md at repo root vs docs/ROADMAP.md"
    status: pending
  - id: draft-md
    content: "Write markdown: problem note, todos, gray-box modules table, optional mermaid, deploy options, MVP + stretch"
    status: pending
  - id: mvp-export
    content: Decide in-file whether export/share is MVP or post-MVP and word it clearly
    status: pending
isProject: false
---

# Pixel Animator roadmap markdown (documentation only)

## Deliverable

- **One new file** at the repo root, e.g. [`ROADMAP.md`](/home/rahul/TOP/repos/pixel-animator/ROADMAP.md) (or [`docs/ROADMAP.md`](/home/rahul/TOP/repos/pixel-animator/docs/ROADMAP.md) if you prefer a `docs/` folder — your choice when implementing; the plan assumes root for discoverability).
- **No edits** to [`src/App.jsx`](/home/rahul/TOP/repos/pixel-animator/src/App.jsx), [`src/lib/*`](/home/rahul/TOP/repos/pixel-animator/src/lib/), or any other source files.

## Document structure (what goes in the markdown)

### 1. Opening note (problem statement)

- State clearly that **today most behavior lives in [`App.jsx`](/home/rahul/TOP/repos/pixel-animator/src/App.jsx)**: React state, refs (`canvasRef`, `rendererRef`, `animationControllerRef`), canvas bootstrap (`createCanvasRenderer`), playback wiring (`createAnimationController`), pointer → grid mapping and painting (`getGridCoords`, `applyPaint`), draw/color/erase modes (`drawMode`, `colorMode`, `resolvePaintColor`), frame timeline UI and thumbnail rendering (`drawFrameThumbnail`), and controls (clear, set size, add frame, play/stop).
- Explain the **maintainability cost**: hard to see “who calls what” and easy for changes in one place to ripple unpredictably — this doc is the **intended target architecture** and **backlog**, not a refactor by itself.

### 2. Future todo list (checkboxes)

Group checkboxes under headings, for example:

- **Architecture / separation of concerns** (see section 3 for the module list — each bullet becomes a todo like “extract X behind interface Y”).
- **Testing** (unit tests for pure libs; contract tests for module boundaries; later E2E if needed).
- **Product** (items pulled from MVP + stretch).
- **DevEx** (lint boundaries, import rules, or simple dependency graph doc — optional).

### 3. Modular “gray-box” architecture (interfaces first)

Describe **target modules** that map to what [`App.jsx`](/home/rahul/TOP/repos/pixel-animator/src/App.jsx) does today, so each can be treated as a **black/gray box** with a **small public surface** suitable for **TDD and delegation**:

| Concern today (in App) | Suggested module / boundary | Interface idea (examples) |
|------------------------|----------------------------|---------------------------|
| Grid data + paint ops | Already partly in [`gridModel.js`](/home/rahul/TOP/repos/pixel-animator/src/lib/gridModel.js) | `createGrid`, `setPixel`, `cloneGrid` — keep pure; optional `GridSession` facade for “current grid + size” |
| Canvas sizing + redraw | Partly in [`canvasRenderer.js`](/home/rahul/TOP/repos/pixel-animator/src/lib/canvasRenderer.js) | `resizeForGrid`, `redraw`, `drawPixel` — hide DOM canvas details |
| Playback + frame list | Partly in [`animationController.js`](/home/rahul/TOP/repos/pixel-animator/src/lib/animationController.js) | `addFrame`, `togglePlayback`, `getFrames`, callbacks — isolate timing from React |
| Pointer → cell coordinates | Inline in App | `pointerToGrid(canvas, event, gridSize)` pure helper or small `InputMapper` |
| Tool / color resolution | Inline (`resolvePaintColor`, modes) | `PaintTool` / `resolveColor(mode)` — pure, easy to test |
| Thumbnail rendering | `drawFrameThumbnail` in App | `renderFrameThumbnail(canvas, frame, opts)` in lib or `ThumbnailRenderer` |
| Composition / React shell | Thin `App` or hooks | `usePixelEditor()` orchestrates the above; UI components only bind events |

Add a short **mermaid** diagram in the markdown (optional but useful): `UI` → `EditorController` → `GridModel` / `Renderer` / `AnimationController` / `Input`.

Emphasize: **define TypeScript types or JSDoc `@typedef` contracts** per module *when you implement* — the markdown only recommends that pattern.

### 4. Deployment options

Include a subsection **“Deployment ideas”** with pros in one line each:

- **[Render](https://render.com)** — static site or web service; good for Vite `build` → static hosting; simple env if you add a backend later.
- **Vercel / Netlify / Cloudflare Pages** — zero-config static deploy from Git; preview URLs; edge-friendly.
- **GitHub Pages / GitLab Pages** — free static hosting; slightly more manual CI.
- **“Installable” paths** (clarify in doc):
  - **PWA** (manifest + service worker) — install from browser; still a web app.
  - **Tauri / Electron** — desktop installable; bundles a webview; more packaging work.
- **Docker + any host** — image serves `nginx` with static assets; portable.
- **Self-hosted** — VPS + Caddy/nginx.

Note: this project is **Vite + React** ([`vite.config.js`](/home/rahul/TOP/repos/pixel-animator/vite.config.js)); default deploy artifact is **`npm run build` → `dist/`** unless you add SSR.

### 5. MVP feature list (essential)

Tailored to **current** capabilities, MVP bullets should read as “ship-quality” essentials, e.g.:

- **Core editor**: configurable grid size, draw / erase, at least one predictable color mode (fixed + optional random), clear canvas.
- **Frames**: add frame, visible timeline with thumbnails, frame count accurate during playback.
- **Playback**: play / stop with correct frame application and UI state.
- **Performance / UX baseline**: crisp pixels (no smoothing), reasonable max grid size, basic responsive or fixed layout that does not break painting hit-testing.
- **Export (MVP decision)**: either explicitly **defer** GIF/PNG/APNG export to post-MVP, or list **“export as PNG strip / GIF”** as MVP if you need shareability — the markdown can present **two tiers**: “MVP core” vs “MVP+ share”.

(When you write the file, pick one stance on export so MVP is unambiguous.)

### 6. Stretch / post-MVP (short list)

- Undo/redo, onion skinning, palette editor, layers, project save/load (JSON), keyboard shortcuts, touch support, accessibility.

---

## Implementation step (after you approve)

- Add the single markdown file with the sections above; **no codebase changes** beyond that file.
