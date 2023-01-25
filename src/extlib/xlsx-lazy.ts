// Wrapper module for lazy loading.
// If we use await import("xlsx") directly, tree shaking will not work.
export { writeFileXLSX, utils } from "xlsx";
