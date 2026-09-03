import { beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, shallowRef } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { useReferenceGridStore } from "@/stores/referenceGridStore";
import { useReferenceGridLayers } from "./useReferenceGridLayers";

const runtime = vi.hoisted(() => ({
  create: vi.fn(),
}));

vi.mock("./referenceGridLayersRuntime", () => ({
  createReferenceGridLayers: runtime.create,
}));

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
  runtime.create.mockReset().mockReturnValue({
    labels: shallowRef([]),
    refresh: vi.fn(),
    dispose: vi.fn(),
  });
});

describe("useReferenceGridLayers", () => {
  it("loads its implementation only after the grid becomes visible", async () => {
    const scope = effectScope();
    const layers = scope.run(() =>
      useReferenceGridLayers(
        () => undefined,
        () => undefined,
      ),
    );
    expect(layers).toBeDefined();

    await vi.dynamicImportSettled();
    expect(runtime.create).not.toHaveBeenCalled();

    useReferenceGridStore().visible = true;
    await vi.dynamicImportSettled();
    expect(runtime.create).toHaveBeenCalledOnce();

    layers!.dispose();
    scope.stop();
  });
});
