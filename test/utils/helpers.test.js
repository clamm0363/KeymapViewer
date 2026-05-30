import { describe, it, expect } from 'vitest';
import { findSplitX, getRawLabel } from '../../js/utils/helpers.js';

describe('getRawLabel helper', () => {
  it('should format hexadecimal keycodes into labels', () => {
    // 0x0028 -> KC_ENT
    expect(getRawLabel(0x0028)).toBe('KC_ENT');
  });

  it('should pass string values untouched', () => {
    expect(getRawLabel('KC_A')).toBe('KC_A');
  });
});

describe('findSplitX helper', () => {
  it('should return null if design is invalid', () => {
    expect(findSplitX(null)).toBeNull();
  });

  it('should calculate correct split line', () => {
    const design = {
      layouts: {
        keymap: [['0,0', '0,1', '0,2', '0,3', { x: 1.5 }, '0,4']],
      },
    };
    const splitX = findSplitX(design);
    expect(splitX).not.toBeNull();
  });
});
