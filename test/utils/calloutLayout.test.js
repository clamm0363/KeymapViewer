import { describe, it, expect } from 'vitest';
import {
  buildCalloutOverlayModel,
  CALLOUT_BOTTOM_PADDING,
  CALLOUT_LINE_LENGTH,
  CALLOUT_MAX_WIDTH,
  CALLOUT_ROW_GAP,
} from '../../js/utils/calloutLayout.js';

describe('calloutLayout', () => {
  const scaleMetrics = {
    finalScale: 1,
    maxWidth: 300,
    maxHeight: 120,
    containerWidth: 420,
  };

  it('returns null when required inputs are missing', () => {
    expect(buildCalloutOverlayModel({ keys: null, keyAnnotations: {}, scaleMetrics })).toBeNull();
    expect(buildCalloutOverlayModel({ keys: [], keyAnnotations: {}, scaleMetrics })).toBeNull();
    expect(
      buildCalloutOverlayModel({
        keys: [{ x: 0, y: 0, w: 40, h: 40, matrix: [0, 0] }],
        keyAnnotations: { '0,0': { customText: 'A' } },
        scaleMetrics: null,
      })
    ).toBeNull();
  });

  it('builds a side callout when enough horizontal room exists', () => {
    const wideScaleMetrics = {
      ...scaleMetrics,
      containerWidth: 900,
    };
    const model = buildCalloutOverlayModel({
      keys: [{ x: 40, y: 70, w: 40, h: 40, matrix: [0, 0] }],
      keyAnnotations: { '0,0': { customText: 'Sound', description: 'Opens control panel' } },
      scaleMetrics: wideScaleMetrics,
    });

    expect(model.callouts).toHaveLength(1);
    expect(model.bottomPadding).toBe(0);
    expect(model.callouts[0].placement).toBe('left');
    expect(model.callouts[0].lineEndX).toBe(model.callouts[0].lineStartX - CALLOUT_LINE_LENGTH);
  });

  it('falls back below when side placement would overflow', () => {
    const model = buildCalloutOverlayModel({
      keys: [{ x: 270, y: 10, w: 30, h: 40, matrix: [0, 1] }],
      keyAnnotations: { '0,1': { customText: 'Long title', description: 'Long note' } },
      scaleMetrics,
    });

    expect(model.callouts).toHaveLength(1);
    expect(model.callouts[0].placement).toBe('below');
    expect(model.bottomPadding).toBe(CALLOUT_BOTTOM_PADDING);
    expect(model.callouts[0].boxLeft + CALLOUT_MAX_WIDTH).toBeLessThanOrEqual(scaleMetrics.containerWidth - 4);
    expect(model.callouts[0].boxTop).toBeGreaterThan(scaleMetrics.maxHeight);
  });

  it('keeps side placement by sliding vertically when the box would overflow above the slot area', () => {
    const wideScaleMetrics = {
      ...scaleMetrics,
      containerWidth: 900,
    };
    const model = buildCalloutOverlayModel({
      keys: [{ x: 40, y: 0, w: 40, h: 40, matrix: [0, 0] }],
      keyAnnotations: {
        '0,0': {
          customText: 'Very long title that should wrap and become taller',
          description: 'This body also makes the box taller near the top edge.',
        },
      },
      scaleMetrics: wideScaleMetrics,
    });

    expect(model.callouts).toHaveLength(1);
    expect(model.callouts[0].placement).toBe('left');
    expect(model.callouts[0].boxTop).toBe(4);
  });

  it('lays out multiple fallback callouts into columns near their key positions', () => {
    const narrowMetrics = {
      ...scaleMetrics,
      containerWidth: 520,
    };
    const model = buildCalloutOverlayModel({
      keys: [
        { x: 0, y: 40, w: 40, h: 40, matrix: [0, 0] },
        { x: 120, y: 40, w: 40, h: 40, matrix: [0, 1] },
        { x: 240, y: 40, w: 40, h: 40, matrix: [0, 2] },
      ],
      keyAnnotations: {
        '0,0': { customText: 'A', description: 'One' },
        '0,1': { customText: 'B', description: 'Two' },
        '0,2': { customText: 'C', description: 'Three' },
      },
      scaleMetrics: narrowMetrics,
    });

    const fallback = model.callouts.filter((callout) => callout.placement === 'below');
    expect(fallback.length).toBeGreaterThanOrEqual(2);
    expect(fallback[1].boxLeft).toBeGreaterThanOrEqual(fallback[0].boxLeft);
  });

  it('stacks fallback callouts in the same column when several keys prefer the same x region', () => {
    const narrowMetrics = {
      ...scaleMetrics,
      containerWidth: 520,
    };
    const model = buildCalloutOverlayModel({
      keys: [
        { x: 0, y: 40, w: 40, h: 40, matrix: [0, 0] },
        { x: 10, y: 50, w: 40, h: 40, matrix: [0, 1] },
      ],
      keyAnnotations: {
        '0,0': { customText: 'A', description: 'One' },
        '0,1': { customText: 'B', description: 'Two' },
      },
      scaleMetrics: narrowMetrics,
    });

    const fallback = model.callouts.filter((callout) => callout.placement === 'below');
    expect(fallback).toHaveLength(2);
    expect(fallback[0].boxLeft).toBe(fallback[1].boxLeft);
    expect(fallback[1].boxTop).toBeGreaterThan(fallback[0].boxTop);
    expect(fallback[1].boxTop).toBeGreaterThanOrEqual(
      fallback[0].boxTop + fallback[0].estimatedHeight + CALLOUT_ROW_GAP
    );
  });

  it('ignores annotations that do not contain visible text', () => {
    const model = buildCalloutOverlayModel({
      keys: [
        { x: 40, y: 10, w: 40, h: 40, matrix: [0, 0] },
        { x: 90, y: 10, w: 40, h: 40, matrix: [0, 1] },
      ],
      keyAnnotations: {
        '0,0': { customText: '  ', description: '' },
        '0,1': { customText: 'Valid', description: '' },
      },
      scaleMetrics,
    });

    expect(model.callouts).toHaveLength(1);
    expect(model.callouts[0].keyId).toBe('0,1');
  });
});
