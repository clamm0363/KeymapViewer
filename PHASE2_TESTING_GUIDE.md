# Phase 2: System/Media Icons - Testing Guide

## 🎯 What's New in Phase 2

8 System/Media SVG icons have been added to `js/svg-icons.js`:

| Icon | Keycode | SVG | Fallback |
|------|---------|-----|----------|
| 🔋 Power | `KC_KB_POWER` | ✓ | U+F60F |
| 😴 Sleep | `KC_SYSTEM_SLEEP` | ✓ | U+F1DA |
| 👁️ Wake | `KC_SYSTEM_WAKE` | ✓ | U+E5F3 |
| 🔇 Mute | `KC_AUDIO_MUTE` | ✓ | U+EB4B |
| 🔊 Vol Up | `KC_AUDIO_VOL_UP` | ✓ | U+EB43 |
| 🔉 Vol Down | `KC_AUDIO_VOL_DOWN` | ✓ | U+F6FB |
| ☀️ Bright Up | `KC_KB_BRIGHTNESS_UP` | ✓ | U+F47F |
| 🌙 Bright Down | `KC_KB_BRIGHTNESS_DOWN` | ✓ | U+F480 |

---

## 🧪 How to Test

### Step 1: Load NumPad Layout with Layer 2

1. Open http://127.0.0.1:5500/
2. Select Layout: **SAMPLE NUMPAD**
3. Select Layer: **Layer 2** (new)
4. You should see 8 Phase 2 icons in the top 2 rows

### Step 2: Verify Each Icon

**Expected Display:**
- Row 1: Power, Mute, Vol↑, Vol↓
- Row 2: Bright↑, Bright↓, Sleep, Wake

**Visual Check:**
- ✓ Icons display with correct shapes
- ✓ No overlapping or distortion
- ✓ Consistent size (24x24)
- ✓ Colors match theme (white on dark, dark on light)

### Step 3: Fallback Check

Open DevTools Console (F12) and run:

```javascript
import('./js/svg-icons.js').then(m => {
  const icons = ['KC_KB_POWER', 'KC_AUDIO_MUTE', 'KC_AUDIO_VOL_UP', 
                 'KC_AUDIO_VOL_DOWN', 'KC_KB_BRIGHTNESS_UP', 
                 'KC_KB_BRIGHTNESS_DOWN', 'KC_SYSTEM_SLEEP', 'KC_SYSTEM_WAKE'];
  
  console.log('=== Phase 2 Icons Status ===');
  icons.forEach(key => {
    const avail = m.isSVGAvailable(key);
    const fallback = m.getSVGFallback(key);
    console.log(`${key}: SVG=${avail}, Fallback=${fallback ? '✓' : '✗'}`);
  });
});
```

**Expected Output:**
```
KC_KB_POWER: SVG=true, Fallback=✓
KC_AUDIO_MUTE: SVG=true, Fallback=✓
KC_AUDIO_VOL_UP: SVG=true, Fallback=✓
KC_AUDIO_VOL_DOWN: SVG=true, Fallback=✓
KC_KB_BRIGHTNESS_UP: SVG=true, Fallback=✓
KC_KB_BRIGHTNESS_DOWN: SVG=true, Fallback=✓
KC_SYSTEM_SLEEP: SVG=true, Fallback=✓
KC_SYSTEM_WAKE: SVG=true, Fallback=✓
```

### Step 4: SVG Rendering Test

Inspect any Phase 2 icon in DevTools:

1. Right-click key → **Inspect**
2. Look for `<svg>` element:
   - **SVG rendering**: `<svg>...</svg>` tag visible
   - **WebFont fallback**: `<span class="legend-text">...</span>` tag visible

### Step 5: Light/Dark Theme Toggle

Switch between Light and Dark themes:
- Icons should display correctly in both
- Colors should adapt (white on dark, dark on light)
- No artifacts or rendering issues

---

## ✅ Success Criteria

| Criterion | Status |
|-----------|--------|
| All 8 icons visible in Layer 2 | ✓ or ✗ |
| Icons display correct shapes | ✓ or ✗ |
| SVG rendering works | ✓ or ✗ |
| WebFont fallback defined | ✓ or ✗ |
| No console errors | ✓ or ✗ |
| Light/Dark theme works | ✓ or ✗ |
| Performance is smooth | ✓ or ✗ |

---

## 🐛 Troubleshooting

### Problem: Icons not visible
**Solution:**
- Hard refresh: Ctrl+Shift+R
- Verify Python server running on port 5500
- Check browser console for errors

### Problem: SVG shows distorted
**Solution:**
- This indicates SVG rendering failure
- Fallback should display WebFont instead
- Check `js/svg-icons.js` for SVG syntax errors

### Problem: Some icons show as text
**Solution:**
- This is **expected** for fallback mode
- Verify fallback code point in console:
  ```javascript
  import('./js/svg-icons.js').then(m => {
    console.log(m.getSVGFallback('KC_AUDIO_MUTE'));
  });
  ```

### Problem: Theme colors wrong
**Solution:**
- Check CSS theme variables in index.html
- Verify `isLight` parameter passes correctly to Keyboard.js
- Check currentColor CSS property in SVG elements

---

## 🔍 Manual SVG Quality Check

Each SVG should have:

1. **viewBox="0 0 24 24"** - Consistent size
2. **fill="currentColor"** or **stroke="currentColor"** - Theme support
3. **Simple shapes** - Recognizable icon
4. **No hardcoded colors** - Should adapt to theme

Example (Power icon):
```xml
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <!-- Circle with currentColor -->
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <!-- Top line indicator -->
  <path d="M 12 2 L 12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

✓ Uses currentColor - Theme compatible
✓ Simple recognizable shape - Power symbol

---

## 📝 Next Steps

### If All Tests Pass ✓
1. Phase 2 is validated
2. Proceed to Phase 3: Edit/UI Icons
3. Update PHASE2_VALIDATION_REPORT.md

### If Issues Found ✗
1. Identify which icons have problems
2. Check SVG syntax in `js/svg-icons.js`
3. Verify fallback code points match `keymap-dictionary.js`
4. Test in isolation with `phase1-validation.html` approach

---

## 📊 Phase 2 Summary

- **Icons Added**: 8
- **Category**: System/Media (Low Risk)
- **Risk Level**: 🟢 Low
- **Complexity**: Simple geometric shapes
- **Fallback**: All defined and tested
- **Status**: Ready for validation

---

**Ready to test?** → http://127.0.0.1:5500/
