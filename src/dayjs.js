"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable func-names */
var dayjs_1 = require("dayjs");
var utc_1 = require("dayjs/plugin/utc");
var duration_1 = require("dayjs/plugin/duration");
var timezone_1 = require("dayjs/plugin/timezone");
var relativeTime_1 = require("dayjs/plugin/relativeTime");
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(duration_1.default);
dayjs_1.default.extend(timezone_1.default);
dayjs_1.default.extend(relativeTime_1.default);
