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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNotifications = useNotifications;
var vue_1 = require("vue");
var nanoid_1 = require("nanoid");
var notifications = (0, vue_1.ref)([]);
function useNotifications() {
    function send(notification) {
        notifications.value.push(__assign({ id: (0, nanoid_1.nanoid)() }, notification));
    }
    function clear() {
        notifications.value = [];
    }
    function deleteNotification(id) {
        var index = notifications.value.findIndex(function (e) { return e.id === id; });
        if (index < 0)
            return;
        //     const { onClose } = n.options;
        // onClose && onClose(n);
        notifications.value.splice(index, 1);
    }
    return { notifications: notifications, send: send, clear: clear, deleteNotification: deleteNotification };
}
