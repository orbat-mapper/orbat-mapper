import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export const useTextToOrbatStore = defineStore("textToOrbat", {
  state() {
    return {
      matchInputCase: useLocalStorage("textToOrbatMatchCase", true),
    };
  },
});
