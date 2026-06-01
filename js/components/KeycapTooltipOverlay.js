const { createElement, useRef, useLayoutEffect, useState } = React;

// エンコーダのアクション行を描画する純粋ヘルパー関数
function renderEncoderActionRow(label, actionInfo, isLight, key) {
  const labelColClass = isLight ? 'text-slate-400' : 'text-slate-500';
  const secondaryTextClass = isLight ? 'text-slate-600' : 'text-slate-200';
  const tertiaryTextClass = isLight ? 'text-slate-500' : 'text-slate-300';
  return createElement(
    'div',
    { key, className: 'flex flex-col gap-0.5' },
    [
      createElement(
        'div',
        { key: 'title-row', className: 'flex flex-wrap items-baseline gap-1.5' },
        [
          createElement(
            'span',
            {
              key: 'lbl',
              className: `text-[8.5px] font-black tracking-wider uppercase ${labelColClass}`,
              style: { fontFamily: "'Outfit', sans-serif" },
            },
            `${label}:`
          ),
          createElement(
            'span',
            {
              key: 'val',
              className: 'text-[10px] font-black tracking-wide text-current',
              style: { fontFamily: "'Outfit', sans-serif" },
            },
            actionInfo.label || 'None'
          ),
          createElement(
            'span',
            {
              key: 'code',
              className: `text-[8.5px] font-mono ${labelColClass}`,
            },
            `(${actionInfo.code || 'KC_NO'})`
          ),
        ]
      ),
      actionInfo.desc
        ? createElement(
            'div',
            {
              key: 'desc',
              className: `text-[9.5px] font-medium ${secondaryTextClass} break-all leading-normal pl-3`,
              style: { fontFamily: "'Noto Sans JP', sans-serif" },
            },
            actionInfo.desc
          )
        : null,
      actionInfo.macros && actionInfo.macros.length > 0
        ? createElement('div', { key: 'macro-steps', className: 'flex flex-col gap-0.5 pl-3 pt-1' }, [
            createElement(
              'div',
              {
                key: 'macro-title',
                className: `text-[8px] font-black tracking-widest uppercase ${labelColClass}`,
                style: { fontFamily: "'Outfit', sans-serif" },
              },
              'Macro Actions'
            ),
            ...actionInfo.macros.map((step, idx) =>
              createElement(
                'div',
                {
                  key: `macro-step-${idx}`,
                  className: `text-[9px] font-medium ${tertiaryTextClass} break-all leading-normal`,
                  style: { fontFamily: "'Noto Sans JP', sans-serif" },
                },
                step
              )
            ),
          ])
        : null,
    ]
  );
}

export function KeycapTooltipOverlay({ activeTooltip, isLight }) {
  const tooltipRef = useRef(null);
  const [coords, setCoords] = useState(null);

  useLayoutEffect(() => {
    if (!activeTooltip || !tooltipRef.current) return;

    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl.offsetWidth;
    const tooltipHeight = tooltipEl.offsetHeight;

    let targetX, targetY;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (activeTooltip.isFixed) {
      // キーキャップの真下中央に配置
      targetX = activeTooltip.x - tooltipWidth / 2;
      targetY = activeTooltip.y + 8; // 下方向に8pxの隙間

      // 下端で見切れる場合はキーキャップの真上中央に配置
      if (targetY + tooltipHeight > windowHeight - 16) {
        targetY = activeTooltip.y - activeTooltip.keycapHeight - tooltipHeight - 8;
      }
    } else {
      // フォールバック（従来のマウス追従）
      const OFFSET_X = 14;
      const OFFSET_Y = 14;
      targetX = activeTooltip.x + OFFSET_X;
      targetY = activeTooltip.y + OFFSET_Y;

      if (targetX + tooltipWidth > windowWidth - 16) {
        targetX = activeTooltip.x - tooltipWidth - OFFSET_X;
      }
      if (targetY + tooltipHeight > windowHeight - 16) {
        targetY = activeTooltip.y - tooltipHeight - OFFSET_Y;
      }
    }

    // 画面四隅からの絶対的な見切れクランプ処理
    if (targetX + tooltipWidth > windowWidth - 16) {
      targetX = windowWidth - tooltipWidth - 16;
    }
    if (targetX < 16) {
      targetX = 16;
    }
    if (targetY + tooltipHeight > windowHeight - 16) {
      targetY = windowHeight - tooltipHeight - 16;
    }
    if (targetY < 16) {
      targetY = 16;
    }

    setCoords({ left: targetX, top: targetY });
  }, [activeTooltip]);

  if (!activeTooltip) return null;

  const {
    annotation,
    officialCode,
    description,
    inputCode,
    isAliasInput,
    macros,
    debugLines,
    isEncoder,
    encoderIndex,
    pushInfo,
    cwInfo,
    ccwInfo,
  } = activeTooltip.contentInfo || {};

  // テーマ別スタイル設定（styleオブジェクトに直接指定して透過パースバグを確実に防ぐ）
  const bgCol = isLight ? 'rgba(255, 255, 255, 0.985)' : 'rgba(15, 23, 42, 0.93)';
  const borderCol = isLight ? 'rgba(100, 116, 139, 0.28)' : 'rgba(100, 116, 139, 0.45)';
  const textCol = isLight ? '#1e293b' : '#f8fafc';
  const boxShadow = isLight
    ? '0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)'
    : '0 25px 50px -12px rgba(0, 0, 0, 0.65)';

  const labelColClass = isLight ? 'text-slate-400' : 'text-slate-500';
  const annotationTitleClass = isLight ? 'text-blue-600' : 'text-blue-400';
  const secondaryTextClass = isLight ? 'text-slate-600' : 'text-slate-200';
  const tertiaryTextClass = isLight ? 'text-slate-500' : 'text-slate-300';
  const debugTextClass = isLight ? 'text-slate-500' : 'text-slate-300';

  const children = [];

  // 1. カスタム注釈（アノテーション）
  if (annotation && (annotation.customText || annotation.description)) {
    const annotChildren = [];
    if (annotation.customText) {
      annotChildren.push(
        createElement(
          'div',
          {
            key: 'annot-title',
            className: `${annotationTitleClass} text-[11px] font-black leading-snug tracking-wide uppercase mb-0.5 break-all`,
          },
          annotation.customText
        )
      );
    }
    if (annotation.description) {
      annotChildren.push(
        createElement(
          'div',
            {
              key: 'annot-desc',
              className: `${secondaryTextClass} text-[10px] leading-relaxed break-all font-semibold`,
            },
            annotation.description
          )
      );
    }

    children.push(
      createElement('div', { key: 'annot-block', className: 'flex flex-col' }, annotChildren)
    );

    // アノテーションがある場合の境界セパレータ（アイコンなし）
    children.push(
      createElement('hr', {
        key: 'annot-sep',
        className: `my-2.5 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/60'}`,
      })
    );
  }

  // 2. キー情報またはエンコーダ情報
  if (isEncoder) {
    children.push(
      createElement(
        'div',
        {
          key: 'encoder-header',
          className: `text-[10px] font-black tracking-widest ${labelColClass} uppercase mb-2`,
          style: { fontFamily: "'Outfit', sans-serif" },
        },
        `Encoder e${encoderIndex}`
      )
    );

    const actions = [];
    if (pushInfo) {
      actions.push(renderEncoderActionRow('Push', pushInfo, isLight, 'push'));
    }
    if (cwInfo) {
      actions.push(renderEncoderActionRow(cwInfo.prefix || 'CW', cwInfo, isLight, 'cw'));
    }
    if (ccwInfo) {
      actions.push(renderEncoderActionRow(ccwInfo.prefix || 'CCW', ccwInfo, isLight, 'ccw'));
    }

    children.push(
      createElement('div', { key: 'encoder-actions', className: 'flex flex-col gap-2' }, actions)
    );
  } else {
    children.push(
      createElement('div', { key: 'keycode-block', className: 'flex flex-col' }, [
        createElement(
          'div',
          {
            key: 'code-row',
            className: 'flex items-baseline gap-2 mb-0.5 flex-wrap',
          },
          [
            createElement(
              'span',
              {
                key: 'official-code',
                className: 'text-xs font-black tracking-wide text-current',
                style: { fontFamily: "'Outfit', sans-serif" },
              },
              officialCode || 'KC_NO'
            ),
            isAliasInput && inputCode
              ? createElement(
                  'span',
                  {
                    key: 'input-code',
                    className: `text-[9px] font-medium ${labelColClass}`,
                    style: { fontFamily: "'Outfit', sans-serif" },
                  },
                  `(Input: ${inputCode})`
                )
              : null,
          ]
        ),
        description
          ? createElement(
              'div',
              {
                key: 'code-desc',
                className: `text-[10px] font-medium ${secondaryTextClass}`,
                style: { fontFamily: "'Noto Sans JP', sans-serif" },
              },
              description
            )
          : null,
      ])
    );
  }

  // 3. マクロアクションのリスト
  if (macros && macros.length > 0) {
    children.push(
      createElement('hr', {
        key: 'macro-sep',
        className: `my-2.5 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/60'}`,
      })
    );
    children.push(
      createElement('div', { key: 'macro-block', className: 'flex flex-col gap-1' }, [
        createElement(
          'div',
          {
            key: 'macro-title',
            className: `text-[8px] font-black tracking-widest ${labelColClass} uppercase mb-0.5`,
            style: { fontFamily: "'Outfit', sans-serif" },
          },
          'Macro Actions'
        ),
        ...macros.map((step, idx) =>
          createElement(
            'div',
            {
              key: `macro-step-${idx}`,
              className: `text-[9.5px] font-medium ${tertiaryTextClass} break-all leading-normal`,
              style: { fontFamily: "'Noto Sans JP', sans-serif" },
            },
            step
          )
        ),
      ])
    );
  }

  // 4. デバッグ・インスペクター情報
  if (debugLines && debugLines.length > 0) {
    children.push(
      createElement('hr', {
        key: 'debug-sep',
        className: `my-2.5 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/60'}`,
      })
    );
    children.push(
      createElement('div', { key: 'debug-block', className: 'flex flex-col gap-0.5' }, [
        createElement(
          'div',
          {
            key: 'debug-title',
            className: `text-[8px] font-black tracking-widest ${isLight ? 'text-slate-400' : 'text-slate-600'} uppercase mb-1`,
            style: { fontFamily: "'Outfit', sans-serif" },
          },
          'Inspector Debug'
        ),
        ...debugLines.map((line, idx) =>
          createElement(
            'div',
              {
                key: `debug-line-${idx}`,
                className: `text-[8.5px] font-mono leading-relaxed ${debugTextClass} break-all`,
              },
              line
            )
        ),
      ])
    );
  }

  return createElement(
    'div',
    {
      ref: tooltipRef,
      style: {
        position: 'fixed',
        left: `${coords?.left ?? 0}px`,
        top: `${coords?.top ?? 0}px`,
        pointerEvents: 'none',
        zIndex: 1000,
        width: 'max-content',
        maxWidth: '280px',
        boxSizing: 'border-box',
        visibility: coords ? 'visible' : 'hidden',
        fontFamily: "'Outfit', 'Noto Sans JP', sans-serif",
        backgroundColor: bgCol,
        border: `1.2px solid ${borderCol}`,
        boxShadow: boxShadow,
        color: textCol,
      },
      className: `rounded-xl p-3.5 backdrop-blur-md transition-opacity duration-100 animate-in fade-in zoom-in-95`,
    },
    children
  );
}
