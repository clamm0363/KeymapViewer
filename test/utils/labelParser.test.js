import { describe, it, expect } from 'vitest';
import { parseKeyLabel } from '../../js/utils/labelParser.js';

describe('parseKeyLabel', () => {
  it('should return correct structure for null or empty values', () => {
    const result = parseKeyLabel(null);
    expect(result.fullRaw).toBe('');
    expect(result.displayText).toBe('');
  });

  it('should parse standard key codes correctly', () => {
    const result = parseKeyLabel('KC_A', null, 'Text', 'Windows', {});
    expect(result.displayText).toBe('A');
    expect(result.isFluentIcon).toBe(false);
  });

  it('should handle Shift modification mapping for US layout', () => {
    const result = parseKeyLabel('S(KC_1)', null, 'Text', 'Windows', {}, false);
    expect(result.displayText).toBe('!');
  });

  it('should handle Shift modification mapping for JIS layout', () => {
    const result = parseKeyLabel('S(KC_2)', null, 'Text', 'Windows', {}, true);
    expect(result.displayText).toBe('"');
  });

  it('should parse LT (Layer Tap) key codes', () => {
    const result = parseKeyLabel('LT(1, KC_A)', null, 'Text', 'Windows', {});
    expect(result.isLayerKey).toBe(true);
    expect(result.layerType).toBe('LT');
    expect(result.layerNum).toBe('1');
    expect(result.tapLabel).toBe('A');
  });

  it('should parse MO (Momentary Layer) key codes', () => {
    const result = parseKeyLabel('MO(2)', null, 'Text', 'Windows', {});
    expect(result.isLayerKey).toBe(true);
    expect(result.layerType).toBe('MO');
    expect(result.layerNum).toBe('2');
  });

  it('should parse MT (Mod Tap) key codes', () => {
    const result = parseKeyLabel('MT(MOD_LCTL, KC_ENT)', null, 'Text', 'Windows', {});
    expect(result.isModKey).toBe(true);
    expect(result.modType).toBe('tap');
    expect(result.modKeys).toContain('CTRL');
    expect(result.baseLabel).toBe('ENTER');
  });
});
