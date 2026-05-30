import { describe, it, expect } from 'vitest';
import {
  isLayoutJson,
  isMappingJson,
  getLayoutJsonErrorMessage,
  getMappingJsonErrorMessage,
  normalizeLayoutJson,
  normalizeMappingJson,
} from '../../js/utils/loadJsonUtils.js';

describe('loadJsonUtils validation helpers', () => {
  describe('isLayoutJson', () => {
    it('should return true for valid layout JSON objects', () => {
      const valid = {
        layouts: {
          keymap: [['KC_A']],
        },
        matrix: {
          rows: 1,
          cols: 1,
        },
      };
      expect(isLayoutJson(valid)).toBe(true);
    });

    it('should return false for invalid layouts', () => {
      expect(isLayoutJson(null)).toBe(false);
      expect(isLayoutJson({})).toBe(false);
      expect(isLayoutJson({ layouts: {} })).toBe(false);
      expect(isLayoutJson({ matrix: { rows: 1, cols: 1 } })).toBe(false);
    });
  });

  describe('isMappingJson', () => {
    it('should return true for valid mapping JSON objects', () => {
      const valid = {
        layers: [[['KC_A']]],
      };
      expect(isMappingJson(valid)).toBe(true);
    });

    it('should return false for invalid mapping JSON', () => {
      expect(isMappingJson(null)).toBe(false);
      expect(isMappingJson({})).toBe(false);
      expect(isMappingJson({ layers: 'not an array' })).toBe(false);
    });
  });

  describe('Error messages', () => {
    it('should return mapping-specific error when layout is mapping', () => {
      const mapping = { layers: [] };
      const errorMsg = getLayoutJsonErrorMessage(mapping);
      expect(errorMsg).toContain('選択したファイルは MAPPING 用 JSON のようです');
    });

    it('should return standard layout error message', () => {
      const errorMsg = getLayoutJsonErrorMessage(null);
      expect(errorMsg).toContain('LAYOUT 情報が見つかりません');
    });

    it('should return mapping error message', () => {
      const errorMsg = getMappingJsonErrorMessage();
      expect(errorMsg).toContain('MAPPING 情報が見つかりません');
    });
  });
});

describe('loadJsonUtils normalizer helpers', () => {
  describe('normalizeLayoutJson', () => {
    it('should normalize valid layout JSON successfully', () => {
      const valid = {
        name: 'My Layout',
        layouts: {
          keymap: [['KC_A']],
        },
        matrix: {
          rows: '2',
          cols: '3',
        },
        encoders: ['encoder1'],
      };

      const result = normalizeLayoutJson(valid);
      expect(result.name).toBe('My Layout');
      expect(result.matrix.rows).toBe(2);
      expect(result.matrix.cols).toBe(3);
      expect(result.encoders).toEqual(['encoder1']);
    });

    it('should fall back to empty encoders if absent', () => {
      const valid = {
        layouts: {
          keymap: [['KC_A']],
        },
        matrix: {
          rows: 1,
          cols: 1,
        },
      };

      const result = normalizeLayoutJson(valid);
      expect(result.encoders).toEqual([]);
    });

    it('should throw an error for invalid layout JSON', () => {
      expect(() => normalizeLayoutJson({})).toThrow('LAYOUT 情報が見つかりません');
    });
  });

  describe('normalizeMappingJson', () => {
    it('should normalize valid mapping JSON successfully', () => {
      const valid = {
        layers: [[['KC_A']]],
        macros: ['macro0'],
        macroAliases: { M0: 'MyMacro' },
        encoders: ['encoder1'],
      };

      const result = normalizeMappingJson(valid);
      expect(result.layers).toEqual([[['KC_A']]]);
      expect(result.macros).toEqual(['macro0']);
      expect(result.macroAliases).toEqual({ M0: 'MyMacro' });
      expect(result.encoders).toEqual(['encoder1']);
    });

    it('should fall back to empty defaults if macros, macroAliases, encoders are absent', () => {
      const valid = {
        layers: [[['KC_A']]],
      };

      const result = normalizeMappingJson(valid);
      expect(result.macros).toEqual([]);
      expect(result.macroAliases).toEqual({});
      expect(result.encoders).toEqual([]);
    });

    it('should throw an error for invalid mapping JSON', () => {
      expect(() => normalizeMappingJson({})).toThrow('MAPPING 情報が見つかりません');
    });
  });
});
