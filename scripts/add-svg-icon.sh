#!/bin/bash

###############################################################################
# SVG Icon Automation Script for KeymapViewer
# Adds Fluent UI System Icons to svg-icons.js
#
# Usage:
#   bash add-svg-icon.sh KC_HELP KC_UNDO KC_CUT
#   bash add-svg-icon.sh --dry-run KC_HELP
###############################################################################

set -o pipefail

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEYMAP_DICT="$PROJECT_ROOT/js/keymap-dictionary.js"
SVG_ICONS="$PROJECT_ROOT/js/svg-icons.js"
FLUENT_REPO="/tmp/fluentui-system-icons/assets"

# Parse CLI arguments
DRY_RUN=0
KEYCODES=()

for arg in "$@"; do
  if [[ "$arg" == "--dry-run" ]]; then
    DRY_RUN=1
  else
    KEYCODES+=("$arg")
  fi
done

if [[ ${#KEYCODES[@]} -eq 0 ]]; then
  echo '❌ Usage: bash add-svg-icon.sh [--dry-run] KEYCODE [KEYCODE...]'
  echo '   Example: bash add-svg-icon.sh KC_HELP KC_UNDO'
  exit 1
fi

###############################################################################
# Helper Functions
###############################################################################

# Extract icon name from keymap-dictionary.js
get_icon_name_from_keymap() {
  local keycode="$1"
  grep "\"$keycode\":" "$KEYMAP_DICT" | grep "fluent:" | sed 's/.*\/\/ *//;s/ *(.*//' | head -1
}

# Get fallback Unicode value from keymap-dictionary.js
get_fallback_from_keymap() {
  local keycode="$1"
  grep "\"$keycode\":" "$KEYMAP_DICT" | grep "fluent:" | sed 's/.*fluent: *"//' | sed 's/".*//' | head -1
}

# Find SVG file in FluentUI repository
find_svg_path() {
  local icon_name="$1"

  # Try different search patterns
  local search_patterns=(
    "$icon_name"
    "${icon_name%_24}"
    "${icon_name%_20}"
  )

  for pattern in "${search_patterns[@]}"; do
    local result=$(find "$FLUENT_REPO" -type f -name "*${pattern}*24_filled.svg" 2>/dev/null | head -1)
    if [[ -n "$result" ]]; then
      echo "$result"
      return 0
    fi
  done

  return 1
}

# Extract SVG content from file
extract_svg_content() {
  local svg_path="$1"

  if [[ ! -f "$svg_path" ]]; then
    return 1
  fi

  # Read SVG and escape for JSON
  cat "$svg_path" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr '\n' ' '
}

# Determine category from keycode
determine_category() {
  local keycode="$1"

  if [[ "$keycode" =~ KC_AUDIO_ ]] || [[ "$keycode" =~ KB_VOLUME ]]; then
    echo "audio"
  elif [[ "$keycode" =~ KC_MEDIA_ ]]; then
    echo "media"
  elif [[ "$keycode" =~ KC_WWW_ ]]; then
    echo "web"
  elif [[ "$keycode" =~ KC_MS_ ]] || [[ "$keycode" =~ KC_BTN ]] || [[ "$keycode" =~ KC_WH_ ]]; then
    echo "mouse"
  elif [[ "$keycode" =~ KC_RGB_ ]]; then
    echo "rgb"
  elif [[ "$keycode" =~ JP_ ]] || [[ "$keycode" =~ KC_JP_ ]]; then
    echo "jp-keys"
  elif [[ "$keycode" =~ BRIGHTNESS ]] || [[ "$keycode" =~ POWER ]] || [[ "$keycode" =~ SLEEP ]] || [[ "$keycode" =~ WAKE ]]; then
    echo "system"
  else
    echo "utility"
  fi
}

# Convert keycode to icon ID
keycode_to_id() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/_/-/g' | sed 's/$/-icon/'
}

# Format icon object as JavaScript code
format_icon_code() {
  local keycode="$1"
  local svg_content="$2"
  local fallback="$3"
  local category="$4"
  local id=$(keycode_to_id "$keycode")

  cat <<EOF
  $keycode: {
    id: '$id',
    svg: \`$svg_content\`,
    fallback: '$fallback',
    width: 24,
    height: 24,
    category: '$category'
  }
EOF
}

# Add icon to svg-icons.js
add_icon_to_file() {
  local keycode="$1"
  local icon_code="$2"

  # Find insertion point: before the closing brace of SVG_ICONS
  local insert_pos=$(tac "$SVG_ICONS" | grep -n "^};" | head -1 | cut -d: -f1)
  insert_pos=$(($(wc -l < "$SVG_ICONS") - insert_pos + 1))

  if [[ -z "$insert_pos" ]]; then
    echo "  ❌ Could not find SVG_ICONS closing brace" >&2
    return 1
  fi

  # Check if we need a comma
  local before_line=$((insert_pos - 1))
  local last_char=$(sed -n "${before_line}p" "$SVG_ICONS" | tail -c 2)
  local needs_comma=0
  [[ "$last_char" != "," ]] && needs_comma=1

  # Create temporary file with the new entry
  local temp_file=$(mktemp)

  head -n $((insert_pos - 1)) "$SVG_ICONS" > "$temp_file"

  if [[ $needs_comma -eq 1 ]]; then
    echo "," >> "$temp_file"
  fi
  echo "" >> "$temp_file"
  echo "$icon_code" >> "$temp_file"
  echo "" >> "$temp_file"

  tail -n +$insert_pos "$SVG_ICONS" >> "$temp_file"

  if [[ $DRY_RUN -eq 0 ]]; then
    mv "$temp_file" "$SVG_ICONS"
  else
    rm "$temp_file"
  fi

  return 0
}

###############################################################################
# Main Processing
###############################################################################

echo "🚀 SVG Icon Automation Script"
if [[ $DRY_RUN -eq 1 ]]; then
  echo "   [DRY RUN MODE - No changes will be made]"
fi
echo ""

# JSON output array
declare -a RESULTS

for keycode in "${KEYCODES[@]}"; do
  echo "📋 Processing: $keycode"

  # Step 1: Get icon name
  icon_name=$(get_icon_name_from_keymap "$keycode")
  if [[ -z "$icon_name" ]]; then
    echo "  ❌ Icon name not found in keymap-dictionary.js"
    RESULTS+=("{\"keyCode\": \"$keycode\", \"success\": false, \"error\": \"Icon name not found\"}")
    continue
  fi
  echo "  ✓ Icon name: $icon_name"

  # Step 2: Get fallback
  fallback=$(get_fallback_from_keymap "$keycode")
  if [[ -z "$fallback" ]]; then
    echo "  ❌ Fallback Unicode not found"
    RESULTS+=("{\"keyCode\": \"$keycode\", \"success\": false, \"error\": \"Fallback not found\"}")
    continue
  fi
  echo "  ✓ Fallback: $fallback"

  # Step 3: Find SVG
  svg_path=$(find_svg_path "$icon_name")
  if [[ -z "$svg_path" ]]; then
    echo "  ❌ SVG file not found in FluentUI repository"
    RESULTS+=("{\"keyCode\": \"$keycode\", \"success\": false, \"error\": \"SVG not found\"}")
    continue
  fi
  echo "  ✓ SVG found: $(basename "$svg_path")"

  # Step 4: Extract SVG content
  svg_content=$(extract_svg_content "$svg_path")
  if [[ -z "$svg_content" ]]; then
    echo "  ❌ Failed to extract SVG content"
    RESULTS+=("{\"keyCode\": \"$keycode\", \"success\": false, \"error\": \"SVG extraction failed\"}")
    continue
  fi
  svg_size=${#svg_content}
  echo "  ✓ SVG extracted ($svg_size bytes)"

  # Step 5: Generate icon object
  category=$(determine_category "$keycode")
  icon_code=$(format_icon_code "$keycode" "$svg_content" "$fallback" "$category")

  # Step 6: Add to svg-icons.js
  if ! add_icon_to_file "$keycode" "$icon_code"; then
    RESULTS+=("{\"keyCode\": \"$keycode\", \"success\": false, \"error\": \"Failed to add to svg-icons.js\"}")
    continue
  fi

  echo "  ✅ Successfully added to svg-icons.js"
  RESULTS+=("{\"keyCode\": \"$keycode\", \"success\": true, \"iconName\": \"$icon_name\", \"category\": \"$category\", \"svgSize\": $svg_size}")
done

# Print summary
echo ""
echo "$(printf '=%.0s' {1..50})"
echo "📊 Summary"

success_count=0
for result in "${RESULTS[@]}"; do
  if echo "$result" | grep -q '"success": true'; then
    ((success_count++))
  fi
done
failed_count=$((${#RESULTS[@]} - success_count))

echo "  ✅ Successful: $success_count"
echo "  ❌ Failed: $failed_count"

if [[ $DRY_RUN -eq 1 ]]; then
  echo "   (Dry run - no changes made)"
fi

# Print JSON output
echo ""
echo "📋 JSON Output:"
echo "["
for i in "${!RESULTS[@]}"; do
  echo "${RESULTS[$i]}"
  if [[ $i -lt $((${#RESULTS[@]} - 1)) ]]; then
    echo ","
  fi
done
echo "]"

# Exit with appropriate code
if [[ $failed_count -gt 0 ]]; then
  exit 1
else
  exit 0
fi
