// Wrapper module for lazy loading.
// If we use await import("xlsx") directly, tree shaking will not work.
export { write as xlsxWrite, writeFileXLSX } from "xlsx";
export { utils as xlsxUtils } from "xlsx";
