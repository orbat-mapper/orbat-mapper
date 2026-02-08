"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertVariants = exports.AlertTitle = exports.AlertDescription = exports.Alert = void 0;
var class_variance_authority_1 = require("class-variance-authority");
var Alert_vue_1 = require("./Alert.vue");
Object.defineProperty(exports, "Alert", { enumerable: true, get: function () { return Alert_vue_1.default; } });
var AlertDescription_vue_1 = require("./AlertDescription.vue");
Object.defineProperty(exports, "AlertDescription", { enumerable: true, get: function () { return AlertDescription_vue_1.default; } });
var AlertTitle_vue_1 = require("./AlertTitle.vue");
Object.defineProperty(exports, "AlertTitle", { enumerable: true, get: function () { return AlertTitle_vue_1.default; } });
exports.alertVariants = (0, class_variance_authority_1.cva)("relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current", {
    variants: {
        variant: {
            default: "bg-card text-card-foreground",
            destructive: "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
