import fuzzysort from "fuzzysort";
import { groupBy, htmlTagEscape } from "@/utils";
import { useSymbologyData } from "@/composables/symbolData";
import { type Ref } from "vue";

export interface SymbolSearchResult {
  category: "Main icon" | "Modifier 1" | "Modifier 2";
  index: number;
  sidc: string;
  code: string;
  text: string;
  name: string;
  score: number;
  highlight: string;
}

export interface MainIconSearchResult extends SymbolSearchResult {
  category: "Main icon";
}

export interface ModifierOneSearchResult extends SymbolSearchResult {
  category: "Modifier 1";
}

export interface ModifierTwoSearchResult extends SymbolSearchResult {
  category: "Modifier 2";
}

export function useSymbologySearch(sidValue: Ref<string>) {
  const { searchSymbolRef, searchModifierOneRef, searchModifierTwoRef } =
    useSymbologyData();

  function searchMainIcons(query: string): MainIconSearchResult[] {
    const h = fuzzysort.go(query, searchSymbolRef.value || [], {
      key: "text",
      limit: 10,
    });

    return h.map((e, i) => {
      const { obj, ...rest } = e;
      return {
        code: obj.code,
        text: obj.text,
        symbolSet: obj.symbolSet,
        name: obj.name,
        score: e.score,
        category: "Main icon",
        index: i,
        highlight:
          fuzzysort.highlight({ ...rest, target: htmlTagEscape(rest.target) }) || "",
        sidc: "100" + sidValue.value + e.obj.symbolSet + "0000" + e.obj.code + "0000",
      };
    });
  }
  function searchModifierOne(query: string): ModifierOneSearchResult[] {
    const h = fuzzysort.go(query, searchModifierOneRef.value || [], {
      key: "text",
      limit: 10,
    });
    return h.map((e, i) => {
      const { obj, ...rest } = e;
      return {
        code: obj.code,
        text: obj.text,
        symbolSet: obj.symbolSet,
        name: obj.name,
        score: e.score * 10,
        category: "Modifier 1",
        index: i,
        highlight:
          fuzzysort.highlight({ ...rest, target: htmlTagEscape(rest.target) }) || "",
        sidc:
          "100" +
          sidValue.value +
          e.obj.symbolSet +
          "0000" +
          "000000" +
          e.obj.code +
          "00",
      };
    });
  }
  function searchModifierTwo(query: string): ModifierTwoSearchResult[] {
    const h = fuzzysort.go(query, searchModifierTwoRef.value || [], {
      key: "text",
      limit: 10,
    });
    return h.map((e, i) => {
      const { obj, ...rest } = e;
      return {
        code: obj.code,
        text: obj.text,
        symbolSet: obj.symbolSet,
        name: obj.name,
        score: e.score * 10,
        category: "Modifier 2",
        index: i,
        highlight:
          fuzzysort.highlight({ ...rest, target: htmlTagEscape(rest.target) }) || "",
        sidc:
          "100" +
          sidValue.value +
          e.obj.symbolSet +
          "0000" +
          "000000" +
          "00" +
          e.obj.code,
      };
    });
  }

  function combineHits(
    hits: (
      | MainIconSearchResult[]
      | ModifierOneSearchResult[]
      | ModifierTwoSearchResult[]
    )[],
  ) {
    const combinedHits = hits.sort((a, b) => {
      const scoreA = a[0]?.score ?? 1000;
      const scoreB = b[0]?.score ?? 1000;
      return scoreB - scoreA;
    });
    return [...combinedHits.flat()].map((e, index) => ({
      ...e,
      index,
    }));
  }

  function search(query: string) {
    const mainIconHits = searchMainIcons(query);
    const modifierOneHits = searchModifierOne(query);
    const modifierTwoHits = searchModifierTwo(query);

    const allHits = combineHits([mainIconHits, modifierOneHits, modifierTwoHits]);
    const numberOfHits =
      mainIconHits.length + modifierOneHits.length + modifierTwoHits.length;
    return { numberOfHits, groups: groupBy(allHits, "category") };
  }

  return { search };
}
