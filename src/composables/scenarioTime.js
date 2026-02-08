"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDateElements = useDateElements;
exports.useYMDElements = useYMDElements;
var vue_1 = require("vue");
var dayjs_1 = require("dayjs");
var militaryTimeZones_1 = require("@/utils/militaryTimeZones");
function useDateElements(_a) {
    var timestamp = _a.timestamp, isLocal = _a.isLocal, _b = _a.timeZone, timeZone = _b === void 0 ? "UTC" : _b;
    var date = (0, vue_1.ref)("");
    var hour = (0, vue_1.ref)(12);
    var minute = (0, vue_1.ref)(0);
    var inputDateTime = (0, vue_1.computed)(function () {
        return (0, vue_1.unref)(isLocal)
            ? dayjs_1.default.utc((0, vue_1.unref)(timestamp)).tz((0, militaryTimeZones_1.resolveTimeZone)((0, vue_1.unref)(timeZone)))
            : dayjs_1.default.utc((0, vue_1.unref)(timestamp));
    });
    (0, vue_1.watch)(inputDateTime, function (v) {
        date.value = v.format().split("T")[0];
        hour.value = v.hour();
        minute.value = v.minute();
    }, { immediate: true });
    var resDateTime = (0, vue_1.computed)(function () {
        try {
            if ((0, vue_1.unref)(isLocal))
                return dayjs_1.default.tz("".concat(date.value, " ").concat(hour.value, ":").concat(minute.value), (0, militaryTimeZones_1.resolveTimeZone)((0, vue_1.unref)(timeZone)));
            return dayjs_1.default.utc("".concat(date.value, " ").concat(hour.value, ":").concat(minute.value));
        }
        catch (e) {
            return (0, dayjs_1.default)(0);
        }
    });
    return { date: date, hour: hour, minute: minute, resDateTime: resDateTime };
}
function useYMDElements(_a) {
    var timestamp = _a.timestamp, isLocal = _a.isLocal, _b = _a.timeZone, timeZone = _b === void 0 ? "UTC" : _b;
    var year = (0, vue_1.ref)(2000);
    var month = (0, vue_1.ref)(1);
    var day = (0, vue_1.ref)(1);
    var hour = (0, vue_1.ref)(12);
    var minute = (0, vue_1.ref)(0);
    var inputDateTime = (0, vue_1.computed)(function () {
        return (0, vue_1.unref)(isLocal)
            ? dayjs_1.default.utc((0, vue_1.unref)(timestamp)).tz((0, militaryTimeZones_1.resolveTimeZone)((0, vue_1.unref)(timeZone)))
            : dayjs_1.default.utc((0, vue_1.unref)(timestamp));
    });
    (0, vue_1.watch)(inputDateTime, function (v) {
        year.value = v.year();
        month.value = v.month();
        day.value = v.date();
        hour.value = v.hour();
        minute.value = v.minute();
    }, { immediate: true });
    var resDateTime = (0, vue_1.computed)(function () {
        try {
            if ((0, vue_1.unref)(isLocal))
                return dayjs_1.default.tz("".concat(year.value, "-").concat(month.value, "-").concat(day.value, " ").concat(hour.value, ":").concat(minute.value), (0, militaryTimeZones_1.resolveTimeZone)((0, vue_1.unref)(timeZone)));
            return dayjs_1.default.utc("".concat(year.value, "-").concat(month.value, "-").concat(day.value));
        }
        catch (e) {
            return (0, dayjs_1.default)(0);
        }
    });
    return { year: year, month: month, day: day, hour: hour, minute: minute, resDateTime: resDateTime };
}
