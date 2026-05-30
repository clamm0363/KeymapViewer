# KeymapViewer - Claude Supplement

> **Note**: This file is a Claude-specific supplement only.
> Repository-wide rules, architecture, and workflow are defined in [`AGENTS.md`](./AGENTS.md).
> Always read `AGENTS.md` first. This file only documents Claude-specific behaviors or environment differences.

---

## Claude-Specific Notes

### Command Syntax

Claude runs commands in a Windows PowerShell environment by default.
Use PowerShell-compatible syntax when proposing terminal commands.

```powershell
# Correct (PowerShell)
npm run test
npm run lint
node --check js/components/Keyboard.js

# Avoid (bash-only syntax in PowerShell context)
node --check js/components/Keyboard.js && npm run test
```

For bash scripts (e.g., `scripts/add-svg-icon.sh`), the user may run them via Git Bash or WSL.
When proposing shell script execution, note which environment is required.

### SVG Icon Automation — Windows Path Note

`scripts/add-svg-icon.sh` expects the FluentUI System Icons repository to be cloned locally.
The default path referenced in CLAUDE.md history was `/tmp/fluentui-system-icons`, which is not
available on Windows without WSL. Confirm the clone location with the user before running.

The Node.js script `scripts/add-svg-icon.js` can be called directly from PowerShell:

```powershell
node scripts/add-svg-icon.js KC_YOUR_KEYCODE
node scripts/add-svg-icon.js --dry-run KC_YOUR_KEYCODE
```

### File Encoding

Source files in this repository use LF line endings (enforced by `.prettierrc`).
Claude should not introduce CRLF when writing or patching files.

---

## Quick Reference (Claude)

| Task | Command |
|---|---|
| Start local server | `npm start` → `http://127.0.0.1:5501` |
| Run tests | `npm run test` |
| Lint check | `npm run lint` |
| Format code | `npm run format` |
| Syntax check one file | `node --check <file>` |
| Add SVG icon (Node) | `node scripts/add-svg-icon.js <KEYCODE>` |
| Add SVG icon (bash) | `bash scripts/add-svg-icon.sh <KEYCODE>` |
| Validate SVG icons | `node --input-type=module -e "import('./js/test-svg-validation.js')"` |

---

Last Updated: 2026-05-30
Maintained By: AI Agents + KeymapViewer Contributors
