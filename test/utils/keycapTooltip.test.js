import { describe, it, expect } from 'vitest';
import { 
  buildEncoderTooltip, 
  buildStandardHoverInfo, 
  buildEncoderHoverInfo 
} from '../../js/components/keycapTooltip.js';

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
    expect(lines[0]).toBe('音量調節ダイヤル');
    expect(lines[1]).toBe('   時計回りで音量アップ、反時計回りで音量ダウンします。');
    expect(lines[2]).toBe('----');
    expect(lines[3]).toBe('Encoder e1');
    expect(lines[4]).toBe('Push: Mute (KC_AUDIO_MUTE)');
  });
});

describe('keycapTooltip.js buildStandardHoverInfo tests', () => {
  it('should extract structured hover info for standard key correctly', () => {
    const info = buildStandardHoverInfo(
      'KC_ENT',
      'Windows',
      [],
      {
        code: 'KC_ENTER',
        officialCode: 'KC_ENTER',
        displayRaw: 'KC_ENT',
        displayText: 'Enter',
        isAliasInput: true,
        inputCode: 'KC_ENT',
      },
      {
        customText: '決定キー',
        description: 'フォームを送信したり改行したりします。',
      }
    );

    expect(info.annotation.customText).toBe('決定キー');
    expect(info.officialCode).toBe('KC_ENTER');
    expect(info.isAliasInput).toBe(true);
    expect(info.debugLines).toBeInstanceOf(Array);
  });
});

describe('keycapTooltip.js buildEncoderHoverInfo tests', () => {
  it('should extract structured hover info for encoder key correctly', () => {
    const info = buildEncoderHoverInfo({
      encoderIndex: 2,
      pushText: 'Mute',
      pushCode: 'KC_AUDIO_MUTE',
      ccwActions: ['KC_VOLD', 'KC_VOLU'],
      ccwLabel: 'Volume Down',
      cwLabel: 'Volume Up',
      ccwCode: 'KC_VOLD',
      cwCode: 'KC_VOLU',
      annotation: {
        customText: 'ノブ',
      }
    });

    expect(info.isEncoder).toBe(true);
    expect(info.encoderIndex).toBe(2);
    expect(info.annotation.customText).toBe('ノブ');
    expect(info.pushInfo.label).toBe('Mute');
    expect(info.pushInfo.code).toBe('KC_AUDIO_MUTE');
    expect(info.cwInfo.prefix).toBe('CW (Clockwise)');
    expect(info.cwInfo.label).toBe('Volume Up');
    expect(info.ccwInfo.label).toBe('Volume Down');
  });
});
