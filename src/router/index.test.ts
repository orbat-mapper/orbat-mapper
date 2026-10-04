import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it } from "vitest";
import { MAP_EDIT_MODE_ROUTE } from "@/router/names";
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

  it("redirects old legacy map links to the default map view", () => {
    const router = createTestRouter();

    const resolved = router.resolve("/scenario/test-id/legacy");
    const record = resolved.matched.at(-1)!;
    const redirect = record.redirect;
    expect(record.components).toBeUndefined();
    expect(typeof redirect).toBe("function");
    if (typeof redirect !== "function") throw new Error("Expected a redirect");

    expect(redirect(resolved, router.currentRoute.value)).toEqual({
      name: MAP_EDIT_MODE_ROUTE,
      params: { scenarioId: "test-id" },
    });
  });
});
