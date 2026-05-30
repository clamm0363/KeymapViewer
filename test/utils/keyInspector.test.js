import { describe, it, expect } from 'vitest';
import { buildKeyInspectorData, buildKeyInspectorTooltipLines } from '../../js/utils/keyInspector.js';

describe('buildKeyInspectorData', () => {
  it('should parse standard key correctly and build standard inspector data', () => {
    const data = buildKeyInspectorData({
      code: 'KC_A',
      keyStyle: 'Windows',
      displayRaw: 'KC_A',
      targetIconKey: '',
      parsed: {
        displayText: 'A',
        fullRaw: 'KC_A',
      },
      iconRenderState: {
        actuallyShowingSvg: false,
      },
      displayModel: {
        route: 'standard',
        centerText: 'A',
      },
      macros: [],
    });

    expect(data.inputCode).toBe('KC_A');
    expect(data.officialCode).toBe('KC_A');
    expect(data.label).toBe('A');
    expect(data.category).toBe(''); // Alphabetical keys do not have a special category like sound/mouse
    expect(data.icon).toBe('');
    expect(data.render).toBe('standard');
    expect(data.bottom).toBe('');
    expect(data.macro).toBe('');
  });

  it('should detect category for mouse keys', () => {
    const data = buildKeyInspectorData({
      code: 'KC_MS_U',
      keyStyle: 'Windows',
      displayRaw: 'KC_MS_U',
      targetIconKey: '',
      parsed: {
        displayText: 'MS UP',
        fullRaw: 'KC_MS_U',
      },
      iconRenderState: {
        actuallyShowingSvg: false,
      },
      displayModel: {
        route: 'standard',
        centerText: 'MS UP',
      },
      macros: [],
    });

    expect(data.category).toBe('MOUSE');
  });

  it('should handle layer route and correctly format topTag, primaryText, and secondaryText', () => {
    const data = buildKeyInspectorData({
      code: 'LT(1, KC_SPC)',
      keyStyle: 'Windows',
      displayRaw: 'LT(1, KC_SPC)',
      targetIconKey: '',
      parsed: {
        displayText: 'SPC',
        fullRaw: 'LT(1, KC_SPC)',
      },
      iconRenderState: {
        actuallyShowingSvg: false,
      },
      displayModel: {
        route: 'layer',
        topTag: 'LT',
        primaryText: '1',
        secondaryText: 'SPC',
      },
      macros: [],
    });

    expect(data.label).toBe('LT | 1 | SPC');
    expect(data.render).toBe('layer');
  });

  it('should handle mod route and correctly format labels', () => {
    const data = buildKeyInspectorData({
      code: 'MT(MOD_LCTL, KC_ENT)',
      keyStyle: 'Windows',
      displayRaw: 'MT(MOD_LCTL, KC_ENT)',
      targetIconKey: '',
      parsed: {
        displayText: 'ENTER',
        fullRaw: 'MT(MOD_LCTL, KC_ENT)',
        modLabel: 'CTRL',
        baseLabel: 'ENTER',
      },
      iconRenderState: {
        actuallyShowingSvg: false,
      },
      displayModel: {
        route: 'mod',
        centerText: 'ENTER',
      },
      macros: [],
    });

    expect(data.label).toBe('CTRL | ENTER');
    expect(data.render).toBe('mod');
  });

  it('should handle macro route and correctly extract content', () => {
    const data = buildKeyInspectorData({
      code: 'MACRO(2)',
      keyStyle: 'Windows',
      displayRaw: 'MACRO(2)',
      targetIconKey: '',
      parsed: {
        displayText: 'MACRO',
        fullRaw: 'MACRO(2)',
      },
      iconRenderState: {
        actuallyShowingSvg: false,
      },
      displayModel: {
        route: 'standard',
        centerText: 'M2',
      },
      macros: ['Hello', 'World', 'Antigravity'],
    });

    expect(data.macro).toBe('M2 = Antigravity');
  });

  it('should filter private use glyphs and fall back appropriately', () => {
    // E000 is a Private Use Area character
    const data = buildKeyInspectorData({
      code: 'KC_A',
      keyStyle: 'Windows',
      displayRaw: 'KC_A',
      targetIconKey: '',
      parsed: {
        displayText: '\uE001',
        fullRaw: 'KC_A',
        textFallback: 'Fallback Text',
      },
      iconRenderState: {
        actuallyShowingSvg: false,
      },
      displayModel: {
        route: 'standard',
        centerText: '\uE001',
      },
      macros: [],
    });

    expect(data.label).toBe('Fallback Text');
  });
});

describe('buildKeyInspectorTooltipLines', () => {
  it('should build proper debug text lines from inspector data', () => {
    const data = {
      inputCode: 'KC_A',
      officialCode: 'KC_A',
      label: 'A',
      category: 'keyboard',
      icon: 'iconSvg | svg',
      render: 'standard | default',
      bottom: 'Summary',
      macro: 'M0 = text',
    };

    const lines = buildKeyInspectorTooltipLines(data);
    expect(lines).toContain('---- DEBUG ----');
    expect(lines).toContain('Input: KC_A');
    expect(lines).toContain('Official: KC_A');
    expect(lines).toContain('Label: A');
    expect(lines).toContain('Category: keyboard');
    expect(lines).toContain('Icon: iconSvg | svg');
    expect(lines).toContain('Render: standard | default');
    expect(lines).toContain('Bottom: Summary');
    expect(lines).toContain('Macro: M0 = text');
  });

  it('should return empty array or handle null data gracefully', () => {
    expect(buildKeyInspectorTooltipLines(null)).toEqual([]);
  });
});
