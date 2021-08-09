<template>
  <div class="prose p-4 prose-sm" v-html="renderedContent"></div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { renderMarkdown } from "../composables/formatting";
import { content } from "../testdata/testStory";

export default defineComponent({
  name: "StoryModeContent",
  setup() {
    const renderedContent = computed(() => {
      return renderMarkdown(content);
    });
    return { renderedContent };
  },
});
</script>
