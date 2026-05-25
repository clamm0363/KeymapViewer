#!/bin/bash

###############################################################################
# SVG Icon Automation Script for KeymapViewer
# Compatibility wrapper that delegates to the maintained Node.js implementation.
#
# Usage:
#   bash scripts/add-svg-icon.sh KC_HELP KC_UNDO KC_CUT
#   bash scripts/add-svg-icon.sh --dry-run KC_HELP
###############################################################################

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_SCRIPT="$PROJECT_ROOT/scripts/add-svg-icon.js"

if [[ ! -f "$NODE_SCRIPT" ]]; then
  echo "❌ Missing Node implementation: $NODE_SCRIPT" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is required to run scripts/add-svg-icon.sh" >&2
  exit 1
fi

exec node "$NODE_SCRIPT" "$@"
