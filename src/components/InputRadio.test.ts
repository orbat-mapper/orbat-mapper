// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import InputRadio from "@/components/InputRadio.vue";

describe("InputRadio", () => {
  it("uses explicit radio artwork instead of the low-contrast browser style", () => {
    const wrapper = mount(InputRadio, {
      props: { value: "native", modelValue: "rendered" },
    });

    const radio = wrapper.get("input[type='radio']");

    expect(radio.classes()).toEqual(expect.arrayContaining(["input-radio", "size-5"]));
    expect(radio.classes()).not.toContain("border-input");
    expect(radio.classes()).not.toContain("dark:bg-input/30");
  });
});
