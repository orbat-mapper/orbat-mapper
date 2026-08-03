import { readonly, ref } from "vue";

const STORAGE_KEY = "legacy-map-deprecation-dismissed";

export const LEGACY_MAP_REMOVAL_DATE = "1 October 2026";
export const LEGACY_MAP_CONTACT_EMAIL = "orbat-mapper@proton.me";

function isDismissedInSession(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

const isVisible = ref(!isDismissedInSession());

/**
 * Deprecation notice for the legacy OpenLayers map mode. Shown once per browser
 * session — dismissing it is remembered in sessionStorage.
 */
export function useLegacyMapDeprecationNotice() {
  function dismiss() {
    isVisible.value = false;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Storage may be unavailable (private mode); dismissing for this view is enough.
    }
  }

  return { isVisible: readonly(isVisible), dismiss };
}

// Test seam: sessionStorage is only read at module load.
export function resetLegacyMapDeprecationNotice() {
  isVisible.value = !isDismissedInSession();
}
