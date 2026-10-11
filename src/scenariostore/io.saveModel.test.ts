import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { shallowRef } from "vue";
import type { Scenario } from "@/types/scenarioModels";
import "@/dayjs";

const {
  deleteScenarioDraftMock,
  getScenarioDraftMock,
  putScenarioDraftMock,
  putScenarioMock,
  sendMock,
} = vi.hoisted(() => ({
  putScenarioMock: vi.fn(async (scenario) => scenario.id),
  putScenarioDraftMock: vi.fn(async (scenarioId, scenario, options) => ({
    scenarioId,
    scenario,
    ...options,
  })),
  deleteScenarioDraftMock: vi.fn(async () => undefined),
  getScenarioDraftMock: vi.fn(async () => undefined),
  sendMock: vi.fn(),
}));

vi.mock("@/stores/settingsStore", () => ({
  useSymbolSettingsStore: () => ({ symbologyStandard: "2525d" }),
}));

vi.mock("@/composables/notifications", () => ({
  useNotifications: () => ({ send: sendMock }),
}));

vi.mock("@/scenariostore/localdb", () => ({
  useIndexedDb: async () => ({
    putScenario: putScenarioMock,
    putScenarioDraft: putScenarioDraftMock,
    deleteScenarioDraft: deleteScenarioDraftMock,
    getScenarioDraft: getScenarioDraftMock,
  }),
}));

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("Scenario IO save model", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.clearAllMocks();
    putScenarioMock.mockImplementation(async (scenario) => scenario.id);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  async function createIo() {
    const { createEmptyScenario, useScenarioIO } = await import("./io");
    const { useNewScenarioStore } = await import("./newScenarioStore");

    const scenario = createEmptyScenario({ id: "scenario-1" });
    const storeRef = shallowRef(useNewScenarioStore(scenario));
    const io = useScenarioIO(storeRef);
    io.loadFromObject(scenario);

    return { io, storeRef, scenario };
  }

  it("initializes baselines and tracks dirty state from store mutations", async () => {
    const { io, storeRef, scenario } = await createIo();

    expect(io.loadedBaseline.value).toMatchObject({ id: scenario.id });
    expect(io.savedBaseline.value).toMatchObject({ id: scenario.id });
    expect(io.savedDirty.value).toBe(false);
    expect(io.hasDistinctOpenedBaseline.value).toBe(false);

    storeRef.value.update((draft) => {
      draft.info.name = "Changed once";
    });
    await flushMicrotasks();

    expect(io.savedDirty.value).toBe(true);
  });

  it("updates the saved baseline and clears drafts on explicit save", async () => {
    const { io, storeRef } = await createIo();

    storeRef.value.update((draft) => {
      draft.info.name = "Updated before save";
    });
    await flushMicrotasks();

    await io.saveToIndexedDb();

    expect(putScenarioMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "scenario-1", name: "Updated before save" }),
    );
    expect(deleteScenarioDraftMock).toHaveBeenCalledWith("scenario-1");
    expect(io.savedDirty.value).toBe(false);
    expect(io.savedBaseline.value).toMatchObject({ name: "Updated before save" });
  });

  it("reverts to the saved baseline and restores the original loaded baseline", async () => {
    const { io, storeRef } = await createIo();
    const initialRevision = io.sessionRevision.value;

    storeRef.value.update((draft) => {
      draft.info.name = "Saved version";
    });
    await flushMicrotasks();
    await io.saveToIndexedDb();
    expect(io.hasDistinctOpenedBaseline.value).toBe(true);

    storeRef.value.update((draft) => {
      draft.info.name = "Unsaved edit";
    });
    await flushMicrotasks();
    expect(io.savedDirty.value).toBe(true);

    expect(io.revertToSaved()).toBe(true);
    expect(io.sessionRevision.value).toBe(initialRevision + 1);
    expect(io.serializeToObject().name).toBe("Saved version");
    expect(io.savedDirty.value).toBe(false);

    expect(io.restoreLoadedBaseline()).toBe(true);
    expect(io.sessionRevision.value).toBe(initialRevision + 2);
    expect(io.serializeToObject().name).toBe("New scenario");
    expect(io.savedDirty.value).toBe(true);
  });

  it("tracks dirty state correctly across undo and redo", async () => {
    const { io, storeRef } = await createIo();

    storeRef.value.update((draft) => {
      draft.info.name = "Saved version";
    });
    await flushMicrotasks();
    await io.saveToIndexedDb();

    storeRef.value.update((draft) => {
      draft.info.name = "Unsaved edit";
    });
    await flushMicrotasks();
    expect(io.savedDirty.value).toBe(true);

    storeRef.value.undo();
    await flushMicrotasks();
    expect(io.savedDirty.value).toBe(false);

    storeRef.value.redo();
    await flushMicrotasks();
    expect(io.savedDirty.value).toBe(true);
  });

  it("reports unsaved changes synchronously before the queued dirty ref update runs", async () => {
    const { io, storeRef } = await createIo();

    storeRef.value.update((draft) => {
      draft.info.name = "Moved immediately";
    });

    expect(io.hasUnsavedChanges()).toBe(true);
    expect(io.savedDirty.value).toBe(false);

    await flushMicrotasks();
    expect(io.savedDirty.value).toBe(true);
  });

  it("does not leak baseline state between separate composable instances", async () => {
    const first = await createIo();
    const second = await createIo();

    first.storeRef.value.update((draft) => {
      draft.info.name = "Changed in first";
    });
    await flushMicrotasks();

    expect(first.io.savedDirty.value).toBe(true);
    expect(second.io.savedDirty.value).toBe(false);
    expect(second.io.serializeToObject().name).toBe("New scenario");
  });

  it("ignores stale legacy drafts without a comparable saved baseline timestamp", async () => {
    const { io, scenario } = await createIo();
    const savedScenario: Scenario = {
      ...scenario,
      meta: {
        createdDate: scenario.meta!.createdDate,
        lastModifiedDate: "",
      },
    };

    (getScenarioDraftMock as any).mockImplementation(async () => ({
      scenarioId: scenario.id,
      scenario: {
        ...scenario,
        name: "Stale draft",
      },
      updatedAt: Date.now(),
    }));

    await expect(io.getNewerDraft(scenario.id, savedScenario)).resolves.toBeNull();
  });

  it("deletes stale drafts that are older than the saved scenario", async () => {
    const { io, scenario } = await createIo();
    const savedScenario: Scenario = {
      ...scenario,
      meta: {
        createdDate: scenario.meta!.createdDate,
        lastModifiedDate: "2025-01-02T00:00:00.000Z",
      },
    };

    (getScenarioDraftMock as any).mockImplementation(async () => ({
      scenarioId: scenario.id,
      scenario: {
        ...scenario,
        name: "Older draft",
      },
      updatedAt: Date.parse("2025-01-01T00:00:00.000Z"),
      savedComparisonKey: (await import("./io")).getScenarioComparisonKey(savedScenario),
    }));

    await expect(io.getNewerDraft(scenario.id, savedScenario)).resolves.toBeNull();
    expect(deleteScenarioDraftMock).toHaveBeenCalledWith(scenario.id);
  });

  async function createIoWithUnlistedFillColor() {
    const { createEmptyScenario, useScenarioIO } = await import("./io");
    const { useNewScenarioStore } = await import("./newScenarioStore");
    const savedScenario = createEmptyScenario({ id: "scenario-1" });
    savedScenario.sides = [
      {
        id: "side-1",
        name: "Blue",
        standardIdentity: "3",
        symbolOptions: { fillColor: "#123456" },
        groups: [],
      },
    ];
    savedScenario.settings!.symbolFillColors = [];

    const storeRef = shallowRef(useNewScenarioStore(savedScenario));
    const io = useScenarioIO(storeRef);
    io.loadFromObject(savedScenario);
    vi.advanceTimersByTime(5000);
    return { io, storeRef, savedScenario };
  }

  /** Edits the scenario, writes a draft and makes it the stored draft. */
  async function editAndWriteDraft(
    { io, storeRef }: Awaited<ReturnType<typeof createIoWithUnlistedFillColor>>,
    name: string,
  ) {
    storeRef.value.update((draft) => {
      draft.info.name = name;
    });
    await flushMicrotasks();
    await io.flushDraft();
    const [scenarioId, scenario, options] = putScenarioDraftMock.mock.lastCall!;
    const draft = { scenarioId, scenario, ...options };
    (getScenarioDraftMock as any).mockImplementation(async () => draft);
    return draft;
  }

  it("offers a draft when the saved scenario uses a fill color missing from the color list", async () => {
    const loaded = await createIoWithUnlistedFillColor();
    const { io, savedScenario } = loaded;

    await editAndWriteDraft(loaded, "Unsaved edit");

    await expect(
      io.getNewerDraft(savedScenario.id, savedScenario),
    ).resolves.toMatchObject({
      scenario: expect.objectContaining({ name: "Unsaved edit" }),
    });
    expect(deleteScenarioDraftMock).not.toHaveBeenCalled();
  });

  it("offers a draft written after restoring an earlier draft", async () => {
    const loaded = await createIoWithUnlistedFillColor();
    const { io, savedScenario } = loaded;
    const firstDraft = await editAndWriteDraft(loaded, "First edit");
    io.loadFromObject(firstDraft.scenario, {
      loadedBaseline: savedScenario,
      savedBaseline: savedScenario,
    });

    await editAndWriteDraft(loaded, "Edit after restore");

    await expect(
      io.getNewerDraft(savedScenario.id, savedScenario),
    ).resolves.toMatchObject({
      scenario: expect.objectContaining({ name: "Edit after restore" }),
    });
    expect(deleteScenarioDraftMock).not.toHaveBeenCalled();
  });

  it("restores drafts tied to the current saved baseline without relying on timestamps", async () => {
    const { io, scenario } = await createIo();
    const { getScenarioComparisonKey } = await import("./io");
    // Stored scenarios are serialized by the editor, like the saved baseline.
    const savedScenario: Scenario = {
      ...io.savedBaseline.value!,
      meta: {
        createdDate: scenario.meta!.createdDate,
        lastModifiedDate: "",
      },
    };

    const draft = {
      scenarioId: scenario.id,
      scenario: {
        ...scenario,
        name: "Recover me",
      },
      updatedAt: Date.now(),
      savedComparisonKey: getScenarioComparisonKey(savedScenario),
    };
    (getScenarioDraftMock as any).mockImplementation(async () => draft);

    await expect(io.getNewerDraft(scenario.id, savedScenario)).resolves.toMatchObject({
      scenarioId: scenario.id,
      scenario: expect.objectContaining({ name: "Recover me" }),
    });
  });
});
