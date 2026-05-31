const USER_ID_KEY = "agrivibe_user_id";

/**
 * Detects if the browser is currently running in Incognito / Private Browsing mode.
 * Uses robust storage quota heuristic checks for Chromium/Safari and ServiceWorker check for Firefox.
 */
export async function checkIsIncognito(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // 1. Firefox Private Browsing Check
  // Firefox disables Service Worker in private browsing windows.
  if (navigator.userAgent.includes("Firefox")) {
    if (!("serviceWorker" in navigator)) {
      return true;
    }
  }

  // 2. LocalStorage Check (disabled storage / older iOS Safari Private mode)
  try {
    const testKey = "__agrivibe_incognito_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
  } catch (e) {
    return true;
  }

  // 3. Chromium & Modern Safari Storage Quota Check
  // In Chromium 148+ (Chrome, Edge, Brave, Opera) with predictable-reported-quota,
  // normal mode reports quota of Usage + ~10 GiB, while incognito mode reports Usage + ~9 GiB.
  // We use a threshold of 9.5 GiB to distinguish them. In Safari private mode, the quota is capped under 120MB.
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const { quota } = await navigator.storage.estimate();
      if (quota && quota < 9.5 * 1024 * 1024 * 1024) {
        return true;
      }
    } catch {
      // If estimate fails, assume safe or private based on other checks
    }
  }

  return false;
}

/**
 * Retrieves the persistent User ID from localStorage or creates a new one if not found.
 */
export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "";
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = "usr_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    try {
      localStorage.setItem(USER_ID_KEY, userId);
    } catch (e) {
      // Ignore errors if localStorage is blocked
    }
  }
  return userId;
}
