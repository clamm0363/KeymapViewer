# Keymap Viewer: Essential Developer Reference Guide

This document serves as a permanent reference guide for Keymap Viewer's project architecture, development environments, and legacy file warnings. **Always review this document when starting new tasks or onboarding to the repository.**

---

## 1. Environment & Local Server Information

* **Local URLs**:
  * Primary: `http://localhost:5500/` or `http://127.0.0.1:5500/index.html` (VS Code Live Server)
  * Secondary: `http://localhost:8000/` (Alternative dev server)
* **Runtime Environment**:
  * Native ES Modules (`<script type="module">`) loaded directly in-browser.
  * **No build, bundling, or compiler steps** (Webpack/Vite are not active in this development setup; edits to `.js` files take effect immediately).
  * **Aggressive Browser Caching Note**: Chrome/Edge dynamically imported modules (e.g., `Keyboard.js`) are heavily cached. When testing changes, **always open DevTools (F12) -> Network Tab -> Check "Disable cache" -> Reload (F5)** to force-reload latest ES Module files.

---

## 2. Active Project Structure (Reference Order)

Below are the actively maintained, modern source files of the visualizer. Avoid editing or referencing anything outside this list for core logic.

```
c:\Git\KeymappingViewer\
├── index.html                   # Core web entrypoint (loads Tailwind CSS & UMD React)
├── index.css                    # Custom vanilla CSS and glassmorphism styling
├── js/
│   ├── main.js                  # Initializes React Root inside #root
│   ├── app.js                   # Core React application entry point on disk (lowercase 'a')
│   ├── constants.js             # Static Maps (SYMBOL_MAP, FLUENT_MAP) and layout definitions
│   ├── keymap-dictionary.js     # Key definitions (standard texts, Fluent UI System Icons code points)
│   ├── components/
│   │   ├── Keyboard.js          # Core visualizer component (keycaps, offsets, space-gray bezel, baselineOutfit fonts)
│   │   ├── DeviceSlot.js        # Multi-slot container component
│   │   ├── Header.js            # Toolbar theme controllers and global controls
│   │   └── Modals/              # Modal windows for secondary features
│   │       ├── ExportModal.js   # Image and data layout export modal
│   │       ├── HelpModal.js     # User shortcut key guide modal
│   │       └── MacroModal.js    # QMK/VIA Macro list display modal
│   └── utils/
│       ├── labelParser.js       # Core key string parser (OS-Aware WIN/CMD & ALT/OPT modifier translations)
│       └── helpers.js           # Lightweight string sanitization and wrap helper utilities
```

---

## 3. Keyboard Component Layout & Styling Standards

All visual keys are structured under a strict design system inside [js/components/Keyboard.js](file:///c:/Git/KeymappingViewer/js/components/Keyboard.js):

* **Auto-Scaled Proportional Legends**:
  * We use a uniform, letter-count based text scaling pattern in `getMainLegendStyle` (e.g., 3-character words like `DEL`/`NUM` scaled to `0.85`, 4-character words scaled to `0.70` on 1u, `0.85` on 1.25u+).
* **Absolute Font Size & Line-Height Resilience**:
  * Fluent Icon font sizes are defined at a fixed pixel scale (**`22px`** for normal legends, **`20px`** for split keys `key-mod-main`).
  * Enforced **`lineHeight: '1'`** on all key text elements (`getMainLegendStyle`, `getFooterTextStyle`, `getOffsetPrimaryStyle`, `getOffsetSecondaryStyle`) to insulate the layout against custom browser default font sizes or custom line-height defaults.
* **Unified Footer Baseline Alignment**:
  * The vertical text translation factor `getFooterTextStyle` is set to **`translateY = -1px`** across all keycap styles (layer `LT` footers and modifier/modifier-tap footers) to ensure all footer legends align perfectly straight on the exact same vertical baseline under both Light and Dark themes.
* **Premium Anodized Space Gray CNC Chassis**:
  * The visual keyboard container employs a premium Space Gray diagonal brushed-metal bezel (`bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500` under light theme global) to smooth the visual transition between slate-dark keycaps and clean white viewports.

---

## 4. Native OS-Aware Modifier Parsing Standards

We employ deep, OS-specific legend parsing inside [js/utils/labelParser.js](file:///c:/Git/KeymappingViewer/js/utils/labelParser.js):

* **OS-Aware Translation**:
  * Raw technical modifier keycodes are automatically converted to their OS equivalents based on the layout's active `keyStyle`:
    * Technical `GUI` $\rightarrow$ **`WIN`** (Windows Mode) / **`CMD`** (Mac Mode).
    * Technical `ALT` $\rightarrow$ **`ALT`** (Windows Mode) / **`OPT`** (Mac Mode).
* **Multi-Modifier Combined Footer Shortcuts**:
  * Combined modifiers in footers employ targeted shortcut abbreviation maps:
    * Windows: `C` (Ctrl), `S` (Shift), `A` (Alt), `G` (GUI). E.g., `CTRL + ALT` $\rightarrow$ **`C+A`**.
    * Mac: `C` (Control), `S` (Shift), `O` (Option), `⌘` (Command). E.g., `CTRL + ALT` $\rightarrow$ **`C+O`**, `CTRL + GUI` $\rightarrow$ **`C+⌘`**.

---

## 5. QMK Keycode & Font Point Specification

Always refer to the active [plans/handover_report.md](file:///c:/Git/KeymappingViewer/plans/handover_report.md) for the exact code points mapping advanced QMK keycodes (RGB matrix, Bluetooth BLE wireless channels, Mouse emulate clicks, Bootloader utilities, Dynamic Macros) to the regular **Fluent UI System Icons WebFont PUA space**.

* **Avoid Segoe PUA Code Points**: Never map WebFont icons directly to Segoe-specific code points (e.g. Segoe's standard `\uE781` for lightbulb was replaced by Fluent UI System's correct `\uF4D7` to prevent rendering mobile signal graphs on QMK layouts).

---

## 6. Legacy & Low-Reference Files (DO NOT USE / RETIRED)

The following files represent outdated architectures and have been retired or contain crucial filesystem behavior notes:

* ⚠️ **`js/app.js` (lowercase `a`) - ACTIVE KEY FILE (DO NOT MOVE OR DELETE)**:
  * *Status*: **ACTIVE**. Historically, this was imported in `main.js` with an uppercase `A` (`./App.js`), which worked on Windows but caused cross-platform case-sensitivity issues. It has now been standardized to a lowercase import (`./app.js`) across the codebase to ensure robust cross-platform compatibility.
* ❌ **`legacy/via.js`**:
  * *Status*: **DEPRECATED & RETIRED**. Moved to the `legacy/` directory (untracked and gitignored). Outdated key code parser, fully superseded by the unified, robust [js/utils/labelParser.js](file:///c:/Git/KeymappingViewer/js/utils/labelParser.js).
* ❌ **`legacy/defaultData.js`**:
  * *Status*: **DEPRECATED & RETIRED**. Moved to the `legacy/` directory (untracked and gitignored). Unreferenced legacy data mock file, superseded by the JSON-loaded slots inside `SampleLayouts/`.
* ❌ **`plans/modernization_refactor_plan.md`**:
  * *Status*: Legacy architectural roadmap. Fully completed.
