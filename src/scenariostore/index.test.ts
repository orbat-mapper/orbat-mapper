import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import "@/dayjs";

vi.mock("@/composables/notifications", () => ({
  useNotifications: () => ({ send: vi.fn() }),
}));

function flushMicrotasks() {
  return Promise.resolve().then(() => Promise.resolve());
}

describe("useScenario", () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
  });

  it("keeps a stable io session across store replacement during load", async () => {
    const { useScenario } = await import("./index");
    const { createEmptyScenario } = await import("./io");

    const { scenario } = useScenario();
    const io = scenario.value.io;
    const loaded = createEmptyScenario({ id: "scenario-1" });

    io.loadFromObject(loaded);

    expect(scenario.value.io).toBe(io);
    expect(io.savedBaseline.value).toMatchObject({ id: "scenario-1" });

    scenario.value.store.update((draft) => {
      draft.info.name = "Changed after load";
    });
    await flushMicrotasks();

    expect(io.hasUnsavedChanges()).toBe(true);
    expect(io.savedDirty.value).toBe(true);
  });
});
