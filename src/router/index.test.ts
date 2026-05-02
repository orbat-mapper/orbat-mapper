import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it } from "vitest";
import { LEGACY_MAP_ROUTE, MAP_EDIT_MODE_ROUTE, MAPLIBRE_ROUTE } from "@/router/names";
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

  it("redirects the old MapLibre route to the default scenario map route", async () => {
    const router = createTestRouter();

    await router.push({
      name: MAPLIBRE_ROUTE,
      params: { scenarioId: "test-id" },
    });
    await router.isReady();

    expect(router.currentRoute.value.name).toBe(MAP_EDIT_MODE_ROUTE);
    expect(router.currentRoute.value.path).toBe("/scenario/test-id");
  });
});
