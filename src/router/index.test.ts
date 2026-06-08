import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it } from "vitest";
import { LEGACY_MAP_ROUTE, MAP_EDIT_MODE_ROUTE } from "@/router/names";
import { routes } from "@/router";

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes,
  });
}

describe("router map routes", () => {
  it("uses MapLibre as the default scenario map route", () => {
    const router = createTestRouter();

    const resolved = router.resolve("/scenario/test-id");

    expect(resolved.name).toBe(MAP_EDIT_MODE_ROUTE);
  });

  it("moves OpenLayers to the legacy route", () => {
    const router = createTestRouter();

    const resolved = router.resolve("/scenario/test-id/legacy");

    expect(resolved.name).toBe(LEGACY_MAP_ROUTE);
  });
});
