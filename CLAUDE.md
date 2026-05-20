# KeymapViewer - AI Agent Guide

## Project Overview

KeymapViewer is a web-based keyboard layout mapping and visualization tool. It displays keyboard configurations with key icons, supporting both WebFont and SVG rendering for a modern UI experience.

## Review and Documentation Rules (ドキュメント作成の規則)

- **日本語での記述（必須）**: 実装計画書 (`implementation_plan.md`)、タスク管理 (`task.md`)、変更内容の解説 (`walkthrough.md`) など、ユーザーが直接確認・レビューするドキュメント類はすべて**日本語**で作成・更新してください。

## Current State

**Phase**: SVG Migration Phase 2
- ✅ 40 SVG icons implemented from Microsoft Fluent UI System Icons
- 🔄 Additional icons can be added incrementally using automation script
- 📋 Icons source: https://github.com/microsoft/fluentui-system-icons

## SVG Icon Implementation

### Adding New SVG Icons (Required Reading)

**Never manually edit svg-icons.js to add new icons.** Use the automation script instead.

#### Quick Start

```bash
bash scripts/add-svg-icon.sh KC_STOP KC_HELP KC_MAIL
```

#### Dry Run (Preview Changes)

```bash
bash scripts/add-svg-icon.sh --dry-run KC_STOP
```

### How It Works

1. **Icon Name Resolution**: Script extracts icon name from `js/keymap-dictionary.js` comment
   - Example: `"KC_HELP": { text: "HELP", fluent: "\uF63E" }, // question_circle_24`
   - Extracts: `question_circle_24`

2. **SVG Lookup**: Searches FluentUI repository at `/tmp/fluentui-system-icons/assets`
   - Finds: `Question Circle/SVG/ic_fluent_question_circle_24_filled.svg`

3. **SVG Processing**: Extracts SVG content and generates proper entry

4. **File Update**: Adds new entry to `js/svg-icons.js` with correct formatting

5. **Output**: Returns JSON result for verification

### Prerequisites

- FluentUI System Icons must be cloned:
  ```bash
  git clone https://github.com/microsoft/fluentui-system-icons.git /tmp/fluentui-system-icons
  ```
- Keycode must have `fluent:` value in `js/keymap-dictionary.js`
- Bash environment available (Git Bash on Windows, WSL, native Linux/macOS)

### Example Flow

**Input**: `KC_STOP`
**Output**:
```json
{
  "keyCode": "KC_STOP",
  "success": true,
  "iconName": "dismiss_circle_24",
  "category": "utility",
  "svgSize": 1234
}
```

## File Structure

```
├── js/
│   ├── keymap-dictionary.js   ← Define keycodes + icon names here
│   ├── svg-icons.js           ← Auto-generated SVG entries (DO NOT edit manually)
│   └── ...
├── scripts/
│   ├── add-svg-icon.sh        ← Run this for new SVG icons ⭐
│   └── ...
├── SampleLayouts/
│   └── sample_numpad.json     ← Test SVG rendering
└── CLAUDE.md                  ← This file
```

## Workflow for SVG Icon Addition

1. **Identify Missing Keycode**
   - Check `js/keymap-dictionary.js` for `fluent:` values without SVG implementation
   - Verify icon name in the comment: `// icon_name_24`

2. **Run Automation Script**
   ```bash
   cd /path/to/KeymapViewer
   bash scripts/add-svg-icon.sh KC_YOUR_KEYCODE
   ```

3. **Verify Results**
   - Script outputs JSON with success/failure status
   - Check `js/svg-icons.js` for new entry
   - Test in sample layout if needed

4. **Commit Changes**
   - Only `js/svg-icons.js` is modified
   - Commit with message: `feat(svg): Add KC_YOUR_KEYCODE icon`

## Testing SVG Icons

Edit `SampleLayouts/sample_numpad.json` LAYER2 to include new keycodes:

```json
["KC_KB_POWER", "KC_COPY", "KC_CUT", "KC_PASTE", ...]
```

Run the app and verify icons display correctly.

## Known Limitations

- Some icon names in `keymap-dictionary.js` comments may not match FluentUI exactly
  - Script will fail gracefully with JSON error output
  - Manual investigation of FluentUI repo may be needed
- RGB control icons and some Japanese keys may require manual lookup

## Resources

- **FluentUI System Icons**: https://github.com/microsoft/fluentui-system-icons
- **Icon Search**: `/tmp/fluentui-system-icons/assets/` directory structure
- **Icon Metadata**: Check comments in `js/keymap-dictionary.js`

---

**Last Updated**: 2026-05-20
**Maintained By**: AI Agents + KeymapViewer Contributors
