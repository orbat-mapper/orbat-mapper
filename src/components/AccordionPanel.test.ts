import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AccordionPanel from "@/components/AccordionPanel.vue";

function mountPanel(props: Record<string, unknown> = {}) {
  return mount(AccordionPanel, {
    props: { label: "Section", ...props },
    slots: { default: "<p>Panel content</p>" },
  });
}

describe("AccordionPanel", () => {
  it("starts closed by default", () => {
    expect(mountPanel().text()).not.toContain("Panel content");
  });

  it("starts open when defaultOpen is set", () => {
    expect(mountPanel({ defaultOpen: true }).text()).toContain("Panel content");
  });
});
