const { createElement, useState, useEffect, useMemo, useRef } = React;

import { findSplitX } from '../utils/helpers.js';
import { Keycap } from './Keycap.js';

export function Keyboard({
  design,
  layer = 0,
  externalMap = null,
  displayMode = 'Fluent',
  theme = 'System',
  appTheme = 'dark',
  macroAliases = {},
  forcedScale = null,
  userScale = 1,
  keyStyle = 'Windows',
  separation = 'DISABLE',
  encoderStyles = {},
  inputDeviceSettings = {},
  layoutOptions = {},
  onScaleMetricsChange = null,
  keyAnnotations = {},
  _showCallouts = false,
  onEditKey = null,
  onKeysChange = null,
  onKeyHover = null,
  onKeyHoverLeave = null,
}) {
  const [codes, setCodes] = useState({});
  const containerRef = useRef(null);
  const [autoFitScale, setAutoFitScale] = useState(1);

  const isLight =
    theme === 'Light' ||
    (theme === 'System' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches);
  const isAppDark =
    appTheme === 'dark' ||
    (appTheme === 'System' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const isSeparationEnabled = separation === 'ENABLE';
  const splitX = useMemo(() => {
    if (!isSeparationEnabled) return null;
    return findSplitX(design);
  }, [design, isSeparationEnabled]);

  const activeLayoutOptions = useMemo(() => {
    return layoutOptions || {};
  }, [layoutOptions]);

  const keys = useMemo(() => {
    if (!design || !design.layouts || !design.layouts.keymap) return [];
    const list = [];
    const UNIT = 56;
    let x = 0,
      y = 0,
      w = 1,
      h = 1;
    let isJISKey = false;
    design.layouts.keymap.forEach((row) => {
      x = 0;
      row.forEach((item) => {
        if (typeof item === 'string') {
          const parts = item.split('\n');
          const m = parts[0].match(/(\d+),(\d+)/);
          const encoderMatch = parts.find((p) => /^e\d+$/.test(p.trim()));
          const isEncoder = !!encoderMatch;
          const encoderIndex = isEncoder ? parseInt(encoderMatch.replace('e', ''), 10) : null;

          let optionIdx = null;
          let optionVal = null;
          for (let i = 1; i < parts.length; i++) {
            const p = parts[i].trim();
            if (/^\d+,\d+$/.test(p)) {
              const [optIdx, optVal] = p.split(',').map((num) => parseInt(num, 10));
              optionIdx = optIdx;
              optionVal = optVal;
              break;
            }
          }

          let isVisible = true;
          if (optionIdx !== null && optionIdx !== undefined) {
            // optionIdx は parseInt 済みの数値。Object.hasOwn で存在確認後にアクセスする
            const safeIdx = Number(optionIdx);
            const selectedVal = Object.hasOwn(activeLayoutOptions, safeIdx)
              ? activeLayoutOptions[safeIdx]
              : 0;
            if (selectedVal !== optionVal) {
              isVisible = false;
            }
          }

          if (isVisible) {
            list.push({
              id: item,
              matrix: m ? [parseInt(m[1]), parseInt(m[2])] : null,
              x: x * UNIT,
              y: y * UNIT,
              w: w * UNIT,
              h: h * UNIT,
              isJIS: isJISKey,
              isEncoder,
              encoderIndex,
              optionIdx,
              optionVal,
            });
          }
          x += w;
          w = 1;
          h = 1;
          isJISKey = false;
        } else {
          if (item.x !== undefined) x += item.x;
          if (item.y !== undefined) y += item.y;
          if (item.w !== undefined) w = item.w;
          if (item.h !== undefined) h = item.h;
          if (item.isJIS !== undefined) isJISKey = item.isJIS;
        }
      });
      y++;
    });

    if (isSeparationEnabled && splitX !== null) {
      const leftKeys = list.filter((k) => k.x + k.w / 2 < splitX);
      const rightKeys = list.filter((k) => k.x + k.w / 2 >= splitX);

      if (leftKeys.length > 0 && rightKeys.length > 0) {
        const leftMaxX = Math.max(...leftKeys.map((k) => k.x + k.w));
        const rightMinX = Math.min(...rightKeys.map((k) => k.x));

        const originalGap = rightMinX - leftMaxX;
        const targetGap = UNIT * 1.5;
        const shiftX = targetGap - originalGap;

        rightKeys.forEach((k) => {
          k.x += shiftX;
        });
      }
    }

    return list;
  }, [design, isSeparationEnabled, splitX, activeLayoutOptions]);

  const filteredKeys = keys;

  const maxWidth = useMemo(
    () => (filteredKeys.length ? Math.max(...filteredKeys.map((k) => k.x + k.w), 0) + 40 : 0),
    [filteredKeys]
  );
  const maxHeight = useMemo(
    () => (filteredKeys.length ? Math.max(...filteredKeys.map((k) => k.y + k.h), 0) + 40 : 0),
    [filteredKeys]
  );

  useEffect(() => {
    if (typeof onKeysChange === 'function') {
      onKeysChange(filteredKeys);
    }
  }, [filteredKeys, onKeysChange]);

  useEffect(() => {
    if (forcedScale !== null) {
      setAutoFitScale(1);
      return;
    }

    if (!containerRef.current || maxWidth === 0) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const containerWidth = entry.contentRect.width;
        const available = Math.max(0, containerWidth - 48);
        let nextScale = available / maxWidth;
        if (nextScale > 1) nextScale = 1;
        setAutoFitScale(Math.max(0.35, nextScale));
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [maxWidth, forcedScale]);

  useEffect(() => {
    // layer は数値インデックス。Number() で明示的に数値化してからアクセスする
    const layerIdx = Number(layer);
    const layerSource =
      (externalMap && externalMap.layers && externalMap.layers[layerIdx]) ||
      (design && design.layers && design.layers[layerIdx]);
    if (layerSource) {
      const next = {};
      const cols = (design && design.matrix && design.matrix.cols) || 16;
      // キーは Math.floor / % による純粋な計算値であり、ユーザー入力ではない
      layerSource.forEach((v, i) => (next[`${Math.floor(i / cols)},${i % cols}`] = v));
      setCodes(next);
    } else {
      setCodes({});
    }
  }, [design, layer, externalMap]);

  const normalizedUserScale =
    Number.isFinite(Number(userScale)) && Number(userScale) > 0 ? Number(userScale) : 1;
  const baseScale = forcedScale !== null ? forcedScale : autoFitScale;
  const finalScale = baseScale * normalizedUserScale;

  useEffect(() => {
    if (typeof onScaleMetricsChange === 'function') {
      onScaleMetricsChange({
        autoFitScale,
        finalScale,
        maxWidth,
        maxHeight,
        containerWidth: containerRef.current?.getBoundingClientRect().width ?? 0,
      });
    }
  }, [autoFitScale, finalScale, maxWidth, maxHeight, onScaleMetricsChange]);

  if (filteredKeys.length === 0) return null;

  const leftCaseStyle = useMemo(() => {
    if (!isSeparationEnabled || splitX === null) return null;
    const leftKeys = filteredKeys.filter((k) => k.x + k.w / 2 < splitX);
    if (leftKeys.length === 0) return null;

    const minX = Math.min(...leftKeys.map((k) => k.x));
    const maxX = Math.max(...leftKeys.map((k) => k.x + k.w));
    const minY = Math.min(...leftKeys.map((k) => k.y));
    const maxY = Math.max(...leftKeys.map((k) => k.y + k.h));

    const paddingOffset = 20;

    let border, boxShadow;

    if (isLight && isAppDark) {
      border = '2px solid rgba(226, 232, 240, 0.92)';
      boxShadow =
        '0 16px 36px -16px rgba(2, 8, 23, 0.38), inset 0 2px 4px rgba(255,255,255,0.95), inset 0 -8px 18px rgba(100,116,139,0.22)';
    } else if (isLight) {
      border = '2px solid rgba(203, 213, 225, 0.5)';
      boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.05)';
    } else if (isAppDark) {
      border = '2px solid rgba(100, 116, 139, 0.4)';
      boxShadow = 'inset 0 2px 20px rgba(0,0,0,0.4)';
    } else {
      border = '2px solid rgba(148, 163, 184, 0.8)';
      boxShadow =
        '0 10px 30px -10px rgba(15,23,42,0.18), inset 0 2px 4px rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.15)';
    }

    return {
      position: 'absolute',
      left: `${minX + paddingOffset - 20}px`,
      top: `${minY + paddingOffset - 20}px`,
      width: `${maxX - minX + 40}px`,
      height: `${maxY - minY + 40}px`,
      borderRadius: '2rem',
      overflow: 'hidden',
      zIndex: 0,
      border,
      boxShadow,
    };
  }, [filteredKeys, isSeparationEnabled, splitX, isLight, isAppDark]);

  const rightCaseStyle = useMemo(() => {
    if (!isSeparationEnabled || splitX === null) return null;
    const rightKeys = filteredKeys.filter((k) => k.x + k.w / 2 >= splitX);
    if (rightKeys.length === 0) return null;

    const minX = Math.min(...rightKeys.map((k) => k.x));
    const maxX = Math.max(...rightKeys.map((k) => k.x + k.w));
    const minY = Math.min(...rightKeys.map((k) => k.y));
    const maxY = Math.max(...rightKeys.map((k) => k.y + k.h));

    const paddingOffset = 20;

    let border, boxShadow;

    if (isLight) {
      border = '2px solid rgba(203, 213, 225, 0.5)';
      boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.05)';
    } else if (isAppDark) {
      border = '2px solid rgba(100, 116, 139, 0.4)';
      boxShadow = 'inset 0 2px 20px rgba(0,0,0,0.4)';
    } else {
      border = '2px solid rgba(148, 163, 184, 0.8)';
      boxShadow =
        '0 10px 30px -10px rgba(15,23,42,0.18), inset 0 2px 4px rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.15)';
    }

    return {
      position: 'absolute',
      left: `${minX + paddingOffset - 20}px`,
      top: `${minY + paddingOffset - 20}px`,
      width: `${maxX - minX + 40}px`,
      height: `${maxY - minY + 40}px`,
      borderRadius: '2rem',
      overflow: 'hidden',
      zIndex: 0,
      border,
      boxShadow,
    };
  }, [filteredKeys, isSeparationEnabled, splitX, isLight, isAppDark]);

  const getKbdContainerClass = () => {
    return 'kbd-container relative transition-all duration-200';
  };

  const getKbdContainerStyle = () => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      transform: 'none',
      borderRadius: '2rem',
      overflow: 'hidden',
      position: 'relative',
    };

    if (isSeparationEnabled && splitX !== null) {
      return {
        ...baseStyle,
        border: 'none',
        background: 'transparent',
        boxShadow: 'none',
      };
    }

    let border, boxShadow;

    if (isLight) {
      border = '2px solid rgba(203, 213, 225, 0.5)';
      boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.05)';
    } else if (isAppDark) {
      border = '2px solid rgba(100, 116, 139, 0.4)';
      boxShadow = 'inset 0 2px 20px rgba(0,0,0,0.4)';
    } else {
      border = '2px solid rgba(148, 163, 184, 0.8)';
      boxShadow =
        '0 10px 30px -10px rgba(15,23,42,0.18), inset 0 2px 4px rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.15)';
    }

    return {
      ...baseStyle,
      border,
      boxShadow,
    };
  };

  const getKbdBackgroundStyle = () => {
    if (isSeparationEnabled && splitX !== null) return null;

    let background;
    if (isLight && isAppDark) {
      background =
        'linear-gradient(145deg, rgba(248,250,252,0.98) 0%, rgba(224,231,239,0.96) 26%, rgba(191,201,215,0.98) 56%, rgba(232,238,245,0.97) 100%)';
    } else if (isLight) {
      background = 'rgba(226, 232, 240, 0.8)';
    } else if (isAppDark) {
      background =
        'linear-gradient(135deg, rgba(148, 163, 184, 0.4) 0%, rgba(71, 85, 105, 0.4) 100%)';
    } else {
      background = 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)';
    }

    return {
      position: 'absolute',
      top: '-3px',
      left: '-3px',
      width: 'calc(100% + 6px)',
      height: 'calc(100% + 6px)',
      background,
      zIndex: 0,
      pointerEvents: 'none',
    };
  };

  const getCaseBgFillStyle = () => {
    let background;
    if (isLight && isAppDark) {
      background =
        'linear-gradient(145deg, rgba(248,250,252,0.98) 0%, rgba(224,231,239,0.96) 26%, rgba(191,201,215,0.98) 56%, rgba(232,238,245,0.97) 100%)';
    } else if (isLight) {
      background = 'rgba(226, 232, 240, 0.8)';
    } else if (isAppDark) {
      background =
        'linear-gradient(135deg, rgba(148, 163, 184, 0.4) 0%, rgba(71, 85, 105, 0.4) 100%)';
    } else {
      background = 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)';
    }
    return {
      position: 'absolute',
      top: '-3px',
      left: '-3px',
      width: 'calc(100% + 6px)',
      height: 'calc(100% + 6px)',
      background,
      pointerEvents: 'none',
    };
  };

  return createElement(
    'div',
    {
      ref: containerRef,
      className:
        'keyboard-container relative overflow-hidden flex items-center justify-center py-1 px-6',
      style: { width: '100%', height: `${maxHeight * finalScale + 8}px` },
      onMouseLeave: onKeyHoverLeave,
    },
    createElement(
      'div',
      {
        className: 'keyboard-inner relative',
        style: {
          width: `${maxWidth}px`,
          height: `${maxHeight}px`,
          transform: finalScale === 1 ? 'none' : `scale(${finalScale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
        },
      },
      createElement(
        'div',
        {
          className: getKbdContainerClass(),
          style: getKbdContainerStyle(),
        },
        [
          getKbdBackgroundStyle() &&
            createElement('div', {
              key: 'kbd-bg-fill',
              style: getKbdBackgroundStyle(),
            }),
          isSeparationEnabled &&
            splitX !== null &&
            leftCaseStyle &&
            createElement(
              'div',
              {
                key: 'left-case',
                style: leftCaseStyle,
                className: 'transition-all duration-200',
              },
              createElement('div', { style: getCaseBgFillStyle() })
            ),
          isSeparationEnabled &&
            splitX !== null &&
            rightCaseStyle &&
            createElement(
              'div',
              {
                key: 'right-case',
                style: rightCaseStyle,
                className: 'transition-all duration-200',
              },
              createElement('div', { style: getCaseBgFillStyle() })
            ),
          ...filteredKeys.map((k, i) => {
            const mK = k.matrix ? `${k.matrix[0]},${k.matrix[1]}` : k.id;
            const val = k.matrix ? codes[mK] : null;

            return createElement(Keycap, {
              key: i,
              k,
              val,
              i,
              displayMode,
              keyStyle,
              macroAliases,
              encoderStyles,
              inputDeviceSettings,
              layer,
              design,
              externalMap,
              isLight,
              isAppDark,
              matrixKey: mK,
              annotation: keyAnnotations[mK] || null,
              onEditKey,
              onKeyHover,
              onKeyHoverLeave,
            });
          }),
        ]
      )
    )
  );
}
