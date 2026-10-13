import { describe, expect, it } from "vitest";
import type { Polygon } from "geojson";
import { distance } from "@turf/turf";
import { observerPin, pinHead } from "./observerPin";

const pinAt = (height: number, exaggeration = 1) =>
  observerPin([10, 50], height, exaggeration);
const partOf = (kind: string, height: number, exaggeration = 1) =>
  pinAt(height, exaggeration).features.find(
    (feature) => feature.properties?.kind === kind,
  )!;

describe("observerPin", () => {
  it("raises a stick from the ground to the observer's eyes", () => {
    const stick = partOf("stick", 30);
    expect(stick.geometry.type).toBe("Polygon");
    expect(stick.properties?.height).toBe(30);
  });

  it("stands the stick on the observer", () => {
    const ring = (partOf("stick", 30).geometry as Polygon).coordinates[0]!;
    const [west, east] = [
      Math.min(...ring.map(([x]) => x!)),
      Math.max(...ring.map(([x]) => x!)),
    ];
    const [south, north] = [
      Math.min(...ring.map(([, y]) => y!)),
      Math.max(...ring.map(([, y]) => y!)),
    ];
    expect(west).toBeLessThan(10);
    expect(east).toBeGreaterThan(10);
    expect(south).toBeLessThan(50);
    expect(north).toBeGreaterThan(50);
  });

  it("keeps the stick slender, but never too thin to see up close", () => {
    const side = (height: number) => {
      const [corner, next] = (partOf("stick", height).geometry as Polygon)
        .coordinates[0]!;
      return distance(corner!, next!, { units: "meters" });
    };
    expect(side(60)).toBeLessThan(2);
    expect(side(60)).toBeGreaterThan(side(30));
    expect(side(0.1)).toBeGreaterThan(0.2);
  });

  it("labels the top of the stick with the observer's height", () => {
    const head = partOf("head", 30);
    expect(head.geometry).toEqual({ type: "Point", coordinates: [10, 50] });
    expect(head.properties).toMatchObject({ text: "30 m", lift: 30 });
  });

  it("stretches with the terrain, so the eyes stay level with exaggerated relief", () => {
    expect(partOf("stick", 30, 2).properties?.height).toBe(60);
    expect(partOf("head", 30, 2).properties).toMatchObject({ text: "30 m", lift: 60 });
  });

  it("names the observer before its height when given a label", () => {
    const head = observerPin([10, 50], 30, 1, { label: "2" }).features.find(
      (feature) => feature.properties?.kind === "head",
    )!;
    expect(head.properties?.text).toBe("2 · 30 m");
  });

  it("reads a fractional height to a tenth of a metre", () => {
    expect(partOf("head", 1.75).properties?.text).toBe("1.8 m");
  });
});

describe("pinHead", () => {
  const pixel = ({ width, data }: ReturnType<typeof pinHead>, x: number, y: number) =>
    Array.from(data.subarray((y * width + x) * 4, (y * width + x) * 4 + 4));

  it("is a square ball drawn for the screen's pixel ratio", () => {
    const head = pinHead(2);
    expect(head.width).toBe(head.height);
    expect(head.width).toBe(pinHead(1).width * 2);
    expect(head.data).toHaveLength(head.width * head.height * 4);
  });

  it("is round: solid at the middle, clear at the corners", () => {
    const head = pinHead(2);
    const middle = Math.floor(head.width / 2);
    expect(pixel(head, middle, middle)[3]).toBe(255);
    expect(pixel(head, 0, 0)[3]).toBe(0);
    expect(pixel(head, head.width - 1, head.height - 1)[3]).toBe(0);
  });

  it("is green inside a white rim, like the observer on the ground", () => {
    const head = pinHead(2);
    const middle = Math.floor(head.width / 2);
    const [red, green, blue] = pixel(head, middle, middle);
    expect(green).toBeGreaterThan(red!);
    expect(green).toBeGreaterThan(blue!);
    expect(pixel(head, middle, 1).slice(0, 3)).toEqual([255, 255, 255]);
  });

  it("catches the light on its upper left, so it reads as a ball", () => {
    const head = pinHead(2);
    const brightness = (x: number, y: number) =>
      pixel(head, x, y)
        .slice(0, 3)
        .reduce((sum, value) => sum + value, 0);
    const quarter = Math.floor(head.width / 3);
    expect(brightness(quarter, quarter)).toBeGreaterThan(
      brightness(head.width - quarter, head.width - quarter),
    );
  });
});
