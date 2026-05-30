import { describe, it, expect } from 'vitest';
import {
  toCanonicalKeycodeDisplay,
  getKeycodeDescription,
  getKeycodeTooltipInfo,
} from '../../js/utils/tooltipEngine.js';

describe('tooltipEngine canonical mappings', () => {
  it('should map standard keys to their official preferred displays', () => {
    expect(toCanonicalKeycodeDisplay('KC_ENT')).toBe('KC_ENTER');
    expect(toCanonicalKeycodeDisplay('KC_SPC')).toBe('KC_SPACE');
    expect(toCanonicalKeycodeDisplay('KC_ESC')).toBe('KC_ESCAPE');
  });

  it('should format wrapped modifier tokens correctly', () => {
    expect(toCanonicalKeycodeDisplay('C(S(KC_A))')).toBe('LCTL(LSFT(KC_A))');
    expect(toCanonicalKeycodeDisplay('LCA(KC_B)')).toBe('LCTL(LALT(KC_B))');
  });

  it('should pass unmapped values untouched', () => {
    expect(toCanonicalKeycodeDisplay('KC_A')).toBe('KC_A');
  });
});

describe('tooltipEngine description generation', () => {
  it('should generate description for alphabetical keycodes', () => {
    expect(getKeycodeDescription('KC_A', 'Windows')).toBe('a and A');
  });

  it('should format momentary layer keys properly', () => {
    expect(getKeycodeDescription('MO(2)', 'Windows')).toBe('Momentarily activates layer 2');
  });

  it('should format toggle layer keys properly', () => {
    expect(getKeycodeDescription('TG(3)', 'Windows')).toBe('Toggles layer 3 on and off');
  });

  it('should format layer tap keys properly', () => {
    expect(getKeycodeDescription('LT(1, KC_SPC)', 'Windows')).toBe(
      'Momentarily activates layer 1 when held, sends Spacebar when tapped'
    );
  });

  it('should format mod tap keys properly', () => {
    expect(getKeycodeDescription('LCTL_T(KC_SPC)', 'Windows')).toBe(
      'Left Control when held, Spacebar when tapped'
    );
    expect(getKeycodeDescription('LALT_T(KC_ENT)', 'Mac')).toBe(
      'Left Option when held, Return (Enter) when tapped'
    );
  });

  it('should handle multi-modifier mod tap MT keys', () => {
    expect(getKeycodeDescription('MT(MOD_LCTL|MOD_LSFT, KC_SPC)', 'Windows')).toBe(
      'Mod-Tap: holds Left Control + Left Shift when held, sends Spacebar when tapped'
    );
  });

  it('should format VIA specific custom Fn keys', () => {
    expect(getKeycodeDescription('FN_MO13', 'Windows')).toBe(
      'VIA custom Fn key: activates layer 1 while held and updates tri-layer state for layers 1, 2, and 3'
    );
  });
});

describe('tooltipEngine getKeycodeTooltipInfo metadata', () => {
  it('should return complete structured tooltip information', () => {
    const info = getKeycodeTooltipInfo('KC_ENT', 'KC_ENT', 'Windows');
    expect(info.officialCode).toBe('KC_ENTER');
    expect(info.description).toBe('Return (Enter)');
    expect(info.section).toBe('Basic Keycodes');
    expect(info.aliases).toContain('KC_ENT');
    expect(info.inputCode).toBe('KC_ENT');
    expect(info.isAliasInput).toBe(true);
  });
});
