import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearCache,
  guessImportFormat,
  imageCache,
  releaseImageCache,
  retainImageCache,
} from "./fileHandling";

function createMockFile(content: string, name: string, options?: FilePropertyBag) {
  const file = new File([content], name, options);
  // Mock text() method which might be missing in jsdom/node environment
  Object.defineProperty(file, "text", {
    value: () => Promise.resolve(content),
    writable: true,
  });
  return file;
}

describe("guessImportFormat", () => {
  it("detects TSV files by extension", async () => {
    const file = createMockFile("Type\tName\nUnit\tAlpha", "test.tsv", {
      type: "text/plain",
    });
    const result = await guessImportFormat(file);
    expect(result.format).toBe("tsv");
    expect(result.dataAsString).toBe("Type\tName\nUnit\tAlpha");
  });

  it("detects TSV files by mime type", async () => {
    const file = createMockFile("Type\tName\nUnit\tAlpha", "test.txt", {
      type: "text/tab-separated-values",
    });
    const result = await guessImportFormat(file);
    expect(result.format).toBe("tsv");
  });

  it("detects TSV content in .txt files", async () => {
    const file = createMockFile("Type\tName\nUnit\tAlpha", "test.txt", {
      type: "text/plain",
    });
    const result = await guessImportFormat(file);
    expect(result.format).toBe("tsv");
  });

  it("detects CSV content in .txt files", async () => {
    const file = createMockFile("Type,Name\nUnit,Alpha", "test.txt", {
      type: "text/plain",
    });
    const result = await guessImportFormat(file);
    expect(result.format).toBe("csv");
  });

  it("detects CSV files", async () => {
    const file = createMockFile("Type,Name\nUnit,Alpha", "test.csv", {
      type: "text/csv",
    });
    const result = await guessImportFormat(file);
    expect(result.format).toBe("csv");
    expect(result.dataAsString).toBe("Type,Name\nUnit,Alpha");
  });

  it("prioritizes JSON over CSV/TSV", async () => {
    const jsonContent = '{"name": "test", "value": 123}';
    const file = createMockFile(jsonContent, "test.json", {
      type: "application/json",
    });
    const result = await guessImportFormat(file);
    expect(result.isJson).toBe(true);
    expect(result.format).not.toBe("csv");
    expect(result.format).not.toBe("tsv");
  });
});

describe("KMZ image cache cleanup", () => {
  afterEach(() => {
    clearCache();
    vi.restoreAllMocks();
  });

  it("ignores releases that do not have a matching retain", () => {
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);

    imageCache.set("icon.png", "blob:icon");

    releaseImageCache();

    expect(imageCache.size).toBe(1);
    expect(revokeObjectURL).not.toHaveBeenCalled();
  });

  it("clears cached image URLs after the last active layer finishes using them", () => {
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);

    imageCache.set("icon-1.png", "blob:icon-1");
    imageCache.set("icon-2.png", "blob:icon-2");

    retainImageCache();
    retainImageCache();

    releaseImageCache();
    expect(imageCache.size).toBe(2);
    expect(revokeObjectURL).not.toHaveBeenCalled();

    releaseImageCache();
    expect(imageCache.size).toBe(0);
    expect(revokeObjectURL).toHaveBeenCalledTimes(2);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:icon-1");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:icon-2");
  });
});
