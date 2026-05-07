import { describe, expect, it } from "vitest";
import {
  applyAnnotationStatePatch,
  type ArrowAnnotation,
  type ArrowAnnotationState,
  type TextAnnotation,
  type TextAnnotationState,
} from "@/types/scenarioLayerItems";

const textAnnotation: TextAnnotation = {
  id: "annotation-text-1",
  kind: "annotation",
  annotationKind: "text",
  textType: "label",
  anchorZoom: 7,
  anchor: { type: "point", position: [10, 60] },
  content: { text: "Alpha" },
  style: { textSize: 16 },
};

const arrowAnnotation: ArrowAnnotation = {
  id: "annotation-arrow-1",
  kind: "annotation",
  annotationKind: "arrow",
  anchorZoom: 7,
  geometry: {
    type: "LineString",
    coordinates: [
      [10, 60],
      [11, 61],
    ],
  },
  style: { "stroke-width": 3, "arrow-end": "arrow" },
};

describe("applyAnnotationStatePatch", () => {
  it("applies text annotation state patches to text annotations", () => {
    const state: TextAnnotationState = {
      id: "state-1",
      t: 100,
      annotationKind: "text",
      patch: {
        content: { text: "Bravo" },
        anchorZoom: 9,
      },
    };

    expect(applyAnnotationStatePatch(textAnnotation, state)).toMatchObject({
      content: { text: "Bravo" },
      anchorZoom: 9,
    });
  });

  it("applies arrow annotation state patches to arrow annotations", () => {
    const state: ArrowAnnotationState = {
      id: "state-2",
      t: 100,
      annotationKind: "arrow",
      patch: {
        geometry: {
          type: "LineString",
          coordinates: [
            [10, 60],
            [12, 62],
          ],
        },
      },
    };

    expect(applyAnnotationStatePatch(arrowAnnotation, state)).toMatchObject({
      geometry: {
        type: "LineString",
        coordinates: [
          [10, 60],
          [12, 62],
        ],
      },
    });
  });

  it("rejects mismatched annotation state kinds at runtime", () => {
    const state: ArrowAnnotationState = {
      id: "state-3",
      t: 100,
      annotationKind: "arrow",
      patch: {
        geometry: arrowAnnotation.geometry,
      },
    };

    expect(() =>
      applyAnnotationStatePatch(textAnnotation, state as unknown as TextAnnotationState),
    ).toThrow(/does not match/);
  });
});
