# KeymapViewer - AI Agent Guide

## Purpose

This file defines repository-wide rules for AI coding agents working in this project.
It is intended to be the common source of truth across tools, environments, and agent vendors.

Use this document for stable project rules.
Do not treat it as a temporary task memo, phase log, or scratchpad.

## Core Rules

- Always update `implementation_plan.md` in Japanese (`日本語`) when planning or carrying out meaningful implementation work.
- Prefer repository-wide rules in this file over tool-specific habits when they conflict.
- Preserve existing user changes unless explicitly asked to revert them.
- Avoid speculative refactors. Make changes that match the current architecture and verified needs.
- Keep instructions here general and durable. Task-specific notes belong in `implementation_plan.md`, commit messages, or PR descriptions.
- No Rushing or Impatience: Do not urge the user to implement things quickly in code comments or chat. Progress at the user's pace.
- Explain First, Implement Second: For complex logic, explicitly explain the architectural approach and get user confirmation before modifying multiple files.

## Project Overview

KeymapViewer is a web-based keyboard layout mapping and visualization tool.
It renders keyboard layouts, legends, layers, encoder behavior, and category-specific icons.
The UI supports both text-based and SVG-based icon rendering.

## Current Architecture

- js/utils/
  - Helper functions, label parsers, and validation logic. Always separate pure logic into this directory rather than bloating components.
- js/utils/hid/ (Future extension)
  - Reserved for hardware communication modules (e.g., WebHID and protocol parsers).

### Entry And App Structure

- `index.html`
  - Browser entry point.
- `js/main.js`
  - Bootstraps the application.
- `js/app.js`
  - Top-level application state and orchestration.

### Components

- `js/components/`
  - Core UI components.
- `js/components/Keycap.js`
  - Keycap assembly and pre-render orchestration.
- `js/components/keycapStyles.js`
  - Shared keycap style and frame helpers.
- `js/components/keycapIconUtils.js`
  - Keycap icon/category normalization and display-state helpers.
- `js/components/keycapRenderers.js`
  - Shared SVG rendering helpers.
- `js/components/keycapEncoder.js`
  - Encoder-specific keycap rendering.
- `js/components/keycapSections.js`
  - Export surface for keycap section renderers.
- `js/components/keycapLayerSection.js`
  - Layer-key renderer.
- `js/components/keycapModSection.js`
  - Mod-key renderer.
- `js/components/keycapStandardSection.js`
  - Standard key renderer.
- `js/components/Keyboard.js`
  - Keyboard layout rendering.
- `js/components/DeviceSlot.js`
  - Device card, controls, and per-device orchestration.
- `js/components/Header.js`
  - Header and top-level controls.
- `js/components/Modals/`
  - Modal UIs such as export/help/macro dialogs.

### Icon System

- `js/svg-icons.js`
  - Aggregates modular SVG icon sources and exports runtime helpers.
- `js/icons/`
  - Modular SVG icon sources by category.
  - Current categories include `system`, `media`, `wireless`, `mouse`, `keyboard`, `edit`, `rgb`, `web`, `utility`, and `aliases`.
- `js/keymap-dictionary.js`
  - Keycode dictionary and Fluent icon metadata.
- `js/fluent-icons-map.json`
  - Supporting Fluent icon mapping data.

### Utilities And Data

- `js/utils/labelParser.js`
  - Key label parsing and normalization logic.
- `js/utils/helpers.js`
  - Shared non-keycap helper utilities.
- `SampleLayouts/`
  - Sample layout data for manual verification.
- `json_public/`
  - Service-bundled public or review-cleared VIA definition JSON data.
- `json_private/`
  - Private local JSON data kept out of version control.

### Scripts

- `scripts/add-svg-icon.js`
  - Canonical SVG icon addition workflow.
- `scripts/add-svg-icon.sh`
  - Shell wrapper for the Node-based SVG addition workflow.
- `scripts/add-mouse-icons-robust.js`
  - Compatibility helper related to icon addition workflow.
- `scripts/fix-keyboard.js`
  - Keyboard-related maintenance helper.

### Documentation And Planning

- `AGENTS.md`
  - Common agent rules for this repository.
- `CLAUDE.md`
  - Optional tool-specific supplement if needed.
- `implementation_plan.md`
  - Active implementation plan, always maintained in Japanese.
- `plans/`
  - Additional planning artifacts.
- `docs/`
  - Project documentation when present.

## Agent Workflow

### Planning

- For non-trivial implementation work, create or update `implementation_plan.md`.
- Write all plan text in Japanese.
- Keep the plan focused on the active task, not stale historical phases.

### Before Editing

- Read the relevant files first.
- Prefer understanding the current architecture before proposing structural changes.
- If a file was recently modularized, preserve that direction instead of re-centralizing logic.

### While Editing

- Keep related responsibilities together.
- Prefer adding a small focused module over growing a large catch-all module.
- If extracting helpers, give them durable names based on responsibility, not on the current task.
- Avoid duplicating logic across icon categories, keycap modes, or render branches when a shared helper is appropriate.

### After Editing

- Run the most relevant local verification available.
- If you cannot run browser verification directly, explicitly note that and rely on static or script-based verification.
- Summarize what changed and any remaining risks.

## SVG Icon Rules

### Source Of Truth

- Do not manually add new SVG icon entries directly to `js/svg-icons.js`.
- Add icons through the supported automation flow, currently centered on `scripts/add-svg-icon.js` and its shell wrapper.
- Update category modules under `js/icons/` through the supported tooling path, not by ad hoc edits to the aggregate layer.

### Metadata

- When adding or updating Fluent-backed keys, keep `js/keymap-dictionary.js` metadata aligned with the intended icon.
- Treat dictionary comments and Fluent references as part of the icon resolution workflow.

### Categories

- Keep icon additions aligned with the modular category layout in `js/icons/`.
- Do not collapse modular icon files back into a monolithic source.

## Testing And Verification

### Preferred Checks

- Use lightweight static verification first when appropriate.
- Relevant examples in this repository include:
  - `node --check <file>`
  - `node --input-type=module -e "import('./js/test-svg-validation.js')"`
  - `node scripts/add-svg-icon.js --dry-run <KEYCODE>`

### UI Verification

- Use `SampleLayouts/` for manual display checks.
- When verifying icon rendering, prefer checking representative categories rather than only one key type.
- If browser testing is performed by the user rather than the agent, record that clearly in the handoff or summary.
- When checking UI additions (like tooltips or inspectors), ensure they support both Light and Dark/AppDark themes correctly without hardcoding color values.

### Test Scripts

- Keep validation scripts aligned with the current module structure.
- If architecture changes, update helper scripts and validation scripts in the same line of work when they would otherwise become stale.

## Documentation Rules

- Keep `AGENTS.md` general, stable, and tool-agnostic.
- Put tool-specific or vendor-specific supplements in separate files such as `CLAUDE.md` only when necessary.
- Do not embed obsolete phase tracking, one-off migration notes, or temporary status markers here.
- Prefer documenting enduring workflows, architecture, and constraints.

## Good Defaults For Future Agents

- Assume `AGENTS.md` is intended to be committed and shared unless the user explicitly chooses a local-only workflow.
- Treat `implementation_plan.md` as the active execution artifact and `AGENTS.md` as the stable policy artifact.
- When in doubt, optimize for maintainability, modularity, and consistency with the current file structure.

---

Last Updated: 2026-05-26
Maintained By: AI Agents + KeymapViewer Contributors
