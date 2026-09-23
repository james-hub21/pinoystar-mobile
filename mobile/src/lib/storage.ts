import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Tokens live in the OS keychain / keystore. SecureStore has no web implementation, so Expo web
// (used only for quick previews) falls back to localStorage.
const web = Platform.OS === 'web';

export async function getItem(key: string): Promise<string | null> {
  try {
    if (web) return globalThis.localStorage?.getItem(key) ?? null;
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    if (web) globalThis.localStorage?.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  } catch {
    // Storage full or unavailable: the session still works for this app run.
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    if (web) globalThis.localStorage?.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  } catch {
    // nothing to clean up
  }
}
