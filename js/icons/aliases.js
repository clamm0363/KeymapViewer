// QMK/ZMK Keycode to Fluent UI Icon mapping table
export const ICON_ALIASES = {
  // Power & System Controls
  'KC_SYSTEM_POWER': 'KC_KB_POWER',
  'KC_PWR': 'KC_KB_POWER',
  'KC_SLEP': 'KC_SYSTEM_SLEEP',
  'KC_WAKE': 'KC_SYSTEM_WAKE',

  // Audio / Sound Controls
  'KC_MUTE': 'KC_AUDIO_MUTE',
  'KC_KB_VOLUME_UP': 'KC_AUDIO_VOL_UP',
  'KC_VOLU': 'KC_AUDIO_VOL_UP',
  'KC_KB_VOLUME_DOWN': 'KC_AUDIO_VOL_DOWN',
  'KC_VOLD': 'KC_AUDIO_VOL_DOWN',

  // Media Controls
  'KC_MEDIA_PLAY': 'KC_MEDIA_PLAY_PAUSE',
  'KC_MPLY': 'KC_MEDIA_PLAY_PAUSE',
  'KC_MSTP': 'KC_MEDIA_STOP',
  'KC_MNXT': 'KC_MEDIA_NEXT_TRACK',
  'KC_MPRV': 'KC_MEDIA_PREV_TRACK',
  'KC_MFFD': 'KC_MEDIA_FAST_FORWARD',
  'KC_MRWD': 'KC_MEDIA_REWIND',
  'KC_EJCT': 'KC_MEDIA_EJECT',
  'KC_MSEL': 'KC_MEDIA_SELECT',

  // Brightness Controls
  'KC_BRIGHTNESS_UP': 'KC_KB_BRIGHTNESS_UP',
  'KC_BRIU': 'KC_KB_BRIGHTNESS_UP',
  'KC_BRIGHTNESS_DOWN': 'KC_KB_BRIGHTNESS_DOWN',
  'KC_BRID': 'KC_KB_BRIGHTNESS_DOWN',

  // WWW & Browser Operations
  'KC_MYCM': 'KC_MY_COMPUTER',
  'KC_WHOM': 'KC_WWW_HOME',
  'KC_WBAK': 'KC_WWW_BACK',
  'KC_WWW_BACK_ALT': 'KC_WWW_BACK',
  'KC_WFWD': 'KC_WWW_FORWARD',
  'KC_WWW_FORWARD_ALT': 'KC_WWW_FORWARD',
  'KC_WSTP': 'KC_WWW_STOP',
  'KC_WREF': 'KC_WWW_REFRESH',
  'KC_WFAV': 'KC_WWW_FAVORITES',

  // Utility Controls
  'KC_CPNL': 'KC_CONTROL_PANEL',
  'KC_ASST': 'KC_ASSISTANT',
  'KC_MCTL': 'KC_MISSION_CONTROL',
  'KC_LPAD': 'KC_LAUNCHPAD',

  // Standard Keyboard Key Aliases
  'KC_PENT': 'KC_ENT',
  'KC_REDO': 'KC_AGAIN',

  // QMK Magic Controls (Mapped cleanly to arrow swap or keyboard icons)
  'KC_MAGIC_TOGGLE_CONTROL_CAPS_LOCK': 'ic_fluent_arrow_swap_24_regular',
  'MAGIC_TOGGLE_CONTROL_CAPS_LOCK': 'ic_fluent_arrow_swap_24_regular',
  'KC_MAGIC_TOGGLE_ESCAPE_CAPS_LOCK': 'ic_fluent_arrow_swap_24_regular',
  'MAGIC_TOGGLE_ESCAPE_CAPS_LOCK': 'ic_fluent_arrow_swap_24_regular',
  'KC_MAGIC_TOGGLE_CTL_GUI': 'ic_fluent_arrow_swap_24_regular',
  'MAGIC_TOGGLE_CTL_GUI': 'ic_fluent_arrow_swap_24_regular',
  'KC_MAGIC_TOGGLE_ALT_GUI': 'ic_fluent_arrow_swap_24_regular',
  'MAGIC_TOGGLE_ALT_GUI': 'ic_fluent_arrow_swap_24_regular',
  'KC_MAGIC_TOGGLE_BACKSLASH_BACKSPACE': 'ic_fluent_arrow_swap_24_regular',
  'MAGIC_TOGGLE_BACKSLASH_BACKSPACE': 'ic_fluent_arrow_swap_24_regular',
  'KC_MAGIC_TOGGLE_GRAVE_ESC': 'ic_fluent_arrow_swap_24_regular',
  'MAGIC_TOGGLE_GRAVE_ESC': 'ic_fluent_arrow_swap_24_regular',
  'KC_CG_TOGG': 'ic_fluent_arrow_swap_24_regular',
  'CG_TOGG': 'ic_fluent_arrow_swap_24_regular',
  'KC_AG_TOGG': 'ic_fluent_arrow_swap_24_regular',
  'AG_TOGG': 'ic_fluent_arrow_swap_24_regular',

  'KC_MAGIC_TOGGLE_NKRO': 'ic_fluent_keyboard_24_regular',
  'MAGIC_TOGGLE_NKRO': 'ic_fluent_keyboard_24_regular',

  'KC_MAGIC_TOGGLE_GUI': 'ic_fluent_lock_closed_24_regular',
  'MAGIC_TOGGLE_GUI': 'ic_fluent_lock_closed_24_regular',

  // Wireless Connection Keycodes Specific Mappings
  'KC_OUT_AUTO': 'ic_fluent_bluetooth_connected_24_regular',
  'KC_OUT_USB': 'ic_fluent_connector_24_regular',
  'KC_OUT_BT': 'ic_fluent_bluetooth_24_regular',
  'KC_OUT_2G4': 'ic_fluent_wifi_1_24_regular',

  'KC_BT_SEL_0': 'ic_fluent_bluetooth_24_regular',
  'KC_BT_SEL_1': 'ic_fluent_bluetooth_24_regular',
  'KC_BT_SEL_2': 'ic_fluent_bluetooth_24_regular',
  'KC_BT_SEL_3': 'ic_fluent_bluetooth_24_regular',
  'KC_BT_SEL_4': 'ic_fluent_bluetooth_24_regular',
  'KC_BT_NXT': 'ic_fluent_bluetooth_24_regular',
  'KC_BT_PRV': 'ic_fluent_bluetooth_24_regular',
  'KC_BT_ON': 'ic_fluent_bluetooth_24_regular',

  'KC_BT_CLR': 'ic_fluent_bluetooth_disabled_24_regular',
  'KC_BT_CLR_ALL': 'ic_fluent_bluetooth_disabled_24_regular',
  'KC_BT_OFF': 'ic_fluent_bluetooth_disabled_24_regular',

  'KC_BT_TOGG': 'ic_fluent_bluetooth_searching_24_regular'
};
