import * as types from './types';

// --- Theme Actions ---
export const toggleTheme = () => ({
  type: types.TOGGLE_THEME,
});

export const setTheme = (isDark: boolean) => ({
  type: types.SET_THEME,
  payload: isDark,
});

// --- Network Actions ---
export const setNetworkStatus = (isConnected: boolean) => ({
  type: types.NETWORKSTATUS,
  payload: isConnected,
});
