// @vitest-environment jsdom
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import ImportLoadStep from "@/components/ImportLoadStep.vue";
import { useImportStore } from "@/stores/importExportStore";

vi.mock("@/composables/notifications", () => ({
  useNotifications: () => ({ send: vi.fn() }),
}));

const scenarioText = JSON.stringify({
  id: "pasted-scenario",
  type: "ORBAT-mapper",
  version: "2.7.0",
  name: "Pasted scenario",
  sides: [],
  events: [],
  layers: [],
});

function mountStep() {
  const store = useImportStore();
  store.inputSource = "string";
  return mount(ImportLoadStep, {
    global: { stubs: { ImportLoadStepBrowser: true } },
  });
}

function loadButton(wrapper: ReturnType<typeof mountStep>) {
  const button = wrapper.findAll("button").find((b) => b.text() === "Load");
  if (!button) throw new Error("Load button not found");
  return button;
}

enableAutoUnmount(afterEach);

describe("ImportLoadStep with pasted text", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("enables Load only while the Raw text box has text", async () => {
    const wrapper = mountStep();
    expect(loadButton(wrapper).attributes("disabled")).toBeDefined();

    await wrapper.find("textarea#rawText").setValue(scenarioText);
    expect(loadButton(wrapper).attributes("disabled")).toBeUndefined();

    await wrapper.find("textarea#rawText").setValue("");
    expect(loadButton(wrapper).attributes("disabled")).toBeDefined();
  });

  it("loads a pasted ORBAT Mapper scenario as an ORBAT Mapper import", async () => {
    const wrapper = mountStep();

    await wrapper.find("textarea#rawText").setValue(scenarioText);
    await flushPromises();
    await loadButton(wrapper).trigger("click");
    await flushPromises();

    const loaded = wrapper.emitted("loaded");
    expect(loaded).toHaveLength(1);
    const [format, data] = loaded![0] as [string, { name: string }];
    expect(format).toBe("orbatmapper");
    expect(data.name).toBe("Pasted scenario");
  });

  it("loads pasted KML as a KML import", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:pasted-kml");
    const wrapper = mountStep();

    await wrapper
      .find("textarea#rawText")
      .setValue('<kml xmlns="http://www.opengis.net/kml/2.2"><Document /></kml>');
    await loadButton(wrapper).trigger("click");
    await flushPromises();

    const lod = wrapper.emitted("lod");
    expect(lod).toHaveLength(1);
    expect(lod![0][0]).toMatchObject({ format: "kml", data: ["blob:pasted-kml"] });
  });
});
