import { describe, expect, it } from "vitest";
import { describeImportChange } from "./scenarioImportSummary";
import type { ImportChange } from "./scenarioImportPlan";
const names = (id: string) =>
  ({ hq: "HQ", infantry: "Infantry", child: "Platoon" })[id] ?? id;
function summary(
  before: object,
  after: object,
  effect: ImportChange["effect"] = "changed",
) {
  return describeImportChange(
    { id: "u", name: "Unit", kind: "unit", effect, before, after },
    names,
  );
}
describe("readable import changes", () => {
  it("uses names for hierarchy moves and describes location additions", () => {
    expect(summary({ parent: "hq" }, { parent: "infantry", location: [1, 2] })).toEqual([
      "Moved from HQ to Infantry.",
      "Location added.",
    ]);
  });
  it("counts appended history while accepting equivalent timestamp formats and generated IDs", () => {
    expect(
      summary(
        { state: [{ id: "old", t: 1000, location: [0, 0] }] },
        {
          state: [
            { id: "generated", t: "1970-01-01T00:00:01Z", location: [0, 0] },
            { id: "new", t: 2000 },
          ],
        },
      ),
    ).toEqual(["History: 1 entry added."]);
  });
  it("distinguishes changed, added and removed history entries", () => {
    expect(
      summary(
        {
          state: [
            { id: "a", t: 1000, location: [1, 1] },
            { id: "b", t: 2000 },
          ],
        },
        {
          state: [
            { id: "a", t: 1000, location: [2, 2] },
            { id: "c", t: 3000 },
          ],
        },
      ),
    ).toEqual(["History: 1 entry added, 1 entry updated, 1 entry removed."]);
    expect(
      summary(
        {
          state: [
            { id: "a", t: 1000 },
            { id: "b", t: 2000 },
          ],
        },
        { state: [] },
      ),
    ).toEqual(["History: 2 entries removed."]);
  });
  it("describes incoming unit details without showing raw symbol codes", () => {
    expect(
      summary(
        {},
        {
          id: "u",
          name: "Unit",
          sidc: "10031000001211000000",
          parent: "hq",
          location: [1, 2],
          state: [{ id: "s", t: 1000 }],
        },
        "added",
      ),
    ).toEqual([
      "New unit will be added.",
      "Symbol set.",
      "Added under HQ.",
      "Location added.",
      "History: 1 entry added.",
    ]);
  });
  it("describes reordered children and cleared fields", () => {
    expect(
      summary(
        { subUnits: ["hq", "child"], description: "old" },
        { subUnits: ["child", "hq"] },
      ),
    ).toEqual(["Child units reordered.", "Description cleared."]);
    expect(summary({ subUnits: [] }, { subUnits: ["child"] })).toEqual([
      "Child units added: Platoon.",
    ]);
  });
  it("does not hide ID changes inside authored fields", () => {
    expect(summary({ properties: { id: "old" } }, { properties: { id: "new" } })).toEqual(
      ["Properties changed."],
    );
  });
  it("keeps removals and unchanged items unambiguous", () => {
    expect(summary({}, {}, "removed")).toEqual([
      "This unit and its data will be removed.",
    ]);
    expect(summary({}, {}, "preserved")).toEqual([
      "Not included in this update; kept as it is.",
    ]);
    expect(summary({}, {}, "unchanged")).toEqual(["Already matches; no changes needed."]);
  });
});
