"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTimeFormatStore = exports.useTimeFormatSettingsStore = exports.intlItems = exports.timeFormatItems = void 0;
exports.useTimeFormatterProvider = useTimeFormatterProvider;
var vue_1 = require("vue");
var core_1 = require("@vueuse/core");
var pinia_1 = require("pinia");
var utils_1 = require("@/utils");
var injects_1 = require("@/components/injects");
var utils_2 = require("@/geo/utils");
exports.timeFormatItems = [
    { name: "ISO 8601", value: "iso" },
    { name: "Localized", value: "local" },
    { name: "Military DTG", value: "military" },
];
exports.intlItems = [
    { label: "Full", value: "full" },
    { label: "Long", value: "long" },
    { label: "Medium", value: "medium" },
    { label: "Short", value: "short" },
];
exports.useTimeFormatSettingsStore = (0, pinia_1.defineStore)("timeFormatSettings", {
    state: function () {
        return {
            track: (0, core_1.useLocalStorage)("trackTimeFormat", {
                timeFormat: "local",
                locale: "",
                dateStyle: "short",
                timeStyle: "short",
            }),
            scenario: (0, core_1.useLocalStorage)("scenarioTimeFormat", {
                timeFormat: "local",
                locale: "",
                dateStyle: "medium",
                timeStyle: "short",
            }),
        };
    },
});
exports.useTimeFormatStore = (0, pinia_1.defineStore)("timeFormat", function () {
    var s = (0, exports.useTimeFormatSettingsStore)();
    var timeZone = (0, vue_1.ref)("UTC");
    var trackFormatter = (0, vue_1.computed)(function () {
        return createFormatter(timeZone.value, s.track);
    });
    var scenarioFormatter = (0, vue_1.computed)(function () {
        return createFormatter(timeZone.value, s.scenario);
    });
    var scenarioDateFormatter = (0, vue_1.computed)(function () {
        return createFormatter(timeZone.value, s.scenario, { dateOnly: true });
    });
    return { timeZone: timeZone, trackFormatter: trackFormatter, scenarioFormatter: scenarioFormatter, scenarioDateFormatter: scenarioDateFormatter };
});
function createFormatter(timeZone, settings, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.dateOnly, dateOnly = _c === void 0 ? false : _c;
    if (settings.timeFormat === "iso") {
        if (dateOnly) {
            return {
                format: function (value) { return (0, utils_2.formatDateString)(value, timeZone).split("T")[0]; },
            };
        }
        return {
            format: function (value) { return (0, utils_2.formatDateString)(value, timeZone); },
        };
    }
    if (settings.timeFormat === "military") {
        return {
            format: function (value) { return (0, utils_2.formatDTG)(value, timeZone); },
        };
    }
    if (dateOnly) {
        return new Intl.DateTimeFormat(settings.locale || undefined, {
            timeZone: timeZone,
            dateStyle: settings.dateStyle,
        });
    }
    return new Intl.DateTimeFormat(settings.locale || undefined, {
        timeZone: timeZone,
        dateStyle: settings.dateStyle,
        timeStyle: settings.timeStyle,
    });
}
function useTimeFormatterProvider(options) {
    if (options === void 0) { options = {}; }
    var store = (options.activeScenario || (0, utils_1.injectStrict)(injects_1.activeScenarioKey)).store;
    var s = (0, exports.useTimeFormatStore)();
    (0, vue_1.watchEffect)(function () {
        var tz = store.state.info.timeZone;
        s.timeZone = tz !== null && tz !== void 0 ? tz : "UTC";
    });
}
