import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { useBrowserScenarios } from "@/composables/browserScenarios";
import { MAP_EDIT_MODE_ROUTE, ORBAT_CHART_ROUTE } from "@/router/names";
import type { ScenarioMetadata } from "@/scenariostore/localdb";

const { pushMock, sendMock, deleteScenariosMock, listScenariosMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  sendMock: vi.fn(),
  deleteScenariosMock: vi.fn(),
  listScenariosMock: vi.fn<() => Promise<ScenarioMetadata[]>>(async () => []),
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
  useNotifications: () => ({ send: sendMock }),
}));

vi.mock("@/scenariostore/localdb", () => ({
  useIndexedDb: async () => ({
    listScenarios: listScenariosMock,
    deleteScenario: vi.fn(),
    deleteScenarios: deleteScenariosMock,
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
    listScenariosMock.mockResolvedValue([]);
  });

  it("routes open actions to the supplied route name", async () => {
    const { onAction } = useBrowserScenarios({ routeName: ORBAT_CHART_ROUTE });

    await onAction("open", {
      id: "scenario-1",
      name: "Scenario",
      description: "",
      image: "",
      modified: new Date(),
      created: new Date(),
    });

    expect(pushMock).toHaveBeenCalledWith({
      name: ORBAT_CHART_ROUTE,
      params: { scenarioId: "scenario-1" },
    });
  });

  it("defaults open actions to the map editor route", async () => {
    const { onAction } = useBrowserScenarios();

    await onAction("open", {
      id: "scenario-2",
      name: "Scenario",
      description: "",
      image: "",
      modified: new Date(),
      created: new Date(),
    });
    await nextTick();

    expect(pushMock).toHaveBeenCalledWith({
      name: MAP_EDIT_MODE_ROUTE,
      params: { scenarioId: "scenario-2" },
    });
  });

  it("deletes multiple scenarios and sends a success notification", async () => {
    const { onBulkAction } = useBrowserScenarios();
    const scenarios = [
      {
        id: "scenario-1",
        name: "Scenario 1",
        description: "",
        image: "",
        modified: new Date(),
        created: new Date(),
      },
      {
        id: "scenario-2",
        name: "Scenario 2",
        description: "",
        image: "",
        modified: new Date(),
        created: new Date(),
      },
    ];

    await onBulkAction("delete", scenarios);

    expect(deleteScenariosMock).toHaveBeenCalledWith(["scenario-1", "scenario-2"]);
    expect(sendMock).toHaveBeenCalledWith({
      message: "Deleted 2 scenarios",
      type: "success",
    });
    expect(listScenariosMock).toHaveBeenCalled();
  });

  it("preserves the active sort order after reloading scenarios", async () => {
    const { storedScenarios, sortOptions, onBulkAction } = useBrowserScenarios();
    storedScenarios.value = [
      {
        id: "scenario-b",
        name: "Bravo",
        description: "",
        image: "",
        modified: new Date("2024-01-03T00:00:00.000Z"),
        created: new Date("2024-01-03T00:00:00.000Z"),
      },
      {
        id: "scenario-a",
        name: "Alpha",
        description: "",
        image: "",
        modified: new Date("2024-01-04T00:00:00.000Z"),
        created: new Date("2024-01-04T00:00:00.000Z"),
      },
    ];

    const sortByName = sortOptions.value.find((option) => option.label === "Name")!;
    (sortByName.action as () => void)();

    listScenariosMock.mockResolvedValue([
      {
        id: "scenario-b",
        name: "Bravo",
        description: "",
        image: "",
        modified: new Date("2024-01-01T00:00:00.000Z"),
        created: new Date("2024-01-01T00:00:00.000Z"),
      },
      {
        id: "scenario-a",
        name: "Alpha",
        description: "",
        image: "",
        modified: new Date("2024-01-05T00:00:00.000Z"),
        created: new Date("2024-01-05T00:00:00.000Z"),
      },
    ]);

    await onBulkAction("delete", [storedScenarios.value[0]]);

    expect(storedScenarios.value.map((scenario) => scenario.name)).toEqual([
      "Alpha",
      "Bravo",
    ]);
  });

  it("toggles the current sort direction and preserves it after reloading", async () => {
    const {
      storedScenarios,
      sortOptions,
      sortDirection,
      toggleSortDirection,
      onBulkAction,
    } = useBrowserScenarios();
    storedScenarios.value = [
      {
        id: "scenario-a",
        name: "Alpha",
        description: "",
        image: "",
        modified: new Date("2024-01-04T00:00:00.000Z"),
        created: new Date("2024-01-04T00:00:00.000Z"),
      },
      {
        id: "scenario-b",
        name: "Bravo",
        description: "",
        image: "",
        modified: new Date("2024-01-03T00:00:00.000Z"),
        created: new Date("2024-01-03T00:00:00.000Z"),
      },
    ];

    const sortByName = sortOptions.value.find((option) => option.label === "Name")!;
    (sortByName.action as () => void)();
    toggleSortDirection();

    expect(sortDirection.value).toBe("desc");
    expect(storedScenarios.value.map((scenario) => scenario.name)).toEqual([
      "Bravo",
      "Alpha",
    ]);

    listScenariosMock.mockResolvedValue([
      {
        id: "scenario-b",
        name: "Bravo",
        description: "",
        image: "",
        modified: new Date("2024-01-01T00:00:00.000Z"),
        created: new Date("2024-01-01T00:00:00.000Z"),
      },
      {
        id: "scenario-a",
        name: "Alpha",
        description: "",
        image: "",
        modified: new Date("2024-01-05T00:00:00.000Z"),
        created: new Date("2024-01-05T00:00:00.000Z"),
      },
    ]);

    await onBulkAction("delete", [storedScenarios.value[0]]);

    expect(sortDirection.value).toBe("desc");
    expect(storedScenarios.value.map((scenario) => scenario.name)).toEqual([
      "Bravo",
      "Alpha",
    ]);
  });
});
