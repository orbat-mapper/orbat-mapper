import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import SymbolCodeViewer from "@/components/SymbolCodeViewer.vue";

function mountViewer(sidc: string) {
  return mount(SymbolCodeViewer, {
    props: { sidc },
    global: {
      stubs: {
        IconButton: { template: "<button><slot /></button>" },
        InputGroup: { template: "<input />" },
      },
    },
  });
}

describe("SymbolCodeViewer", () => {
  it.skip("renders legacy SIDCs as 20 raw digits", () => {
    const wrapper = mountViewer("10031000123456789000");
    expect(wrapper.text()).toContain("10031000123456789000");
  });

  it.skip("renders edition E SIDCs as 30 raw positions", () => {
    const sidc = "1513100012345678070010A0000840";
    const wrapper = mountViewer(sidc);
    expect(wrapper.text()).toContain(sidc);
  });
});
