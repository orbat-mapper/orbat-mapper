import { describe, expect, it } from "vitest";
import { formatChangeDetails } from "./timelineChangeFormat";
import type { TimelineChange } from "./timelineChanges";

describe("formatChangeDetails", () => {
  it("names a status by its id in the scenario's status list", () => {
    const change: TimelineChange = {
      id: "u1:s1",
      t: 0,
      entityType: "unit",
      entityId: "u1",
      stateId: "s1",
      kinds: ["status"],
      status: "st1",
      positions: [],
    };
    const details = formatChangeDetails(change, {
      unitName: (id) => id,
      statusName: (id) => (id === "st1" ? "Destroyed" : id),
      formatTime: String,
    });
    expect(details).toEqual(["status Destroyed"]);
  });

  it("names the parents a unit moves from and to", () => {
    const change: TimelineChange = {
      id: "u1:s1",
      t: 0,
      entityType: "unit",
      entityId: "u1",
      stateId: "s1",
      kinds: ["hierarchy"],
      hierarchyFromId: "a",
      hierarchyParentId: "b",
      positions: [],
    };
    const options = {
      unitName: (id: string) => id.toUpperCase(),
      statusName: String,
      formatTime: String,
    };
    expect(formatChangeDetails(change, options)).toEqual(["A → B"]);
    // A move within the same parent, or from an unknown one, names only the parent.
    expect(formatChangeDetails({ ...change, hierarchyFromId: "b" }, options)).toEqual([
      "→ B",
    ]);
    expect(
      formatChangeDetails({ ...change, hierarchyFromId: undefined }, options),
    ).toEqual(["→ B"]);
  });
});
