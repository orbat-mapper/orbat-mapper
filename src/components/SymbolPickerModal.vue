<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <SimpleModal v-model="open" dialog-title="Symbol picker">
    <header class="mt-4 w-16 h-20">
      <MilSymbol :sidc="csidc" :size="34" />
    </header>

    <TabView>
      <TabItem label="Select" v-slot="{ isActive }">
        <SearchModalInput
          class="pb-3"
          placeholder="Search for symbol"
          v-model="searchQuery"
          @keydown.tab="onTab"
          @keydown.esc.stop="hitsIsOpen ? (hitsIsOpen = false) : (open = false)"
          @keydown.enter.prevent="!hitsIsOpen && onSubmit()"
        />

        <div class="relative" v-if="hits?.length && hitsIsOpen" ref="hitsRef">
          <ul
            class="
              absolute
              z-10
              mt-1
              w-full
              bg-white
              shadow-2xl
              max-h-56
              border border-gray-400
              rounded-md
              py-1
              text-base
              ring-1 ring-black ring-opacity-5
              overflow-auto
              focus:outline-none
              sm:text-sm
              divide-y divide-gray-100
            "
          >
            <li
              v-for="(item, index) in hits"
              class="
                text-sm
                p-2
                py-3
                flex
                items-center
                cursor-default
                hover:bg-gray-200
              "
              tabindex="-1"
              :class="{ 'bg-gray-200': index === currentIndex }"
              :key="item.sidc"
              :id="item.sidc"
              @click="onSelect(index)"
            >
              <p class="flex-shrink-0 h-7 w-9 flex justify-center">
                <MilSymbol :size="25" :sidc="item.sidc" />
              </p>
              <span class="text-sm ml-3">{{ item.text }} </span>
            </li>
          </ul>
        </div>
        <form class="space-y-4" @submit.prevent="onSubmit" v-if="isLoaded">
          <!--      <input type="text" :value="sidc" />-->
          <SymbolCodeSelect
            v-model="symbolSetValue"
            label="Symbol set"
            :items="symbolSets"
          />
          <SymbolCodeSelect
            v-model="statusValue"
            label="Status"
            :items="statusItems"
          />
          <SymbolCodeSelect
            v-model="hqtfdValue"
            label="Headquaters / Task force / Dummy"
            :items="hqtfdItems"
          />
          <SymbolCodeSelect
            v-model="emtValue"
            label="Echelon / Mobility / Towed array"
            :items="emtItems"
          />
          <SymbolCodeMultilineSelect
            v-model="iconValue"
            label="Main icon"
            :items="icons"
          />
          <SymbolCodeSelect
            v-model="mod1Value"
            label="Modifier 1"
            :items="mod1Items"
          />
          <SymbolCodeSelect
            v-model="mod2Value"
            label="Modifier 2"
            :items="mod2Items"
          />

          <div style="min-height: 14rem" class="py-4 flex justify-end">
            <div class="">
              <PrimaryButton type="submit" class=""
                >Select symbol
              </PrimaryButton>
            </div>
          </div>
        </form>
        <GlobalEvents
          v-if="isActive && hits?.length && hitsIsOpen"
          @keydown.arrow-down="doKbd('down')"
          @keydown.page-down="doKbd('pagedown')"
          @keydown.arrow-up="doKbd('up')"
          @keydown.page-up="doKbd('pageup')"
          @keydown.enter.prevent="onSelect()"
        >
        </GlobalEvents>
      </TabItem>
      <TabItem label="Browse" v-slot="{ isActive }">
        <div class="min-h-[30rem]" v-if="isActive">
          <SymbolCodeSelect
            v-model="symbolSetValue"
            label="Symbol set"
            :items="symbolSets"
          />

          <div class="overflow-auto max-h-[40rem] mt-2">
            <div
              v-for="[entity, entityIcons] in iconsByEntity"
              class="relative"
            >
              <p class="text-gray-900 font-medium bg-gray-200 p-2 sticky top-0">
                {{ entity }}
              </p>
              <div class="mt-4 grid grid-cols-3 gap-x-2 gap-y-4 p-1">
                <button
                  type="button"
                  v-for="{
                    sidc,
                    entity,
                    entityType,
                    entitySubtype,
                    code,
                  } in entityIcons"
                  :key="sidc"
                  @click="iconValue = code"
                  class="
                    border border-transparent
                    rounded
                    p-4
                    flex flex-col
                    items-center
                    justify-start
                    w-full
                    hover:border-gray-500
                  "
                >
                  <MilSymbol :size="32" :sidc="sidc" />
                  <p
                    class="
                      mt-1
                      text-sm text-center text-gray-900
                      max-w-full
                      overflow-hidden
                    "
                  >
                    {{ entitySubtype || entityType || entity }}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </TabItem>
    </TabView>
  </SimpleModal>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  ref,
  watch,
  watchEffect,
} from "vue";
import MilSymbol from "./MilSymbol.vue";
import PrimaryButton from "./PrimaryButton.vue";
import SymbolCodeSelect from "./SymbolCodeSelect.vue";
import { onClickOutside, useDebounce, useVModel, whenever } from "@vueuse/core";
import SimpleModal from "./SimpleModal.vue";
import SymbolCodeMultilineSelect from "./SymbolCodeMultilineSelect.vue";
import { useSymbolItems } from "../composables/symbolData";
import NProgress from "nprogress";
import SearchModalInput from "./SearchModalInput.vue";
import { GlobalEvents } from "vue-global-events";
import TabView from "./TabView.vue";
import TabItem from "./TabItem.vue";

export default defineComponent({
  name: "SymbolPickerModal",
  components: {
    TabItem,
    TabView,
    SearchModalInput,
    SymbolCodeMultilineSelect,
    SimpleModal,
    SymbolCodeSelect,
    PrimaryButton,
    MilSymbol,
    GlobalEvents,
  },
  props: {
    isVisible: { type: Boolean, default: false },
    sidc: { type: String },
  },
  emits: ["update:isVisible", "update:sidc"],
  setup(props, { emit }) {
    const open = useVModel(props, "isVisible");
    const searchQuery = ref("");
    const debouncedQuery = useDebounce(searchQuery, 100);
    const currentIndex = ref(-1);
    const hitsIsOpen = ref(false);
    const hitsRef = ref(null);

    onClickOutside(hitsRef, (event) => (hitsIsOpen.value = false));

    const {
      csidc,
      loadData,
      isLoaded,
      fuseSymbolRef,
      sidValue,
      symbolSetValue,
      iconValue,
      ...symbolItems
    } = useSymbolItems(computed(() => props.sidc || ""));
    loadData();

    whenever(isLoaded, () => NProgress.done(), { immediate: true });
    const hits = computed(() => {
      return fuseSymbolRef.value
        ?.search(debouncedQuery.value, { limit: 20 })
        .map((e) => {
          return {
            ...e.item,
            sidc:
              "100" +
              sidValue.value +
              e.item.symbolSet +
              "0000" +
              e.item.code +
              "0000",
          };
        });
    });

    watch(hits, (v) => {
      if (!v?.length) return;
      hitsIsOpen.value = true;
      currentIndex.value = 0;
    });

    const onTab = (event: KeyboardEvent) => {
      if (hitsIsOpen.value) {
        event.stopPropagation();
        event.preventDefault();
      }
    };

    const onSubmit = () => {
      emit("update:sidc", csidc.value);
      open.value = false;
    };

    function doKbd(direction: "up" | "down" | "pagedown" | "pageup") {
      const nHits = hits?.value?.length || 0;
      if (direction === "up") {
        if (currentIndex.value === 0) {
          currentIndex.value = nHits - 1;
        } else currentIndex.value = currentIndex.value - 1;
      } else if (direction === "down") {
        currentIndex.value++;
        if (currentIndex.value >= nHits) {
          currentIndex.value = 0;
        }
      } else if (direction === "pagedown") {
        currentIndex.value += 3;
        if (currentIndex.value >= nHits) {
          currentIndex.value = nHits - 1;
        }
      } else if (direction === "pageup") {
        currentIndex.value -= 3;
        if (currentIndex.value < 0) currentIndex.value = 0;
      }
    }

    function onSelect(index?: number) {
      const i = index === undefined ? currentIndex.value : index;
      if (!hits?.value?.length) return;
      const symbol = hits.value[i];
      symbolSetValue.value = symbol.symbolSet;
      iconValue.value = symbol.code;
      hitsIsOpen.value = false;
    }

    watchEffect(() => {
      if (!hits?.value?.length || currentIndex.value < 0) return;
      nextTick(() =>
        document
          .getElementById(hits.value![currentIndex.value].sidc)
          ?.scrollIntoView?.({ block: "nearest" })
      );
    });

    const iconsByEntity = computed(() => {
      const { icons } = symbolItems;
      const mm = new Map();
      icons.value.forEach((v) => {
        const l = mm.get(v.entity) || [];
        l.push(v);
        mm.set(v.entity, l);
      });

      return mm;
    });

    return {
      open,
      csidc,
      isLoaded,
      symbolSetValue,
      iconValue,
      ...symbolItems,
      onSubmit,
      searchQuery,
      hits,
      currentIndex,
      doKbd,
      onSelect,
      hitsIsOpen,
      hitsRef,
      onTab,
      iconsByEntity,
    };
  },
});
</script>
