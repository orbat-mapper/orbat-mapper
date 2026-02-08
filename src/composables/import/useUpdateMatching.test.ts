import { describe, it, expect } from "vitest";
import { useUpdateMatching } from "./useUpdateMatching";
import { computed, ref } from "vue";
import type { NUnit } from "@/types/internalModels";

describe("useUpdateMatching", () => {
  it("preserves existing echelon when new SIDC has unspecified echelon", () => {
    // 1. Setup Data
    const row = { id: "1", name: "Unit A", icon: "123456" };
    const data = ref([row]);

    // New SIDC with echelon '00' (indices 8,9) AND different entity/icon (last digit 1)
    // 10031000001211000001 -> 8,9 are '00'
    const newSidc = "10031000001211000001";
    const mappedData = ref([
      {
        id: "1",
        name: "Unit A",
        sidc: newSidc,
      } as Record<string, unknown>,
    ]);

    // Existing Unit with echelon '16' (indices 8,9)
    // 10031000161211000000
    const existingSidc = "10031000161211000000";
    const existingUnit: NUnit = {
      id: "1",
      name: "Unit A",
      sidc: existingSidc,
      subUnits: [],
    } as unknown as NUnit;

    const units = computed(() => [existingUnit]);
    const unitMap = { "1": existingUnit };

    // 2. Options
    const matchMode = ref<"id" | "name">("id");
    const matchField = ref("id");
    const updateFields = ref(["sidc"]);

    // 3. Execute
    const { matchedResults } = useUpdateMatching({
      data,
      mappedData,
      matchMode,
      matchField,
      updateFields,
      units,
      unitMap,
    });

    // 4. Verify
    const result = matchedResults.value[0];
    expect(result).toBeDefined();
    expect(result.changes.sidc).toBeDefined();

    // The new SIDC should have the echelon preserved from the existing one
    // New: 1003100000...01 -> Preserved: 1003100016...01
    const expectedSidc = "10031000161211000001";
    expect(result.changes.sidc.new).toBe(expectedSidc);
  });

  it("does not overwrite if new SIDC has specified echelon", () => {
    // 1. Setup Data
    const row = { id: "1", name: "Unit A", icon: "123456" };
    const data = ref([row]);

    // New SIDC with specific echelon '22'
    const newSidc = "10031000221211000000";
    const mappedData = ref([
      {
        id: "1",
        name: "Unit A",
        sidc: newSidc,
      } as Record<string, unknown>,
    ]);

    // Existing Unit with echelon '16'
    const existingSidc = "10031000161211000000";
    const existingUnit: NUnit = {
      id: "1",
      name: "Unit A",
      sidc: existingSidc,
      subUnits: [],
    } as unknown as NUnit;

    const units = computed(() => [existingUnit]);
    const unitMap = { "1": existingUnit };

    // 2. Options
    const matchMode = ref<"id" | "name">("id");
    const matchField = ref("id");
    const updateFields = ref(["sidc"]);

    // 3. Execute
    const { matchedResults } = useUpdateMatching({
      data,
      mappedData,
      matchMode,
      matchField,
      updateFields,
      units,
      unitMap,
    });

    // 4. Verify
    const result = matchedResults.value[0];
    // Should keep the new echelon '22'
    expect(result.changes.sidc.new).toBe(newSidc);
  });
});
