"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var scenarioShare_1 = require("./scenarioShare");
(0, vitest_1.describe)("useShareHistory", function () {
    (0, vitest_1.beforeEach)(function () {
        localStorage.clear();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)("starts with empty history", function () {
        var history = (0, scenarioShare_1.useShareHistory)().history;
        (0, vitest_1.expect)(history.value).toEqual([]);
    });
    (0, vitest_1.it)("adds items to history", function () {
        var _a = (0, scenarioShare_1.useShareHistory)(), history = _a.history, addToHistory = _a.addToHistory;
        var item = {
            id: "1",
            name: "Scenario 1",
            url: "https://example.com/1",
            encrypted: true,
        };
        addToHistory(item);
        (0, vitest_1.expect)(history.value).toHaveLength(1);
        (0, vitest_1.expect)(history.value[0]).toMatchObject(item);
        (0, vitest_1.expect)(history.value[0].timestamp).toBeDefined();
        (0, vitest_1.expect)(history.value[0].encrypted).toBe(true);
    });
    (0, vitest_1.it)("updates existing items in history and moves them to the top", function () {
        var _a = (0, scenarioShare_1.useShareHistory)(), history = _a.history, addToHistory = _a.addToHistory;
        addToHistory({ id: "1", name: "Scenario 1", url: "https://example.com/1" });
        addToHistory({ id: "2", name: "Scenario 2", url: "https://example.com/2" });
        (0, vitest_1.expect)(history.value[1].id).toBe("1");
        addToHistory({
            id: "1",
            name: "Scenario 1 Updated",
            url: "https://example.com/1-updated",
        });
        (0, vitest_1.expect)(history.value).toHaveLength(2);
        (0, vitest_1.expect)(history.value[0].id).toBe("1");
        (0, vitest_1.expect)(history.value[0].name).toBe("Scenario 1 Updated");
    });
    (0, vitest_1.it)("limits history to 10 items", function () {
        var _a = (0, scenarioShare_1.useShareHistory)(), history = _a.history, addToHistory = _a.addToHistory;
        for (var i = 1; i <= 11; i++) {
            addToHistory({
                id: "".concat(i),
                name: "Scenario ".concat(i),
                url: "https://example.com/".concat(i),
            });
        }
        (0, vitest_1.expect)(history.value).toHaveLength(10);
        (0, vitest_1.expect)(history.value[0].id).toBe("11");
        (0, vitest_1.expect)(history.value[9].id).toBe("2");
    });
    (0, vitest_1.it)("clears history", function () {
        var _a = (0, scenarioShare_1.useShareHistory)(), history = _a.history, addToHistory = _a.addToHistory, clearHistory = _a.clearHistory;
        addToHistory({ id: "1", name: "Scenario 1", url: "https://example.com/1" });
        clearHistory();
        (0, vitest_1.expect)(history.value).toEqual([]);
    });
});
