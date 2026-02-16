// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  collectOrbatNavTargets,
  findNearestOrbatNavTarget,
  getOrbatNavRoot,
  moveFocusToNearestOrbatNavTarget,
} from "./orbatNav";

function ids(elements: HTMLElement[]) {
  return elements.map((el) => el.id);
}

describe("orbatNav helpers", () => {
  it("finds nearest above/below within a panel root", () => {
    document.body.innerHTML = `
      <div data-orbat-nav="panel-root" id="panel-a">
        <button id="a-1" data-orbat-nav="section-toggle">A1</button>
        <div data-orbat-nav="tree-root">
          <div id="a-t1" role="treeitem" tabindex="-1">AT1</div>
          <div id="a-t2" role="treeitem" tabindex="-1">AT2</div>
        </div>
        <button id="a-2" data-orbat-nav="section-toggle">A2</button>
      </div>
      <div data-orbat-nav="panel-root" id="panel-b">
        <button id="b-1" data-orbat-nav="section-toggle">B1</button>
      </div>
    `;

    const a1 = document.getElementById("a-1") as HTMLElement;
    const at1 = document.getElementById("a-t1") as HTMLElement;
    const at2 = document.getElementById("a-t2") as HTMLElement;
    const a2 = document.getElementById("a-2") as HTMLElement;
    const panelA = document.getElementById("panel-a") as HTMLElement;

    expect(findNearestOrbatNavTarget(a1, "down", panelA)).toBe(at1);
    expect(findNearestOrbatNavTarget(a2, "up", panelA)).toBe(at2);
    expect(findNearestOrbatNavTarget(at1, "up", panelA)).toBe(a1);
    expect(findNearestOrbatNavTarget(at2, "down", panelA)).toBe(a2);
  });

  it("filters hidden and disabled targets", () => {
    document.body.innerHTML = `
      <div data-orbat-nav="panel-root" id="panel">
        <button id="h1" data-orbat-nav="section-toggle">H1</button>
        <button id="h2" data-orbat-nav="section-toggle" disabled>H2</button>
        <button id="h3" data-orbat-nav="section-toggle" style="display:none">H3</button>
        <div data-orbat-nav="tree-root">
          <div id="t1" role="treeitem" tabindex="-1">T1</div>
          <div id="t2" role="treeitem" tabindex="-1" hidden>T2</div>
        </div>
      </div>
    `;
    const panel = document.getElementById("panel") as HTMLElement;
    expect(ids(collectOrbatNavTargets(panel))).toEqual(["h1", "t1"]);
  });

  it("moves focus and scopes to nearest panel root from current element", () => {
    document.body.innerHTML = `
      <div data-orbat-nav="panel-root" id="panel-a">
        <button id="a-1" data-orbat-nav="section-toggle">A1</button>
        <div data-orbat-nav="tree-root">
          <div id="a-t1" role="treeitem" tabindex="-1">AT1</div>
        </div>
      </div>
      <div data-orbat-nav="panel-root" id="panel-b">
        <button id="b-1" data-orbat-nav="section-toggle">B1</button>
      </div>
    `;

    const a1 = document.getElementById("a-1") as HTMLElement;
    const at1 = document.getElementById("a-t1") as HTMLElement;

    expect(getOrbatNavRoot(at1)).toBe(document.getElementById("panel-a"));
    a1.focus();
    const moved = moveFocusToNearestOrbatNavTarget(a1, "down");
    expect(moved).toBe(true);
    expect(document.activeElement).toBe(at1);

    const movedPastEnd = moveFocusToNearestOrbatNavTarget(at1, "down");
    expect(movedPastEnd).toBe(false);
  });
});
