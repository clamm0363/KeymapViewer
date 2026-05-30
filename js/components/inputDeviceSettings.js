export const INPUT_DEVICE_KINDS = {
  ENCODER: 'Encoder',
  POINTING_DEVICE: 'PointingDevice',
};

export const ENCODER_VARIANTS = ['Dial', 'VerticalWheel', 'HorizontalWheel'];
export const POINTING_DEVICE_VARIANTS = ['Trackball', 'Touchpad'];

export function getDefaultInputDeviceSetting(kind = INPUT_DEVICE_KINDS.ENCODER) {
  if (kind === INPUT_DEVICE_KINDS.POINTING_DEVICE) {
    return { kind, variant: 'Trackball' };
  }
  return { kind: INPUT_DEVICE_KINDS.ENCODER, variant: 'Dial' };
}

export function normalizeLegacyEncoderStyle(style) {
  switch (style) {
    case 'Trackball':
      return { kind: INPUT_DEVICE_KINDS.POINTING_DEVICE, variant: 'Trackball' };
    case 'VerticalWheel':
    case 'HorizontalWheel':
    case 'Dial':
      return { kind: INPUT_DEVICE_KINDS.ENCODER, variant: style };
    default:
      return getDefaultInputDeviceSetting();
  }
}

export function resolveInputDeviceSetting(inputDeviceSettings, encoderStyles, index) {
  const keyed = inputDeviceSettings && inputDeviceSettings[index];
  if (keyed && keyed.kind && keyed.variant) {
    return keyed;
  }
  const legacyStyle = encoderStyles && encoderStyles[index];
  return normalizeLegacyEncoderStyle(legacyStyle);
}

export function toLegacyEncoderStyle(setting) {
  if (!setting || !setting.kind || !setting.variant) return 'Dial';
  if (setting.kind === INPUT_DEVICE_KINDS.POINTING_DEVICE) {
    return setting.variant === 'Trackball' ? 'Trackball' : 'Dial';
  }
  return setting.variant;
}

export function getVariantOptions(kind) {
  if (kind === INPUT_DEVICE_KINDS.POINTING_DEVICE) {
    return [
      { value: 'Trackball', label: 'Trackball' },
      { value: 'Touchpad', label: 'Touchpad' },
    ];
  }

  return [
    { value: 'Dial', label: 'Dial' },
    { value: 'VerticalWheel', label: 'Wheel (V)' },
    { value: 'HorizontalWheel', label: 'Wheel (H)' },
  ];
}
