// Wrapper module for lazy loading.
// If we use await import("xlsx") directly, tree shaking will not work.
export { read as readSpreadsheet } from "xlsx";
