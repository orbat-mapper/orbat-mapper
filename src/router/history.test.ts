import { afterEach, describe, expect, it, vi } from "vitest";
import { createWebHashHistory, createWebHistory } from "vue-router";
import { createAppHistory } from "@/router/history";

vi.mock("vue-router", () => ({
  createWebHistory: vi.fn(() => ({ mode: "web" })),
  createWebHashHistory: vi.fn(() => ({ mode: "hash" })),
}));

function stubProtocol(protocol: string) {
  vi.stubGlobal("location", { ...globalThis.location, protocol });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("createAppHistory", () => {
  it("uses hash history when the app is opened as a standalone file", () => {
    stubProtocol("file:");

    expect(createAppHistory()).toEqual({ mode: "hash" });
    expect(createWebHashHistory).toHaveBeenCalled();
    expect(createWebHistory).not.toHaveBeenCalled();
  });

  it("uses web history when the app is served", () => {
    stubProtocol("https:");

    expect(createAppHistory()).toEqual({ mode: "web" });
    expect(createWebHistory).toHaveBeenCalled();
    expect(createWebHashHistory).not.toHaveBeenCalled();
  });
});
