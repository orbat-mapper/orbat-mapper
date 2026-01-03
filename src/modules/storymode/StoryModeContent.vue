<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import { renderMarkdown } from "../../composables/formatting";
import { actions, content } from "../../testdata/testStory";
import scrollama, { type ScrollamaInstance } from "scrollama";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

export default defineComponent({
  name: "StoryModeContent",
  emits: ["update-state"],
  setup(props, { emit }) {
    const renderedContent = computed(() => {
      return renderMarkdown(content);
    });
    let scroller: ScrollamaInstance;
    const breakpoints = useBreakpoints(breakpointsTailwind);

    const smAndLarger = breakpoints.greater("md");
    const sIndex = ref(-1);

    onMounted(() => {
      scroller = scrollama();
      scroller
        .setup({
          step: ".scroll-step",
          // debug: true,
        })
        .onStepEnter(({ element, index, direction }) => {
          sIndex.value = index;
          if (actions[index]) emit("update-state", actions[index]);
          element.classList.add("bg-red-50");
          // console.log("Enter", element, index, direction);
        })
        .onStepExit(({ element, index, direction }) => {
          element.classList.remove("bg-red-50");
          // console.log("Exit", element, index, direction);
        });
      watch(
        smAndLarger,
        (larger) => {
          //@ts-ignore
          if (larger) scroller?.offset("100px");
          //@ts-ignore
          else scroller?.offset(0.5);
        },
        { immediate: true },
      );
    });

    onUnmounted(() => {
      scroller.destroy();
    });
    return { renderedContent, sIndex };
  },
});
</script>

<template>
  <div>
    <p class="fixed right-2 bottom-2 z-40 border bg-white p-2">{{ sIndex }}</p>
    <div class="prose prose-sm p-4" v-html="renderedContent"></div>
  </div>
</template>
