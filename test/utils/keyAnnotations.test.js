import { describe, it, expect } from 'vitest';
import {
  getAnnotation,
  getAnnotatedKeys,
  getLayerAnnotations,
  normalizeKeyAnnotations,
  setAnnotation,
  clearAnnotation,
  hasAnnotation,
} from '../../js/utils/keyAnnotations.js';

describe('keyAnnotations', () => {
  describe('normalizeKeyAnnotations', () => {
    it('should normalize legacy annotations into layer 0', () => {
      const legacy = {
        '0,3': {
          customText: 'Figma: Design',
          description: 'Figma shortcut',
        },
      };

      expect(normalizeKeyAnnotations(legacy)).toEqual({
        '0': {
          '0,3': {
            customText: 'Figma: Design',
            description: 'Figma shortcut',
            iconKey: '',
          },
        },
      });
    });

    it('should preserve layered annotations', () => {
      const layered = {
        '1': {
          '0,3': { customText: 'Layer 1' },
        },
      };

      expect(normalizeKeyAnnotations(layered)).toEqual({
        '1': {
          '0,3': {
            customText: 'Layer 1',
            description: '',
            iconKey: '',
          },
        },
      });
    });
  });

  describe('getLayerAnnotations', () => {
    it('should return only current layer annotations', () => {
      const annotations = {
        '0': { '0,0': { customText: 'Base' } },
        '2': { '0,0': { customText: 'Layer2' }, '1,1': { description: 'Alt' } },
      };

      expect(getLayerAnnotations(annotations, 2)).toEqual({
        '0,0': {
          customText: 'Layer2',
          description: '',
          iconKey: '',
        },
        '1,1': {
          customText: '',
          description: 'Alt',
          iconKey: '',
        },
      });
      expect(getLayerAnnotations(annotations, 1)).toEqual({});
    });
  });

  describe('getAnnotation', () => {
    it('should return null if keyAnnotations is null or empty', () => {
      expect(getAnnotation(null, '0,3', 0)).toBeNull();
      expect(getAnnotation({}, '0,3', 0)).toBeNull();
    });

    it('should return null if matrixKey is null or empty', () => {
      const annotations = { '0': { '0,3': { customText: 'Hello' } } };
      expect(getAnnotation(annotations, null, 0)).toBeNull();
      expect(getAnnotation(annotations, '', 0)).toBeNull();
    });

    it('should return normalized annotation object for the requested layer only', () => {
      const annotations = {
        '0': { '0,3': { customText: 'Layer 0' } },
        '2': {
          '0,3': {
            customText: 'Layer 2',
            description: 'Only on layer 2',
          },
        },
      };

      expect(getAnnotation(annotations, '0,3', 2)).toEqual({
        customText: 'Layer 2',
        description: 'Only on layer 2',
        iconKey: '',
      });
      expect(getAnnotation(annotations, '0,3', 1)).toBeNull();
    });

    it('should keep reading legacy annotations as layer 0 only', () => {
      const legacy = { '0,3': { customText: 'Legacy Note' } };
      expect(getAnnotation(legacy, '0,3', 0)).toEqual({
        customText: 'Legacy Note',
        description: '',
        iconKey: '',
      });
      expect(getAnnotation(legacy, '0,3', 2)).toBeNull();
    });
  });

  describe('setAnnotation', () => {
    it('should add a new annotation immutably to the target layer', () => {
      const initial = {};
      const updated = setAnnotation(
        initial,
        '0,3',
        {
          customText: 'Figma: Design',
          description: 'Figma shortcut',
          iconKey: 'heart',
        },
        2
      );

      expect(initial).toEqual({});
      expect(updated).toEqual({
        '2': {
          '0,3': {
            customText: 'Figma: Design',
            description: 'Figma shortcut',
            iconKey: 'heart',
          },
        },
      });
    });

    it('should migrate legacy annotations and append to a new layer', () => {
      const initial = {
        '0,3': {
          customText: 'Legacy',
        },
      };
      const updated = setAnnotation(initial, '1,1', { customText: 'Layer 1 note' }, 1);

      expect(updated).toEqual({
        '0': {
          '0,3': {
            customText: 'Legacy',
            description: '',
            iconKey: '',
          },
        },
        '1': {
          '1,1': {
            customText: 'Layer 1 note',
            description: '',
            iconKey: '',
          },
        },
      });
    });
  });

  describe('clearAnnotation', () => {
    it('should remove annotation from the requested layer only', () => {
      const initial = {
        '0': { '0,3': { customText: 'Base' } },
        '1': {
          '0,3': { customText: 'Layer1' },
          '1,2': { customText: 'Other' },
        },
      };
      const updated = clearAnnotation(initial, '0,3', 1);

      expect(updated).toEqual({
        '0': { '0,3': { customText: 'Base', description: '', iconKey: '' } },
        '1': { '1,2': { customText: 'Other', description: '', iconKey: '' } },
      });
    });

    it('should remove an empty layer bucket after clearing the last annotation', () => {
      const initial = {
        '3': { '0,3': { customText: 'Only one' } },
      };

      expect(clearAnnotation(initial, '0,3', 3)).toEqual({});
    });
  });

  describe('hasAnnotation', () => {
    it('should return false if no valid text or description exists on the requested layer', () => {
      expect(hasAnnotation(null, '0,3', 0)).toBe(false);
      expect(hasAnnotation({}, '0,3', 0)).toBe(false);
      expect(hasAnnotation({ '0': { '0,3': { iconKey: 'heart' } } }, '0,3', 0)).toBe(false);
      expect(
        hasAnnotation({ '0': { '0,3': { customText: '', description: '' } } }, '0,3', 0)
      ).toBe(false);
    });

    it('should return true if customText or description is present on the current layer', () => {
      expect(hasAnnotation({ '2': { '0,3': { customText: 'Hi' } } }, '0,3', 2)).toBe(true);
      expect(hasAnnotation({ '2': { '0,3': { description: 'Desc' } } }, '0,3', 2)).toBe(true);
      expect(hasAnnotation({ '0': { '0,3': { customText: 'Base' } } }, '0,3', 2)).toBe(false);
    });
  });

  describe('getAnnotatedKeys', () => {
    it('should return only keys with valid annotations on the requested layer', () => {
      const annotations = {
        '0': {
          '0,3': { customText: 'Valid' },
          '2,2': { customText: '', description: '' },
        },
        '2': {
          '1,2': { description: 'Also Valid' },
        },
      };

      expect(getAnnotatedKeys(annotations, 0)).toEqual(['0,3']);
      expect(getAnnotatedKeys(annotations, 2)).toEqual(['1,2']);
    });
  });
});
