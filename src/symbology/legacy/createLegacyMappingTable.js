import fs from "fs/promises";
import { csvParseRows, csvParse } from "d3-dsv";

const INPUT_FILE =
  "../../../../joint-military-symbology-xml/samples/legacy_support/LegacyMappingTableCtoD.csv";

async function loadData() {
  try {
    const data = await fs.readFile(INPUT_FILE, { encoding: "utf8" });
    return csvParse(data);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

const data = await loadData();

function replaceCharAt(text, index, replacementChar) {
  return text.substring(0, index) + replacementChar + text.substring(index + 1);
}

const c = data
  .map((line) => {
    const letters = normalizeLetterCode(line["2525Charlie1stTen"]);
    const b = line["DeltaToCharlie"];
    const symbolSet = line["2525DeltaSymbolSet"];
    // Is symbol retired?
    if (symbolSet === "98") return;
    const rev = normalizeLetterCode(b).slice(0, 10);
    const numbers = `${line["2525DeltaEntity"]}${line["2525DeltaMod1"] || "00"}${
      line["2525DeltaMod2"] || "00"
    }`;
    // return `${letters} -> ${numbers}`;
    return rev && rev !== letters
      ? [letters, symbolSet, numbers, rev]
      : [letters, symbolSet, numbers];
  })
  .filter((e) => e) // remove empty entries
  .sort((aa, bb) => {
    // sort by letter SIDC
    const a = aa[0];
    const b = bb[0];
    return a < b ? -1 : a > b ? 1 : 0;
  });

function normalizeLetterCode(sidc) {
  return replaceCharAt(replaceCharAt(sidc, 3, "*"), 1, "*");
}

await fs.writeFile("./test.json", JSON.stringify(c));
// console.log(JSON.stringify(c, null, 2));
console.log(c);
