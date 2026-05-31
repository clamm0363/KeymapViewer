import { describe, it, expect } from 'vitest';
import {
  getAnnotation,
  setAnnotation,
  clearAnnotation,
  hasAnnotation,
  getAnnotatedKeys,
} from '../../js/utils/keyAnnotations.js';

describe('keyAnnotations', () => {
  describe('getAnnotation', () => {
    it('should return null if keyAnnotations is null or empty', () => {
      expect(getAnnotation(null, '0,3')).toBeNull();
      expect(getAnnotation({}, '0,3')).toBeNull();
    });

    it('should return null if matrixKey is null or empty', () => {
      const annotations = { '0,3': { customText: 'Hello' } };
      expect(getAnnotation(annotations, null)).toBeNull();
      expect(getAnnotation(annotations, '')).toBeNull();
    });

    it('should return normalized annotation object if found', () => {
      const annotations = {
        '0,3': {
          customText: 'Figma: Design',
          description: 'Figma shortcut',
        },
      };
      const result = getAnnotation(annotations, '0,3');
      expect(result).toEqual({
        customText: 'Figma: Design',
        description: 'Figma shortcut',
        iconKey: '',
      });
    });
  });

  describe('setAnnotation', () => {
    it('should add a new annotation immutably', () => {
      const initial = {};
      const updated = setAnnotation(initial, '0,3', {
        customText: 'Figma: Design',
        description: 'Figma shortcut',
        iconKey: 'heart',
      });

      expect(initial).toEqual({});
      expect(updated).toEqual({
        '0,3': {
          customText: 'Figma: Design',
          description: 'Figma shortcut',
          iconKey: 'heart',
        },
      });
    });

    it('should update an existing annotation immutably', () => {
      const initial = {
        '0,3': {
          customText: 'Old Text',
          description: 'Old Desc',
          iconKey: '',
        },
      };
      const updated = setAnnotation(initial, '0,3', {
        customText: 'New Text',
        description: 'New Desc',
      });

      expect(initial['0,3'].customText).toBe('Old Text');
      expect(updated['0,3']).toEqual({
        customText: 'New Text',
        description: 'New Desc',
        iconKey: '',
      });
    });
  });

  describe('clearAnnotation', () => {
    it('should remove annotation immutably', () => {
      const initial = {
        '0,3': { customText: 'Text' },
        '1,2': { customText: 'Other' },
      };
      const updated = clearAnnotation(initial, '0,3');

      expect(initial).toHaveProperty('0,3');
      expect(updated).not.toHaveProperty('0,3');
      expect(updated).toHaveProperty('1,2');
    });

    it('should handle non-existent keys safely', () => {
      const initial = { '1,2': { customText: 'Other' } };
      const updated = clearAnnotation(initial, '0,3');
      expect(updated).toEqual(initial);
    });
  });

  describe('hasAnnotation', () => {
    it('should return false if no valid text or description', () => {
      expect(hasAnnotation(null, '0,3')).toBe(false);
      expect(hasAnnotation({}, '0,3')).toBe(false);
      expect(hasAnnotation({ '0,3': { iconKey: 'heart' } }, '0,3')).toBe(false);
      expect(hasAnnotation({ '0,3': { customText: '', description: '' } }, '0,3')).toBe(false);
    });

    it('should return true if customText or description is present', () => {
      expect(hasAnnotation({ '0,3': { customText: 'Hi' } }, '0,3')).toBe(true);
      expect(hasAnnotation({ '0,3': { description: 'Desc' } }, '0,3')).toBe(true);
    });
  });

  describe('getAnnotatedKeys', () => {
    it('should return list of keys with valid annotations', () => {
      const annotations = {
        '0,3': { customText: 'Valid' },
        '1,2': { description: 'Also Valid' },
        '2,2': { customText: '', description: '' },
      };
      expect(getAnnotatedKeys(annotations)).toEqual(['0,3', '1,2']);
    });
  });
});
