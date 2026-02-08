"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyMediaVariants = exports.EmptyTitle = exports.EmptyMedia = exports.EmptyHeader = exports.EmptyDescription = exports.EmptyContent = exports.Empty = void 0;
var class_variance_authority_1 = require("class-variance-authority");
var Empty_vue_1 = require("./Empty.vue");
Object.defineProperty(exports, "Empty", { enumerable: true, get: function () { return Empty_vue_1.default; } });
var EmptyContent_vue_1 = require("./EmptyContent.vue");
Object.defineProperty(exports, "EmptyContent", { enumerable: true, get: function () { return EmptyContent_vue_1.default; } });
var EmptyDescription_vue_1 = require("./EmptyDescription.vue");
Object.defineProperty(exports, "EmptyDescription", { enumerable: true, get: function () { return EmptyDescription_vue_1.default; } });
var EmptyHeader_vue_1 = require("./EmptyHeader.vue");
Object.defineProperty(exports, "EmptyHeader", { enumerable: true, get: function () { return EmptyHeader_vue_1.default; } });
var EmptyMedia_vue_1 = require("./EmptyMedia.vue");
Object.defineProperty(exports, "EmptyMedia", { enumerable: true, get: function () { return EmptyMedia_vue_1.default; } });
var EmptyTitle_vue_1 = require("./EmptyTitle.vue");
Object.defineProperty(exports, "EmptyTitle", { enumerable: true, get: function () { return EmptyTitle_vue_1.default; } });
exports.emptyMediaVariants = (0, class_variance_authority_1.cva)("mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0", {
    variants: {
        variant: {
            default: "bg-transparent",
            icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
