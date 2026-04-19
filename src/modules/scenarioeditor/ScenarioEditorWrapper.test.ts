// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { computed, defineComponent, nextTick, ref, type Ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import type { Scenario } from "@/types/scenarioModels";
import ScenarioEditorWrapper from "@/modules/scenarioeditor/ScenarioEditorWrapper.vue";

let currentScenario: any;
let flushDraftMock: ReturnType<typeof vi.fn>;
let saveToIndexedDbMock: ReturnType<typeof vi.fn>;
let discardDraftMock: ReturnType<typeof vi.fn>;
let getNewerDraftMock: ReturnType<typeof vi.fn>;
let loadFromObjectMock: ReturnType<typeof vi.fn>;
let loadDemoScenarioMock: ReturnType<typeof vi.fn>;
let loadScenarioMock: ReturnType<typeof vi.fn>;
let selectedInfoVisible: Ref<boolean>;
let clearSelectedMock: ReturnType<typeof vi.fn>;
let savedDirtyRef: Ref<boolean>;
let hasUnsavedChangesMock: ReturnType<typeof vi.fn>;
let sessionRevisionRef: Ref<number>;

function createScenario(id: string, name = "Scenario"): Scenario {
  const startTime = Date.parse("2025-01-01T00:00:00.000Z");
  return {
    id,
    type: "ORBAT-mapper",
    version: "3.2.0",
    meta: {
      createdDate: "2025-01-01T00:00:00.000Z",
      lastModifiedDate: "2025-01-01T00:00:00.000Z",
    },
    name,
    description: "",
    startTime,
    timeZone: "UTC",
    symbologyStandard: "2525",
    sides: [],
    events: [],
    layerStack: [{ id: "layer-1", kind: "overlay", name: "Features", items: [] }],
    settings: {
      rangeRingGroups: [],
      statuses: [],
      supplyClasses: [],
      supplyUoMs: [],
      symbolFillColors: [],
    },
  };
}

vi.mock("@/scenariostore", () => ({
  useScenario: () => ({
    scenario: computed(() => currentScenario),
    isReady: computed(() => true),
  }),
}));

vi.mock("@/scenariostore/localdb", () => ({
  useIndexedDb: async () => ({
    loadScenario: loadScenarioMock,
  }),
}));

vi.mock("@/stores/selectedStore", () => ({
  useSelectedItems: () => ({
    clear: clearSelectedMock,
    showScenarioInfo: selectedInfoVisible,
  }),
}));

async function flushAll() {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
}

const ScenarioLeavePromptModalStub = defineComponent({
  name: "ScenarioLeavePromptModal",
  props: {
    modelValue: { type: Boolean, default: false },
  },
  emits: ["save", "discard", "cancel", "update:modelValue"],
  template: `
    <div v-if="modelValue" data-testid="leave-prompt">
      <button data-testid="leave-save" @click="$emit('save')">Save</button>
      <button data-testid="leave-discard" @click="$emit('discard')">Discard</button>
      <button data-testid="leave-cancel" @click="$emit('cancel')">Cancel</button>
    </div>
  `,
});

const ScenarioDraftRecoveryModalStub = defineComponent({
  name: "ScenarioDraftRecoveryModal",
  props: {
    modelValue: { type: Boolean, default: false },
  },
  emits: ["restore-draft", "open-saved", "cancel", "update:modelValue"],
  template: `
    <div v-if="modelValue" data-testid="draft-recovery">
      <button data-testid="draft-restore" @click="$emit('restore-draft')">Restore</button>
      <button data-testid="draft-open-saved" @click="$emit('open-saved')">Saved</button>
      <button data-testid="draft-cancel" @click="$emit('cancel')">Cancel</button>
    </div>
  `,
});

describe("ScenarioEditorWrapper", () => {
  beforeEach(() => {
    const savedScenario = createScenario("scenario-1");

    savedDirtyRef = ref(false);
    hasUnsavedChangesMock = vi.fn(() => savedDirtyRef.value);
    sessionRevisionRef = ref(0);
    flushDraftMock = vi.fn(async () => undefined);
    saveToIndexedDbMock = vi.fn(async () => "scenario-1");
    discardDraftMock = vi.fn(async () => undefined);
    getNewerDraftMock = vi.fn(async () => undefined);
    loadFromObjectMock = vi.fn();
    loadDemoScenarioMock = vi.fn(async () => savedScenario);
    loadScenarioMock = vi.fn(async () => savedScenario);
    selectedInfoVisible = ref(false);
    clearSelectedMock = vi.fn();

    currentScenario = {
      io: {
        loadDemoScenario: loadDemoScenarioMock,
        loadFromObject: loadFromObjectMock,
        getNewerDraft: getNewerDraftMock,
        flushDraft: flushDraftMock,
        saveToIndexedDb: saveToIndexedDbMock,
        discardDraft: discardDraftMock,
        savedDirty: savedDirtyRef,
        hasUnsavedChanges: hasUnsavedChangesMock,
        sessionRevision: sessionRevisionRef,
      },
      store: {
        state: {
          id: "scenario-1",
        },
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  async function mountWrapper(initialPath = "/scenario/scenario-1") {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/scenario/:scenarioId",
          component: ScenarioEditorWrapper,
          props: true,
        },
        {
          path: "/other",
          component: defineComponent({ template: "<div data-testid='other-page' />" }),
        },
      ],
    });

    await router.push(initialPath);
    await router.isReady();

    const wrapper = mount(
      defineComponent({
        template: "<router-view />",
      }),
      {
        global: {
          plugins: [router],
          stubs: {
            ScenarioEditor: {
              template: "<div data-testid='scenario-editor' />",
            },
            ScenarioNotFoundPage: {
              template: "<div data-testid='scenario-not-found' />",
            },
            ScenarioLeavePromptModal: ScenarioLeavePromptModalStub,
            ScenarioDraftRecoveryModal: ScenarioDraftRecoveryModalStub,
          },
        },
      },
    );

    await flushAll();
    return { wrapper, router };
  }

  it("flushes drafts and leaves without prompting when the saved baseline is clean", async () => {
    const { wrapper, router } = await mountWrapper();

    await router.push("/other");
    await flushAll();

    expect(flushDraftMock).toHaveBeenCalled();
    expect(wrapper.find("[data-testid='leave-prompt']").exists()).toBe(false);
    expect(router.currentRoute.value.fullPath).toBe("/other");
  });

  it("prompts before leaving when there are unsaved canonical changes", async () => {
    const { wrapper, router } = await mountWrapper();
    savedDirtyRef.value = true;

    const navigation = router.push("/other");
    await flushAll();

    expect(wrapper.find("[data-testid='leave-prompt']").exists()).toBe(true);

    await wrapper.get("[data-testid='leave-discard']").trigger("click");
    await navigation;
    await flushAll();

    expect(discardDraftMock).toHaveBeenCalled();
    expect(router.currentRoute.value.fullPath).toBe("/other");
  });

  it("offers draft recovery when a newer recovery draft exists", async () => {
    const savedScenario = createScenario("scenario-1", "Saved");
    const draftScenario = createScenario("scenario-1", "Draft");
    loadScenarioMock.mockResolvedValue(savedScenario);
    getNewerDraftMock.mockResolvedValue({
      scenarioId: "scenario-1",
      scenario: draftScenario,
      updatedAt: Date.now(),
    });

    const { wrapper } = await mountWrapper();

    expect(wrapper.find("[data-testid='draft-recovery']").exists()).toBe(true);

    await wrapper.get("[data-testid='draft-restore']").trigger("click");
    await flushAll();

    expect(loadFromObjectMock).toHaveBeenNthCalledWith(2, draftScenario, {
      loadedBaseline: savedScenario,
      savedBaseline: savedScenario,
    });
  });

  it("kicks off a best-effort draft flush on pagehide and beforeunload", async () => {
    await mountWrapper();

    window.dispatchEvent(new Event("pagehide"));
    window.dispatchEvent(new Event("beforeunload", { cancelable: true }));
    await flushAll();

    expect(flushDraftMock).toHaveBeenCalledTimes(2);
  });

  it("uses the synchronous unsaved-change check during beforeunload", async () => {
    await mountWrapper();
    savedDirtyRef.value = false;
    hasUnsavedChangesMock.mockReturnValue(true);

    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    await flushAll();

    expect(flushDraftMock).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });
});
