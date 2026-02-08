"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePlaybackStore = void 0;
var pinia_1 = require("pinia");
var vue_1 = require("vue");
var core_1 = require("@vueuse/core");
exports.usePlaybackStore = (0, pinia_1.defineStore)("playbackStore", function () {
    var playbackSpeed = (0, vue_1.ref)(1000 * 60 * 30);
    var startMarker = (0, vue_1.ref)();
    var endMarker = (0, vue_1.ref)();
    var _a = (0, core_1.useToggle)(false), playbackRunning = _a[0], togglePlayback = _a[1];
    var _b = (0, core_1.useToggle)(false), playbackLooping = _b[0], toggleLooping = _b[1];
    function increaseSpeed() {
        playbackSpeed.value *= 2;
    }
    function decreaseSpeed() {
        playbackSpeed.value /= 2;
    }
    function addMarker(marker) {
        if (startMarker.value === undefined) {
            startMarker.value = marker;
        }
        else if (endMarker.value === undefined) {
            endMarker.value = marker;
        }
        else {
            if (marker < endMarker.value) {
                startMarker.value = marker;
            }
            else {
                endMarker.value = marker;
            }
        }
    }
    function clearMarkers() {
        startMarker.value = undefined;
        endMarker.value = undefined;
    }
    return {
        playbackSpeed: playbackSpeed,
        playbackRunning: playbackRunning,
        togglePlayback: togglePlayback,
        increaseSpeed: increaseSpeed,
        decreaseSpeed: decreaseSpeed,
        startMarker: startMarker,
        endMarker: endMarker,
        addMarker: addMarker,
        playbackLooping: playbackLooping,
        toggleLooping: toggleLooping,
        clearMarkers: clearMarkers,
    };
});
