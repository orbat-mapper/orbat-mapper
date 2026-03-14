import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { useBrowserScenarios } from "@/composables/browserScenarios";
import { GLOBE_ROUTE, MAP_EDIT_MODE_ROUTE } from "@/router/names";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@vueuse/core", async () => {
  const actual = await vi.importActual<typeof import("@vueuse/core")>("@vueuse/core");
  return {
    ...actual,
    useClipboard: () => ({ copy: vi.fn() }),
  };
});

vi.mock("@/composables/notifications", () => ({
  useNotifications: () => ({ send: vi.fn() }),
}));

vi.mock("@/scenariostore/localdb", () => ({
  useIndexedDb: async () => ({
    listScenarios: async () => [],
    deleteScenario: vi.fn(),
    duplicateScenario: vi.fn(),
    downloadAsJson: vi.fn(),
    loadScenario: vi.fn(),
    addScenario: vi.fn(),
    getScenarioInfo: vi.fn(),
    putScenario: vi.fn(),
  }),
}));

describe("useBrowserScenarios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes open actions to the supplied route name", async () => {
    const { onAction } = useBrowserScenarios({ routeName: GLOBE_ROUTE });

    await onAction("open", {
      id: "scenario-1",
      name: "Scenario",
      description: "",
      modified: Date.now(),
      created: Date.now(),
    });

    expect(pushMock).toHaveBeenCalledWith({
      name: GLOBE_ROUTE,
      params: { scenarioId: "scenario-1" },
    });
  });

  it("defaults open actions to the map editor route", async () => {
    const { onAction } = useBrowserScenarios();

    await onAction("open", {
      id: "scenario-2",
      name: "Scenario",
      description: "",
      modified: Date.now(),
      created: Date.now(),
    });
    await nextTick();

    expect(pushMock).toHaveBeenCalledWith({
      name: MAP_EDIT_MODE_ROUTE,
      params: { scenarioId: "scenario-2" },
    });
  });
});
