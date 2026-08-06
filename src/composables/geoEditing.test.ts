// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import Draw, { DrawEvent } from "ol/interaction/Draw";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import type OLMap from "ol/Map";

import { useEditingInteraction } from "@/composables/geoEditing";

function createHarness() {
  const interactions: unknown[] = [];
  const map = {
    addInteraction: vi.fn((interaction: unknown) => interactions.push(interaction)),
    removeInteraction: vi.fn(),
    getAllLayers: vi.fn(() => []),
  } as unknown as OLMap;
  const layer = new VectorLayer({ source: new VectorSource() });
  const addMultiple = ref(true);
  let draw!: ReturnType<typeof useEditingInteraction>;
  const wrapper = mount(
    defineComponent({
      setup() {
        draw = useEditingInteraction(map, layer, { addMultiple });
        return {};
      },
      template: "<div />",
    }),
  );
  return { wrapper, draw, interactions };
}

describe("useEditingInteraction draw completion", () => {
  it("reports OpenLayers path progress and makes explicit Done exit", () => {
    const { wrapper, draw, interactions } = createHarness();
    draw.startDrawing("LineString");

    const lineDraw = interactions.find(
      (interaction) => interaction instanceof Draw,
    ) as Draw;
    const sketch = new Feature(
      // The last coordinate is OpenLayers' live pointer coordinate, not a committed
      // vertex. Two authored vertices therefore appear as three sketch coordinates.
      new LineString([
        [0, 0],
        [1, 1],
        [2, 2],
      ]),
    );
    lineDraw.dispatchEvent(new DrawEvent("drawstart", sketch));

    expect(draw.drawPointCount.value).toBe(2);
    const finish = vi.spyOn(lineDraw, "finishDrawing").mockReturnValue(sketch);
    expect(draw.finishDrawing()).toBe(true);
    expect(finish).toHaveBeenCalledOnce();
    expect(draw.isDrawing.value).toBe(false);
    wrapper.unmount();
  });

  it("leaves an incomplete OpenLayers path armed", () => {
    const { wrapper, draw, interactions } = createHarness();
    draw.startDrawing("LineString");

    const lineDraw = interactions.find(
      (interaction) => interaction instanceof Draw,
    ) as Draw;
    const sketch = new Feature(
      new LineString([
        [0, 0],
        [1, 1],
      ]),
    );
    lineDraw.dispatchEvent(new DrawEvent("drawstart", sketch));

    const finish = vi.spyOn(lineDraw, "finishDrawing");
    expect(draw.drawPointCount.value).toBe(1);
    expect(draw.finishDrawing()).toBe(false);
    expect(finish).not.toHaveBeenCalled();
    expect(draw.isDrawing.value).toBe(true);
    wrapper.unmount();
  });
});
