"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTimer = useTimer;
var core_1 = require("@vueuse/core");
var vue_1 = require("vue");
function useTimer(cb, delay) {
    if (delay === void 0) { delay = 4000; }
    var startedAt = Date.now();
    var timeRemaining = (0, vue_1.unref)(delay);
    var isPending = (0, vue_1.ref)(true);
    var timer = null;
    timer = setTimeout(function () {
        isPending.value = false;
        timer = null;
        cb();
    }, (0, vue_1.unref)(timeRemaining));
    function pause() {
        stop();
        timeRemaining -= Date.now() - startedAt;
    }
    function stop() {
        if (timer)
            clearTimeout(timer);
    }
    function resume() {
        stop();
        startedAt = Date.now();
        timer = setTimeout(cb, (0, vue_1.unref)(timeRemaining));
    }
    (0, core_1.tryOnScopeDispose)(function () {
        stop();
    });
    return { isPending: isPending, pause: pause, resume: resume, stop: stop };
}
