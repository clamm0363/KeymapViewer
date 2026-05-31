const { createElement } = React;

export function KeyCalloutOverlay({
  keys,           // filteredKeys
  keyAnnotations,
  scaleMetrics,   // { finalScale, maxWidth, maxHeight, containerWidth }
  isLight,
  _isAppDark,
}) {
  if (!scaleMetrics || !keys || keys.length === 0) return null;

  const finalScale = scaleMetrics.finalScale;
  const maxWidth = scaleMetrics.maxWidth;
  const containerWidth = scaleMetrics.containerWidth;

  const renderedKeyboardWidth = maxWidth * finalScale;
  const innerOffsetX = Math.max(0, (containerWidth - renderedKeyboardWidth) / 2);
  const innerOffsetY = 4;

  const svgWidth = containerWidth;
  const svgHeight = scaleMetrics.maxHeight * finalScale + 8;

  // Style constants based on theme
  const bgCol = isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.92)';
  const borderCol = isLight ? 'rgba(148, 163, 184, 0.8)' : 'rgba(100, 116, 139, 0.6)';
  const textCol = isLight ? '#1e293b' : '#e2e8f0';
  const lineCol = isLight ? 'rgba(148, 163, 184, 0.9)' : 'rgba(100, 116, 139, 0.7)';

  const BOX_W = 140;
  const BOX_H = 60;
  const LINE_LEN = 60;

  const callouts = [];

  keys.forEach((k) => {
    // Determine unique key identifier
    const mK = k.matrix ? `${k.matrix[0]},${k.matrix[1]}` : k.id;
    const annotation = keyAnnotations[mK];
    if (!annotation || (!annotation.customText && !annotation.description)) {
      return; // Skip if no annotations
    }

    // Determine base key layout coordinates in screen space
    const screenCenterX = innerOffsetX + (k.x + k.w / 2) * finalScale;
    const screenCenterY = innerOffsetY + (k.y + k.h / 2) * finalScale;

    // Decide Side based on centered alignment
    const centerX = k.x + k.w / 2;
    const isLeftSide = centerX < maxWidth / 2;

    const screenKeyLeftEdge = innerOffsetX + k.x * finalScale;
    const screenKeyRightEdge = innerOffsetX + (k.x + k.w) * finalScale;

    let lineStartX, lineEndX, boxX;
    let lineY = screenCenterY;
    let boxY = lineY - BOX_H / 2;
    let isFallback = false;

    if (isLeftSide) {
      lineStartX = screenKeyLeftEdge;
      lineEndX = lineStartX - LINE_LEN;
      boxX = lineEndX - BOX_W;
    } else {
      lineStartX = screenKeyRightEdge;
      lineEndX = lineStartX + LINE_LEN;
      boxX = lineEndX;
    }

    // Fallback detection: If the callout box overflows left/right bounds
    const needsFallback = isLeftSide ? boxX < 0 : boxX + BOX_W > svgWidth;

    if (needsFallback) {
      isFallback = true;
      const BELOW_OFFSET = 12;
      const screenKeyBottomY = innerOffsetY + (k.y + k.h) * finalScale;
      // Center the box horizontally under the key, clamped to SVG container bounds
      boxX = Math.max(4, Math.min(screenCenterX - BOX_W / 2, svgWidth - BOX_W - 4));
      boxY = screenKeyBottomY + BELOW_OFFSET;
      lineStartX = screenCenterX;
      lineEndX = screenCenterX;
      lineY = screenKeyBottomY;
    }

    callouts.push({
      keyId: mK,
      lineStartX,
      lineEndX,
      lineStartY: lineY,
      lineEndY: isFallback ? boxY : lineY,
      boxX,
      boxY,
      customText: annotation.customText || '',
      description: annotation.description || '',
    });
  });

  if (callouts.length === 0) return null;

  return createElement(
    'svg',
    {
      key: 'callout-overlay-svg',
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: `${svgHeight}px`,
        pointerEvents: 'none',
        zIndex: 50,
      },
    },
    callouts.map((c) => {
      return createElement('g', { key: `callout-g-${c.keyId}` }, [
        // Connecting dash line
        createElement('line', {
          key: 'line',
          x1: c.lineStartX,
          y1: c.lineStartY,
          x2: c.lineEndX,
          y2: c.lineEndY,
          stroke: lineCol,
          strokeWidth: 1.5,
          strokeDasharray: '4 3',
        }),
        // Textbox as foreignObject
        createElement(
          'foreignObject',
          {
            key: 'box',
            x: c.boxX,
            y: c.boxY,
            width: BOX_W,
            height: BOX_H,
          },
          createElement(
            'div',
            {
              xmlns: 'http://www.w3.org/1999/xhtml',
              style: {
                width: `${BOX_W}px`,
                height: `${BOX_H}px`,
                padding: '6px 8px',
                border: `1.2px solid ${borderCol}`,
                borderRadius: '8px',
                backgroundColor: bgCol,
                boxShadow: isLight
                  ? '0 4px 10px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)'
                  : '0 6px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                overflow: 'hidden',
              },
            },
            [
              createElement(
                'div',
                {
                  key: 'custom-text',
                  style: {
                    fontFamily: "'Outfit', 'Noto Sans JP', sans-serif",
                    fontSize: '9px',
                    fontWeight: '700',
                    lineHeight: '1.3',
                    marginBottom: '2px',
                    color: textCol,
                    textAlign: 'left',
                    wordBreak: 'break-all',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  },
                },
                c.customText
              ),
              createElement(
                'div',
                {
                  key: 'description',
                  style: {
                    fontFamily: "'Outfit', 'Noto Sans JP', sans-serif",
                    fontSize: '8px',
                    fontWeight: '400',
                    opacity: 0.8,
                    lineHeight: '1.3',
                    color: textCol,
                    textAlign: 'left',
                    wordBreak: 'break-all',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  },
                },
                c.description
              ),
            ]
          )
        ),
      ]);
    })
  );
}
