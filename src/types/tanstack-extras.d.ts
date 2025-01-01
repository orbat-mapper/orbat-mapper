import "@tanstack/vue-table";
import { RowData } from "@tanstack/vue-table";

declare module "@tanstack/vue-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "left" | "center" | "right";
  }
}
