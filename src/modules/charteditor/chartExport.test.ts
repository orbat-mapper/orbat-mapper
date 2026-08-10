import { afterEach, describe, expect, it, vi } from "vitest";
import { prepareOrbatChartExport } from "./chartExport";

const SVG_NS = "http://www.w3.org/2000/svg";

function textOf(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

function createChartSvg(viewBox = "0 0 200 100") {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("id", "live-chart");
  svg.setAttribute("class", "orbat-chart");
  svg.setAttribute("style", "transform: scale(2)");
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.innerHTML = `
    <style>
      .o-label { text-anchor: middle; }
      .o-unit:hover { fill: red; }
      .highlight { fill: transparent; }
      .highlight:hover { stroke: gray; }
    </style>
    <rect class="o-page-boundary" width="200" height="100" />
    <g class="o-wrapper" transform="translate(5 6) scale(0.5)">
      <g id="o-highlight-layer"><rect class="highlight" /></g>
      <circle class="dbg-point" />
      <g class="o-chart">
        <g class="o-unit"><text class="o-label">Alpha &amp; Bravo</text></g>
        <rect class="dbg-rect" />
      </g>
    </g>`;
  const chart = svg.querySelector<SVGGElement>(".o-chart")!;
  Object.defineProperty(chart, "getBBox", {
    configurable: true,
    value: () => ({ x: 10, y: 20, width: 100, height: 50 }),
  });
  return svg;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("prepareOrbatChartExport", () => {
  it("creates a portable page-sized SVG without mutating the live chart", async () => {
    const source = createChartSvg();
    const sourceBefore = source.outerHTML;

    const prepared = prepareOrbatChartExport(source, {
      format: "svg",
      bounds: "page",
      backgroundColor: "#ffffff",
      pageSize: "A4",
      title: "1st Battalion ORBAT",
      description: "Exported from Exercise Example",
    });
    const text = await textOf(await prepared.render());

    expect(prepared).toMatchObject({ width: 200, height: 100, estimatedMemoryBytes: 0 });
    expect(text).toContain('width="210mm"');
    expect(text).toContain('height="297mm"');
    expect(text).toContain(">1st Battalion ORBAT</title>");
    expect(text).toContain(">Exported from Exercise Example</desc>");
    expect(text).toContain(
      'aria-labelledby="orbat-export-title orbat-export-description"',
    );
    expect(text).toContain('color="#000000"');
    expect(text).toContain('data-export-background=""');
    expect(text).toContain(".o-label");
    expect(text).not.toContain(".o-unit:hover");
    expect(text).not.toContain("o-highlight-layer");
    expect(text).not.toContain("o-page-boundary");
    expect(text).not.toContain("dbg-rect");
    expect(text).not.toContain("dbg-point");
    expect(text).not.toContain("live-chart");
    expect(source.outerHTML).toBe(sourceBefore);
  });

  it("crops to transformed chart content and applies padding", async () => {
    const prepared = prepareOrbatChartExport(createChartSvg(), {
      format: "svg",
      bounds: "content",
      padding: 5,
      backgroundColor: null,
    });
    const text = await textOf(await prepared.render());

    expect(prepared).toMatchObject({ width: 60, height: 35 });
    expect(text).toContain('viewBox="5 11 60 35"');
    expect(text).not.toContain("data-export-background");
  });

  it("reports scaled PNG dimensions and working memory before rendering", () => {
    const prepared = prepareOrbatChartExport(createChartSvg(), {
      format: "png",
      bounds: "page",
      scale: 3,
    });

    expect(prepared).toMatchObject({
      width: 600,
      height: 300,
      estimatedMemoryBytes: 1_440_000,
    });
  });

  it("limits oversized raster exports without rejecting vector output", () => {
    const source = createChartSvg("0 0 12000 12000");

    expect(() =>
      prepareOrbatChartExport(source, {
        format: "png",
        bounds: "page",
        scale: 1,
      }),
    ).toThrow("too large");
    expect(() =>
      prepareOrbatChartExport(source, {
        format: "svg",
        bounds: "page",
      }),
    ).not.toThrow();
  });

  it("revokes the temporary object URL when PNG rendering fails", async () => {
    const createObjectURL = vi.fn(() => "blob:chart");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    class FailingImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }
    vi.stubGlobal("Image", FailingImage);
    const prepared = prepareOrbatChartExport(createChartSvg(), {
      format: "png",
      bounds: "page",
    });

    await expect(prepared.render()).rejects.toThrow("could not render");
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:chart");
  });
});
