const { createElement } = React;

export function KeyCalloutOverlay({ model, isLight, _isAppDark }) {
  if (!model || !Array.isArray(model.callouts) || model.callouts.length === 0) {
    return null;
  }

  const bgCol = isLight ? 'rgba(255, 255, 255, 0.985)' : 'rgba(15, 23, 42, 0.92)';
  const borderCol = isLight ? 'rgba(100, 116, 139, 0.55)' : 'rgba(100, 116, 139, 0.6)';
  const textCol = isLight ? '#1e293b' : '#e2e8f0';
  const lineCol = isLight ? 'rgba(100, 116, 139, 0.72)' : 'rgba(100, 116, 139, 0.7)';
  const boxShadow = isLight
    ? '0 14px 28px rgba(148, 163, 184, 0.2), 0 4px 10px rgba(15, 23, 42, 0.08)'
    : '0 6px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)';

  return createElement(
    'div',
    {
      key: 'callout-overlay-root',
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: `${model.overlayHeight}px`,
        pointerEvents: 'none',
        zIndex: 50,
        overflow: 'visible',
      },
    },
    [
      createElement(
        'svg',
        {
          key: 'callout-lines',
          style: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${model.overlayHeight}px`,
            overflow: 'visible',
          },
        },
        model.callouts.map((callout) =>
          createElement('line', {
            key: `line-${callout.keyId}`,
            x1: callout.lineStartX,
            y1: callout.lineStartY,
            x2: callout.lineEndX,
            y2: callout.lineEndY,
            stroke: lineCol,
            strokeWidth: 1.5,
            strokeDasharray: '4 3',
          })
        )
      ),
      ...model.callouts.map((callout) => {
        const wrapperStyle =
          callout.placement === 'below'
            ? {
                position: 'absolute',
                left: `${callout.boxLeft}px`,
                top: `${callout.boxTop}px`,
                width: `${callout.estimatedWidth}px`,
                display: 'flex',
                justifyContent: 'center',
              }
            : {
                position: 'absolute',
                left: `${callout.boxLeft}px`,
                top: `${callout.boxTop}px`,
                width: `${callout.estimatedWidth}px`,
                display: 'flex',
                justifyContent: callout.placement === 'left' ? 'flex-end' : 'flex-start',
              };

        return createElement(
          'div',
          {
            key: `box-wrap-${callout.keyId}`,
            style: wrapperStyle,
          },
          createElement(
            'div',
            {
              style: {
                width: 'fit-content',
                maxWidth: `${callout.estimatedWidth}px`,
                padding: '8px 12px',
                border: `1.2px solid ${borderCol}`,
                borderRadius: '8px',
                backgroundColor: bgCol,
                boxShadow,
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
              },
            },
            [
              callout.customText
                ? createElement(
                    'div',
                    {
                      key: 'custom-text',
                      style: {
                        fontFamily: "'Outfit', 'Noto Sans JP', sans-serif",
                        fontSize: '11px',
                        fontWeight: '700',
                        lineHeight: '1.35',
                      marginBottom: callout.description ? '4px' : '0',
                      color: textCol,
                      textAlign: 'left',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                    },
                  },
                  callout.customText
                  )
                : null,
              callout.description
                ? createElement(
                    'div',
                    {
                      key: 'description',
                      style: {
                        fontFamily: "'Outfit', 'Noto Sans JP', sans-serif",
                        fontSize: '10px',
                        fontWeight: '400',
                        opacity: 0.9,
                        lineHeight: '1.4',
                        color: textCol,
                        textAlign: 'left',
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                      },
                    },
                    callout.description
                  )
                : null,
            ]
          )
        );
      }),
    ]
  );
}
