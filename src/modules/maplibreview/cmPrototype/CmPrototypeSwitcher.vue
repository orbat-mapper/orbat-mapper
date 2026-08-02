<script setup lang="ts">
// PROTOTYPE — throwaway (#640). Floating variant switcher. Deliberately ugly so it
// never reads as part of the design being judged. Dev builds only.
import { computed } from "vue";

const props = defineProps<{
  variants: { key: string; name: string }[];
  current: string;
}>();
const emit = defineEmits<{ (e: "select", key: string): void }>();

const index = computed(() =>
  Math.max(
    0,
    props.variants.findIndex((v) => v.key === props.current),
  ),
);
const currentName = computed(() => props.variants[index.value]?.name ?? "");

function cycle(delta: number) {
  const n = props.variants.length;
  emit("select", props.variants[(index.value + delta + n) % n]!.key);
}

function onKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable))
    return;
  if (e.key === "ArrowLeft") cycle(-1);
  else if (e.key === "ArrowRight") cycle(1);
}
if (typeof window !== "undefined") window.addEventListener("keydown", onKey);
</script>

<template>
  <div
    class="pointer-events-auto fixed top-1 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-2 rounded-full bg-fuchsia-700 px-2 py-1 text-xs font-medium text-white shadow-lg"
  >
    <button
      class="px-1.5 text-base leading-none"
      title="Previous variant (←)"
      @click="cycle(-1)"
    >
      ‹
    </button>
    <span class="tabular-nums">#640 · {{ current }} — {{ currentName }}</span>
    <button
      class="px-1.5 text-base leading-none"
      title="Next variant (→)"
      @click="cycle(1)"
    >
      ›
    </button>
  </div>
</template>
