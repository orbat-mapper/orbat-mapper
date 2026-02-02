import { describe, it, expect, beforeEach, vi } from "vitest";
import { useShareHistory } from "./scenarioShare";
import { SHARE_HISTORY_LOCALSTORAGE_KEY } from "@/config/constants";

describe("useShareHistory", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("starts with empty history", () => {
    const { history } = useShareHistory();
    expect(history.value).toEqual([]);
  });

  it("adds items to history", () => {
    const { history, addToHistory } = useShareHistory();
    const item = {
      id: "1",
      name: "Scenario 1",
      url: "https://example.com/1",
      encrypted: true,
    };
    addToHistory(item);
    expect(history.value).toHaveLength(1);
    expect(history.value[0]).toMatchObject(item);
    expect(history.value[0].timestamp).toBeDefined();
    expect(history.value[0].encrypted).toBe(true);
  });

  it("updates existing items in history and moves them to the top", () => {
    const { history, addToHistory } = useShareHistory();
    addToHistory({ id: "1", name: "Scenario 1", url: "https://example.com/1" });
    addToHistory({ id: "2", name: "Scenario 2", url: "https://example.com/2" });

    expect(history.value[1].id).toBe("1");

    addToHistory({
      id: "1",
      name: "Scenario 1 Updated",
      url: "https://example.com/1-updated",
    });

    expect(history.value).toHaveLength(2);
    expect(history.value[0].id).toBe("1");
    expect(history.value[0].name).toBe("Scenario 1 Updated");
  });

  it("limits history to 10 items", () => {
    const { history, addToHistory } = useShareHistory();
    for (let i = 1; i <= 11; i++) {
      addToHistory({
        id: `${i}`,
        name: `Scenario ${i}`,
        url: `https://example.com/${i}`,
      });
    }
    expect(history.value).toHaveLength(10);
    expect(history.value[0].id).toBe("11");
    expect(history.value[9].id).toBe("2");
  });

  it("clears history", () => {
    const { history, addToHistory, clearHistory } = useShareHistory();
    addToHistory({ id: "1", name: "Scenario 1", url: "https://example.com/1" });
    clearHistory();
    expect(history.value).toEqual([]);
  });
});
