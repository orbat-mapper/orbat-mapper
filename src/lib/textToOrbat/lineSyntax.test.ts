import { describe, expect, it } from "vitest";
import { analyzeLine, readUnitLine } from "./lineSyntax";

describe("readUnitLine", () => {
  it("separates the name from metadata and comments", () => {
    expect(readUnitLine("1st [tank] Battalion // armored | ignored # note")).toEqual({
      displayName: "1st Battalion",
      metadataName: "tank armored | ignored",
    });
  });

  it("reads paired pipes as metadata", () => {
    expect(readUnitLine("Alpha |mech inf| Company")).toEqual({
      displayName: "Alpha Company",
      metadataName: "mech inf",
    });
  });
});

describe("analyzeLine", () => {
  it("returns metadata ranges in order and the comment last", () => {
    const line = "Alpha [bde] |mech| # note";
    expect(analyzeLine(line)).toEqual([
      { kind: "metadata", from: 6, to: 11 },
      { kind: "metadata", from: 12, to: 18 },
      { kind: "comment", from: 19, to: line.length },
    ]);
  });

  it("covers everything after // or a single pipe", () => {
    expect(analyzeLine("1st // tank bn")).toEqual([
      { kind: "metadata", from: 4, to: 14 },
    ]);
    expect(analyzeLine("1st | tank bn")).toEqual([{ kind: "metadata", from: 4, to: 13 }]);
  });

  it("marks the same metadata the parser reads", () => {
    // `//` inside brackets is not a separator; a pipe before `//` still is
    expect(readUnitLine("Alpha [a//b]")).toEqual({
      displayName: "Alpha",
      metadataName: "a//b",
    });
    expect(analyzeLine("Alpha [a//b]")).toEqual([{ kind: "metadata", from: 6, to: 12 }]);
    expect(readUnitLine("a | b // c")).toEqual({ displayName: "a", metadataName: "c b" });
    expect(analyzeLine("a | b // c")).toEqual([
      { kind: "metadata", from: 2, to: 6 },
      { kind: "metadata", from: 6, to: 10 },
    ]);
  });

  it("ignores markup inside comments", () => {
    expect(analyzeLine("# [not metadata]")).toEqual([
      { kind: "comment", from: 0, to: 16 },
    ]);
  });
});
