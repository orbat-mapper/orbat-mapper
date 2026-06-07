/**
 * Lists the differences between the MIL-STD-2525 D and E symbology data
 * (src/symbology/standards/milstd2525.ts vs milstd2525e.ts) as plain text.
 *
 * Run with:  node scripts/diff-milstd.mjs   (or `pnpm diff:milstd`)
 *
 * Flags:
 *   --summary   Only print the per-set / total counts, not every entry.
 *
 * For an HTML version see scripts/diff-milstd-report.mjs (`pnpm diff:milstd:html`).
 */

import { computeDiff, modifierLabel } from "./lib/milstd-diff.mjs";

const summaryOnly = process.argv.includes("--summary");
const diff = await computeDiff();
const lines = [];

function emitSection(title, section) {
  const { added, removed, changed, recoded, relocated } = section;
  if (
    !added.length &&
    !removed.length &&
    !changed.length &&
    !recoded.length &&
    !relocated.length
  )
    return;
  lines.push(`  ${title}:`);
  if (summaryOnly) {
    lines.push(
      `    +${added.length} added  -${removed.length} removed` +
        `  ~${changed.length} changed  »${recoded.length} recoded` +
        `  →${relocated.length} to-common`,
    );
    return;
  }
  for (const a of added) lines.push(`    + [${a.code}] ${a.label}`);
  for (const r of removed) lines.push(`    - [${r.code}] ${r.label}`);
  for (const c of changed) lines.push(`    ~ [${c.code}] ${c.from}  ->  ${c.to}`);
  for (const r of recoded) lines.push(`    » [${r.from} -> ${r.to}] ${r.label}`);
  for (const r of relocated)
    lines.push(`    → [${r.code}] ${r.label}  (moved to common table)`);
}

console.log("MIL-STD-2525 D → E differences\n");

if (diff.onlyInD.length) {
  console.log("Symbol sets only in 2525D:");
  for (const s of diff.onlyInD) console.log(`  - ${s.key} (${s.name})`);
  console.log("");
}
if (diff.onlyInE.length) {
  console.log("Symbol sets only in 2525E:");
  for (const s of diff.onlyInE) console.log(`  + ${s.key} (${s.name})`);
  console.log("");
}

for (const set of diff.sets) {
  if (set.changeCount === 0) continue;
  const header = `Symbol set ${set.key}: ${set.name}`;
  lines.push("");
  lines.push(set.prevName ? `${header} (was "${set.prevName}")` : header);
  emitSection("Main icons", set.sections.mainIcon);
  emitSection("Modifier 1", set.sections.modifierOne);
  emitSection("Modifier 2", set.sections.modifierTwo);
}

console.log(lines.join("\n").replace(/^\n/, ""));

console.log(
  `\nNew in 2525E — shared common modifier table` +
    ` (${diff.common.modifierOne.length} modifier 1, ${diff.common.modifierTwo.length} modifier 2):`,
);
if (!summaryOnly) {
  for (const m of diff.common.modifierOne)
    console.log(`  + [${m.code}] ${modifierLabel(m)}  (mod 1)`);
  for (const m of diff.common.modifierTwo)
    console.log(`  + [${m.code}] ${modifierLabel(m)}  (mod 2)`);
}

const t = diff.totals;
console.log(
  `\nTotals: +${t.added} added  -${t.removed} removed` +
    `  ~${t.changed} changed  »${t.recoded} recoded  →${t.relocated} to-common` +
    `  (${diff.onlyInD.length} sets only in D, ${diff.onlyInE.length} only in E)`,
);
