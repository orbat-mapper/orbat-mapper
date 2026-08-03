import { beforeEach, describe, expect, it } from "vitest";
import {
  resetLegacyMapDeprecationNotice,
  useLegacyMapDeprecationNotice,
} from "./legacyMapDeprecation";

describe("useLegacyMapDeprecationNotice", () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetLegacyMapDeprecationNotice();
  });

  it("is visible when the session has no dismissal", () => {
    const { isVisible } = useLegacyMapDeprecationNotice();
    expect(isVisible.value).toBe(true);
  });

  it("hides after being dismissed", () => {
    const { isVisible, dismiss } = useLegacyMapDeprecationNotice();
    dismiss();
    expect(isVisible.value).toBe(false);
  });

  it("stays hidden for the rest of the session", () => {
    useLegacyMapDeprecationNotice().dismiss();
    resetLegacyMapDeprecationNotice();
    expect(useLegacyMapDeprecationNotice().isVisible.value).toBe(false);
  });

  it("shows again in a new session", () => {
    useLegacyMapDeprecationNotice().dismiss();
    sessionStorage.clear();
    resetLegacyMapDeprecationNotice();
    expect(useLegacyMapDeprecationNotice().isVisible.value).toBe(true);
  });
});
