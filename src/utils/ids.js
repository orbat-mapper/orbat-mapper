"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nanoid = void 0;
var nanoid_1 = require("nanoid");
var alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
exports.nanoid = (0, nanoid_1.customAlphabet)(alphabet, 10);
