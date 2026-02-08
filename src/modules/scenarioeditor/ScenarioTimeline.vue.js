"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var vue_mdi_1 = require("@iconify-prerendered/vue-mdi");
var vue_1 = require("vue");
var core_1 = require("@vueuse/core");
var d3_time_1 = require("d3-time");
var d3_time_format_1 = require("d3-time-format");
var d3_scale_chromatic_1 = require("d3-scale-chromatic");
var d3_scale_1 = require("d3-scale");
var scenarioUtils_1 = require("@/composables/scenarioUtils");
var timeFormatStore_1 = require("@/stores/timeFormatStore");
var TimelineContextMenu_vue_1 = require("@/components/TimelineContextMenu.vue");
var selectedStore_1 = require("@/stores/selectedStore");
var MS_PER_HOUR = 3600 * 1000;
var MS_PER_DAY = 24 * MS_PER_HOUR;
var _a = (0, scenarioUtils_1.useActiveScenario)(), _b = _a.time, scenarioTime = _b.scenarioTime, setCurrentTime = _b.setCurrentTime, timeZone = _b.timeZone, computeTimeHistogram = _b.computeTimeHistogram, goToScenarioEvent = _b.goToScenarioEvent, addScenarioEvent = _b.addScenarioEvent, store = _a.store;
var fmt = (0, timeFormatStore_1.useTimeFormatStore)();
var el = (0, vue_1.ref)(null);
var isPointerInteraction = (0, vue_1.ref)(false);
var isDragging = (0, vue_1.ref)(false);
var redrawCounter = (0, vue_1.ref)(0);
var width = (0, core_1.useElementSize)(el).width;
var tzOffset = scenarioTime.value.utcOffset();
var hourFormatter = (0, d3_time_format_1.utcFormat)("%H");
function getMinorFormatter(majorWidth) {
    if (majorWidth < 50) {
        return function (d) { return ""; };
    }
    return hourFormatter;
}
function getMajorFormatter(majorWidth) {
    if (majorWidth < 100) {
        return (0, d3_time_format_1.utcFormat)("%d %b");
    }
    return (0, d3_time_format_1.utcFormat)("%a %d %b");
}
var hoveredDate = (0, vue_1.ref)(null);
var majorTicks = (0, vue_1.ref)([]);
var minorTicks = (0, vue_1.ref)([]);
var eventsWithX = (0, vue_1.ref)([]);
var binsWithX = (0, vue_1.ref)([]);
var centerTimeStamp = (0, vue_1.ref)(0);
var xOffset = (0, vue_1.ref)(0);
var draggedDiff = (0, vue_1.ref)(0);
var majorWidth = (0, vue_1.ref)(100);
var minorStep = (0, vue_1.computed)(function () {
    if (majorWidth.value < 100) {
        return 12;
    }
    if (majorWidth.value < 180) {
        return 6;
    }
    if (majorWidth.value < 300) {
        return 4;
    }
    if (majorWidth.value < 500) {
        return 2;
    }
    return 1;
});
var maxCount = 1;
var histogram = [];
var minorWidth = (0, vue_1.computed)(function () { return majorWidth.value / (24 / minorStep.value); });
var currentTimestamp = (0, vue_1.ref)(0);
var animate = (0, vue_1.ref)(false);
var hoveredX = (0, vue_1.ref)(0);
var showHoverMarker = (0, vue_1.ref)(false);
var activeScenarioEventId = (0, selectedStore_1.useSelectedItems)().activeScenarioEventId;
var countColor = (0, d3_scale_1.scaleSequential)(d3_scale_chromatic_1.interpolateOranges).domain([1, maxCount]);
var timelineWidth = (0, vue_1.computed)(function () {
    return majorTicks.value.length * majorWidth.value;
});
var totalXOffset = (0, vue_1.computed)(function () {
    return xOffset.value + draggedDiff.value;
});
function updateTicks(centerTime, containerWidth, majorWidth, minorStep) {
    var dayPadding = Math.ceil((containerWidth * 2) / majorWidth);
    var currentUtcDay = d3_time_1.utcDay.floor(centerTime);
    var start = d3_time_1.utcDay.offset(currentUtcDay, -dayPadding);
    var end = d3_time_1.utcDay.offset(currentUtcDay, dayPadding);
    var dayRange = d3_time_1.utcDay.range(start, end);
    var majorFormatter = getMajorFormatter(majorWidth);
    majorTicks.value = dayRange.map(function (d) { return ({
        label: majorFormatter(d),
        timestamp: +d,
    }); });
    var hourRange = d3_time_1.utcHour.range(start, end, minorStep);
    var minorFormatter = getMinorFormatter(majorWidth);
    minorTicks.value = hourRange.map(function (d) { return ({
        label: minorFormatter(d),
        timestamp: +d,
    }); });
    return { minDate: start, maxDate: end };
}
function calculatePixelDate(x) {
    var center = width.value / 2;
    var msPerPixel = (MS_PER_HOUR * 24) / majorWidth.value;
    var diff = x - center;
    var newDate = centerTimeStamp.value + diff * msPerPixel;
    var date = new Date(newDate);
    date.setUTCSeconds(0, 0);
    return { date: date, diff: diff };
}
var startX = 0;
var accumulatedDrag = 0;
var startTimestamp = 0;
function onPointerDown(evt) {
    var e = (0, vue_1.unref)(el);
    startX = evt.clientX;
    startTimestamp = scenarioTime.value.valueOf();
    e.setPointerCapture(evt.pointerId);
    isPointerInteraction.value = true;
    isDragging.value = false;
}
function onPointerUp(evt) {
    if (!isDragging.value && evt.button !== 2) {
        var _a = calculatePixelDate(evt.clientX), date = _a.date, diff = _a.diff;
        animate.value = true;
        draggedDiff.value = -diff;
        // round to the nearest 15 minutes
        date.setUTCMinutes(Math.round(date.getUTCMinutes() / 15) * 15);
        setCurrentTime(date.valueOf());
    }
    else {
        animate.value = false;
        draggedDiff.value = 0;
    }
    isPointerInteraction.value = false;
    isDragging.value = false;
    accumulatedDrag = 0;
}
function onPointerMove(evt) {
    if (isPointerInteraction.value) {
        var diff = evt.clientX - startX;
        accumulatedDrag += Math.abs(diff);
        if (accumulatedDrag < 5) {
            isDragging.value = false;
            return;
        }
        else {
            isDragging.value = true;
        }
        draggedDiff.value = diff;
        var msPerPixel = (MS_PER_HOUR * 24) / majorWidth.value;
        currentTimestamp.value = Math.floor(startTimestamp - diff * msPerPixel);
        throttledTimeUpdate(currentTimestamp.value);
    }
}
var throttledTimeUpdate = (0, core_1.useThrottleFn)(setCurrentTime, 0);
function onHover(e) {
    var date = calculatePixelDate(e.clientX).date;
    // round to the nearest 15 minutes
    date.setUTCMinutes(Math.round(date.getUTCMinutes() / 15) * 15);
    hoveredX.value = e.clientX;
    hoveredDate.value = date;
}
var formattedHoveredDate = (0, vue_1.computed)(function () {
    return fmt.scenarioFormatter.format(+hoveredDate.value);
});
function onWheel(e) {
    if (e.deltaY > 0) {
        majorWidth.value = Math.max(majorWidth.value - 40, 55);
    }
    else {
        majorWidth.value += 40;
    }
}
var events = (0, vue_1.computed)(function () {
    return store.state.events.map(function (id) { return store.state.eventMap[id]; });
    // if (store.state.info.startTime)
    //   scenarioEvents.push({
    //     id: "xx",
    //     title: "Scenario start time",
    //     _type: "scenario",
    //     startTime: store.state.info.startTime,
    //   });
});
function updateEvents(minDate, maxDate) {
    var minTs = +minDate;
    var maxTs = +maxDate;
    var msPerPixel = majorWidth.value / (MS_PER_HOUR * 24);
    eventsWithX.value = events.value
        .filter(function (e) {
        return e.startTime >= minTs && e.startTime <= maxTs;
    })
        .map(function (event) {
        return { x: (event.startTime - minTs + tzOffset * 60 * 1000) * msPerPixel, event: event };
    });
    binsWithX.value = histogram
        .filter(function (bin) {
        return bin.t >= minTs && bin.t <= maxTs;
    })
        .map(function (event) { return ({
        x: (event.t - minTs + tzOffset * 60 * 1000) * msPerPixel,
        count: event.count,
    }); });
}
(0, vue_1.watch)([function () { return store.state.unitStateCounter; }, function () { return store.state.featureStateCounter; }], function (a, b) {
    var _a = computeTimeHistogram(), hg = _a.histogram, mc = _a.max;
    histogram = hg;
    maxCount = mc;
    redrawCounter.value += 1;
}, { immediate: true });
(0, vue_1.watchEffect)(function () {
    if (!width.value)
        return;
    var currentScenarioTimestamp = store.state.currentTime;
    redrawCounter.value;
    var tt = new Date(currentScenarioTimestamp);
    var redrawTimeline = false;
    if (isDragging.value) {
    }
    else if (animate.value === true) {
        setTimeout(function () {
            animate.value = false;
            draggedDiff.value = 0;
        }, 100);
    }
    else {
        redrawTimeline = true;
    }
    if (redrawTimeline) {
        centerTimeStamp.value = currentScenarioTimestamp;
        animate.value = false;
        xOffset.value =
            (tt.getUTCHours() * 60 + tt.getUTCMinutes() + tzOffset + tt.getUTCSeconds() / 60) *
                (majorWidth.value / (24 * 60)) *
                -1;
        var _a = updateTicks(tt, width.value, majorWidth.value, minorStep.value), minDate = _a.minDate, maxDate = _a.maxDate;
        updateEvents(minDate, maxDate);
    }
});
function onEventClick(event) {
    goToScenarioEvent(event);
}
function onContextMenuAction(action, options) {
    if (action === "zoomIn") {
        majorWidth.value += 40;
    }
    else if (action === "zoomOut") {
        majorWidth.value = Math.max(majorWidth.value - 40, 55);
    }
    else if (action === "addScenarioEvent") {
        var day = hoveredDate.value.getDate();
        var eventId = addScenarioEvent({
            title: "Event ".concat(day),
            startTime: +hoveredDate.value,
        });
        activeScenarioEventId.value = eventId;
    }
}
var __VLS_ctx = __assign(__assign({}, {}), {});
var __VLS_components;
var __VLS_intrinsics;
var __VLS_directives;
var __VLS_0 = TimelineContextMenu_vue_1.default || TimelineContextMenu_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0(__assign({ 'onAction': {} }, { formattedHoveredDate: (__VLS_ctx.formattedHoveredDate) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onAction': {} }, { formattedHoveredDate: (__VLS_ctx.formattedHoveredDate) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ action: {} },
    { onAction: (__VLS_ctx.onContextMenuAction) });
var __VLS_7 = {};
{
    var __VLS_8 = __VLS_3.slots.default;
    var onContextMenu = __VLS_vSlot(__VLS_8)[0].onContextMenu;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ onPointerdown: (__VLS_ctx.onPointerDown) }, { onPointerup: (__VLS_ctx.onPointerUp) }), { onPointermove: (__VLS_ctx.onPointerMove) }), { onWheel: (__VLS_ctx.onWheel) }), { onMousemove: (__VLS_ctx.onHover) }), { onMouseenter: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.showHoverMarker = true;
            // @ts-ignore
            [formattedHoveredDate, onContextMenuAction, onPointerDown, onPointerUp, onPointerMove, onWheel, onHover, showHoverMarker,];
        } }), { onMouseleave: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.showHoverMarker = false;
            // @ts-ignore
            [showHoverMarker,];
        } }), { onContextmenu: (onContextMenu) }), { ref: "el" }), { class: "bg-sidebar border-border relative mb-2 w-full transform overflow-x-hidden border-t text-sm transition-all select-none" }));
    /** @type {__VLS_StyleScopedClasses['bg-sidebar']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-x-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['select-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-sidebar flex h-3.5 items-center justify-center overflow-clip" }));
    /** @type {__VLS_StyleScopedClasses['bg-sidebar']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-clip']} */ ;
    var __VLS_9 = void 0;
    /** @ts-ignore @type {typeof __VLS_components.IconTriangleDown} */
    vue_mdi_1.IconTriangleDown;
    // @ts-ignore
    var __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9(__assign({ class: "h-4 w-4 scale-x-150 transform text-red-900" })));
    var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([__assign({ class: "h-4 w-4 scale-x-150 transform text-red-900" })], __VLS_functionalComponentArgsRest(__VLS_10), false));
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['scale-x-150']} */ ;
    /** @type {__VLS_StyleScopedClasses['transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-900']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign({ class: "touch-none text-sm select-none" }, { class: (__VLS_ctx.animate ? 'transition-all' : 'transition-none') }), { style: ("transform:translate(".concat(__VLS_ctx.totalXOffset, "px)")) }));
    /** @type {__VLS_StyleScopedClasses['touch-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['select-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-center" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative h-4 flex-none text-center" }, { style: ("width: ".concat(__VLS_ctx.timelineWidth, "px")) }));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    for (var _i = 0, _c = __VLS_vFor((__VLS_ctx.binsWithX)); _i < _c.length; _i++) {
        var _d = _c[_i][0], x = _d.x, count = _d.count;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign(__assign(__assign({ onMousemove: function () { } }, { key: (x) }), { class: "absolute top-1 h-2 w-4 rounded border border-gray-500" }), { style: ("left: ".concat(x, "px; width: ").concat(Math.max(__VLS_ctx.majorWidth / 24, 8), "px;background-color: ").concat(__VLS_ctx.countColor(count))) }), { title: ("".concat(count, " unit events")) }));
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gray-500']} */ ;
        // @ts-ignore
        [animate, totalXOffset, timelineWidth, binsWithX, majorWidth, countColor,];
    }
    var _loop_1 = function (x, event_1) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button)(__assign(__assign(__assign(__assign(__assign({ onMousemove: function () { } }, { onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.onEventClick(event_1);
                // @ts-ignore
                [eventsWithX, onEventClick,];
            } }), { type: "button", key: (event_1.id) }), { class: "absolute h-4 w-4 -translate-x-1/2 rounded-full border border-gray-500 bg-amber-500 hover:bg-red-900" }), { style: ("left: ".concat(x, "px;")) }), { title: (event_1.title) }));
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gray-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-amber-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-red-900']} */ ;
        // @ts-ignore
        [];
    };
    for (var _e = 0, _f = __VLS_vFor((__VLS_ctx.eventsWithX)); _e < _f.length; _e++) {
        var _g = _f[_e][0], x = _g.x, event_1 = _g.event;
        _loop_1(x, event_1);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-center" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative flex-none text-center" }, { style: ("width: ".concat(__VLS_ctx.timelineWidth, "px")) }));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "border-muted-foreground flex justify-center" }));
    /** @type {__VLS_StyleScopedClasses['border-muted-foreground']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    for (var _h = 0, _j = __VLS_vFor((__VLS_ctx.majorTicks)); _h < _j.length; _h++) {
        var tick = _j[_h][0];
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign({ key: (tick.timestamp) }, { class: "border-muted-foreground flex-none border-r border-b pl-0.5" }), { style: ("width: ".concat(__VLS_ctx.majorWidth, "px")) }));
        /** @type {__VLS_StyleScopedClasses['border-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-r']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['pl-0.5']} */ ;
        (tick.label);
        // @ts-ignore
        [timelineWidth, majorWidth, majorTicks,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-center text-xs" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    for (var _k = 0, _l = __VLS_vFor((__VLS_ctx.minorTicks)); _k < _l.length; _k++) {
        var tick = _l[_k][0];
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign({ key: (tick.timestamp) }, { class: "text-muted-foreground border-muted-foreground min-h-[1rem] flex-none border-r pl-0.5" }), { style: ("width: ".concat(__VLS_ctx.minorWidth, "px")) }));
        /** @type {__VLS_StyleScopedClasses['text-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-muted-foreground']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-h-[1rem]']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-r']} */ ;
        /** @type {__VLS_StyleScopedClasses['pl-0.5']} */ ;
        (tick.label);
        // @ts-ignore
        [minorTicks, minorWidth,];
    }
    if (__VLS_ctx.showHoverMarker && !__VLS_ctx.isDragging) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "absolute top-0 right-1 hidden p-0 text-xs text-red-900 select-none sm:block dark:text-red-600" }));
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['right-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-red-900']} */ ;
        /** @type {__VLS_StyleScopedClasses['select-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:block']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:text-red-600']} */ ;
        (__VLS_ctx.formattedHoveredDate);
    }
    if (__VLS_ctx.showHoverMarker) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div)(__assign({ class: "hover-hover:flex absolute top-0 bottom-0 w-0.5 bg-red-900/50 dark:bg-red-600/50" }, { style: ("left: ".concat(__VLS_ctx.hoveredX, "px")) }));
        /** @type {__VLS_StyleScopedClasses['hover-hover:flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-red-900/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:bg-red-600/50']} */ ;
    }
    // @ts-ignore
    [formattedHoveredDate, showHoverMarker, showHoverMarker, isDragging, hoveredX,];
    __VLS_3.slots['' /* empty slot name completion */];
}
var __VLS_3;
var __VLS_4;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
