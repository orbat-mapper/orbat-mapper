import { mount, flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import DataGrid from "./DataGrid.vue";

// jsdom has no layout. Render every virtual row while exercising the real table model.
vi.mock("@tanstack/vue-virtual", async () => {
  const { computed } = await import("vue");
  return {
    useVirtualizer: (options: { value: { count: number } }) =>
      computed(() => ({
        getVirtualItems: () =>
          Array.from({ length: options.value.count }, (_, index) => ({
            key: index,
            index,
            start: index * 40,
          })),
        getTotalSize: () => options.value.count * 40,
      })),
  };
});
const data = [
  {
    id: "parent",
    name: "Parent",
    subUnits: [
      { id: "changed", name: "Changed" },
      { id: "same", name: "Unchanged child" },
    ],
  },
  { id: "other", name: "Other" },
];
function setup() {
  return mount(DataGrid, {
    props: {
      data,
      columns: [{ id: "name", accessorKey: "name", header: "Name" }],
      select: true,
      selectAll: true,
      initialState: { expanded: true },
      getSubRows: (row: { subUnits?: unknown[] }) => row.subUnits ?? [],
    },
  });
}
describe("DataGrid display filtering", () => {
  it("keeps ancestors and selection when filtering and unfiltering", async () => {
    const wrapper = setup();
    await flushPromises();
    expect(wrapper.findAll("tbody tr")).toHaveLength(4);
    const events = wrapper.emitted("update:selected")!.length;
    await wrapper.setProps({ rowFilter: (row) => row.id === "changed" });
    expect(wrapper.findAll("tbody tr").map((r) => r.text())).toEqual([
      "Parent",
      "Changed",
    ]);
    expect(wrapper.emitted("update:selected")).toHaveLength(events);
    await wrapper.setProps({ rowFilter: undefined });
    expect(wrapper.findAll("tbody tr")).toHaveLength(4);
    expect(
      wrapper
        .findAll<HTMLInputElement>('tbody input[type="checkbox"]')
        .every((c) => c.element.checked),
    ).toBe(true);
    expect(wrapper.emitted("update:selected")).toHaveLength(events);
  });
  it("preserves hidden selections when a visible row is deselected", async () => {
    const wrapper = setup();
    await flushPromises();
    await wrapper.setProps({ rowFilter: (row) => row.id === "changed" });
    await wrapper.findAll("tbody tr")[1].get('input[type="checkbox"]').setValue(false);
    const selected = wrapper.emitted("update:selected")!.at(-1)![0] as { id: string }[];
    expect(selected.map((r) => r.id)).toEqual(expect.arrayContaining(["same", "other"]));
    expect(selected.map((r) => r.id)).not.toContain("changed");
    await wrapper.setProps({ rowFilter: undefined });
    const boxes = wrapper.findAll<HTMLInputElement>('tbody input[type="checkbox"]');
    expect(boxes[1].element.checked).toBe(false);
    expect(boxes[2].element.checked).toBe(true);
  });
  it("keeps existing column visibility settings", async () => {
    const wrapper = mount(DataGrid, {
      props: {
        data: [{ id: "id-1", name: "Visible" }],
        columns: [
          { id: "name", accessorKey: "name", header: "Name" },
          { id: "id", accessorKey: "id", header: "ID" },
        ],
        initialState: { columnVisibility: { id: false } },
      },
    });
    await flushPromises();
    expect(wrapper.findAll("th").map((h) => h.text())).toEqual(["Name"]);
    await wrapper.setProps({ rowFilter: () => true });
    expect(wrapper.findAll("th").map((h) => h.text())).toEqual(["Name"]);
  });
  it("shows an empty result without clearing selection", async () => {
    const wrapper = setup();
    await flushPromises();
    const events = wrapper.emitted("update:selected")!.length;
    await wrapper.setProps({ rowFilter: () => false });
    expect(wrapper.text()).toContain("No matching entries.");
    expect(wrapper.findAll("tbody tr")).toHaveLength(0);
    expect(wrapper.emitted("update:selected")).toHaveLength(events);
  });
});
