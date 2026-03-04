// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import ToeGrid from "@/modules/grid/ToeGrid.vue";

const Wrapper = defineComponent({
  components: { ToeGrid },
  setup() {
    const editedId = ref("b");
    const data = ref([
      { id: "b", name: "Bravo" },
      { id: "a", name: "Alpha" },
      { id: "c", name: "Charlie" },
    ]);
    const columns = [{ id: "name", header: "Name", accessorKey: "name" }];
    return { editedId, data, columns };
  },
  template: `
    <ToeGrid :columns="columns" :data="data" v-model:editedId="editedId">
      <template #inline-form="{ row, nextEditedId }">
        <div data-testid="inline" :data-row-id="row.id" :data-next-id="nextEditedId" />
      </template>
    </ToeGrid>
  `,
});

describe("ToeGrid inline-form slot", () => {
  it("passes nextEditedId based on visible sorted order", async () => {
    const wrapper = mount(Wrapper);

    expect(wrapper.get("[data-testid='inline']").attributes("data-next-id")).toBe("a");

    await wrapper.findAll("th")[0].trigger("click");

    expect(wrapper.get("[data-testid='inline']").attributes("data-next-id")).toBe("c");
  });
});
