import { describe, it, expect } from 'vitest';
import { buildEncoderTooltip } from '../../js/components/keycapTooltip.js';

describe('keycapTooltip.js buildEncoderTooltip tests', () => {
  it('should build encoder tooltip without annotation correctly', () => {
    const tooltip = buildEncoderTooltip({
      encoderIndex: 0,
      pushText: 'Escape',
      pushCode: 'KC_ESCAPE',
      ccwActions: ['KC_PAGE_DOWN', 'KC_PAGE_UP'],
      ccwLabel: 'Page Down',
      cwLabel: 'Page Up',
      ccwCode: 'KC_PAGE_DOWN',
      cwCode: 'KC_PAGE_UP',
    });

    expect(tooltip).toContain('Encoder e0');
    expect(tooltip).toContain('Push: Escape (KC_ESCAPE)');
    expect(tooltip).toContain('CW (Clockwise): Page Up (KC_PAGE_UP)');
    expect(tooltip).toContain('CCW (Counter-Clockwise): Page Down (KC_PAGE_DOWN)');
    expect(tooltip).not.toContain('📌');
  });

  it('should build encoder tooltip with custom annotation correctly', () => {
    const tooltip = buildEncoderTooltip({
      encoderIndex: 1,
      pushText: 'Mute',
      pushCode: 'KC_MUTE',
      ccwActions: ['KC_VOLD', 'KC_VOLU'],
      ccwLabel: 'Volume Down',
      cwLabel: 'Volume Up',
      ccwCode: 'KC_VOLD',
      cwCode: 'KC_VOLU',
      annotation: {
        customText: '音量調節ダイヤル',
        description: '時計回りで音量アップ、反時計回りで音量ダウンします。',
      },
    });

    // アノテーションが最上部に描画され、その後に通常のエンコーダー詳細が続くことを確認
    const lines = tooltip.split('\n');
    expect(lines[0]).toBe('📌 音量調節ダイヤル');
    expect(lines[1]).toBe('   時計回りで音量アップ、反時計回りで音量ダウンします。');
    expect(lines[2]).toBe('----');
    expect(lines[3]).toBe('Encoder e1');
    expect(lines[4]).toBe('Push: Mute (KC_AUDIO_MUTE)');
  });
});
