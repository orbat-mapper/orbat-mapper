/**
 * Generates a standalone, self-contained HTML report of the differences
 * between the MIL-STD-2525 D and E symbology data.
 *
 * Run with:  node scripts/diff-milstd-report.mjs   (or `pnpm diff:milstd:html`)
 * Output:    reports/milstd-2525-diff.html
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import ms from "milsymbol";
import { computeDiff, modifierLabel, norm } from "./lib/milstd-diff.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../reports");
const OUT_FILE = resolve(OUT_DIR, "milstd-2525-diff.html");

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const chip = (code) => `<span class="code">${esc(code)}</span>`;

/** Split a SIDC into 10-digit sets (A · B · C) for readability. Separator is non-selectable. */
function formatSidc(sidc) {
  const parts = [];
  for (let i = 0; i < sidc.length; i += 10)
    parts.push(`<span class="sidc-set sidc-s${Math.floor(i / 10) + 1}">${esc(sidc.slice(i, i + 10))}</span>`);
  return parts.join(`<span class="sidc-dot" aria-hidden="true">·</span>`);
}

// ---- milsymbol icons -----------------------------------------------------
// Pre-render the main-icon symbols to inline SVG so the report stays a single
// self-contained file. Modifiers are amplifiers, not standalone symbols, so
// only main-icon rows get an icon. milsymbol's 2525 icon table already covers
// 2525E entities, so each symbol is stamped with the SIDC of the edition the
// entry belongs to: 2525E uses version "13" and the canonical 30-digit form,
// 2525D uses version "10" and the 20-digit form. (For a base main icon with no
// modifiers the two render an identical glyph — the extra 10 digits of the
// 30-digit form only carry 3-digit modifiers and frame shape — but the longer
// SIDC is the correct 2525E representation.)
const VERSION = { D: "10", E: "13" };
const symCache = new Map();

const sidcFor = (symbolSet, code, edition = "E") => {
  // 20-digit: version(2) ctx(1) affil(1) set(2) status/hqtf/amp(4) entity(6) mod1(2) mod2(2)
  const sidc20 = `${VERSION[edition]}03${symbolSet}0000${code}0000`;
  // 2525E extends to 30 digits (mod hundreds-digits + frame shape + amplifiers).
  return edition === "E" ? `${sidc20}0000000000` : sidc20;
};

// Render a SIDC to milsymbol SVG, caching by SIDC. A symbol with no real icon
// renders as just the bare frame — keep it; it still communicates
// affiliation/dimension, which is the useful signal.
function cachedSvg(sidc) {
  if (symCache.has(sidc)) return symCache.get(sidc);
  let svg = "";
  try {
    svg = new ms.Symbol(sidc, { size: 18, frame: true }).asSVG();
    if (!svg.includes("<")) svg = "";
  } catch {
    svg = "";
  }
  symCache.set(sidc, svg);
  return svg;
}

/**
 * Build a 20-digit SIDC from a symbol set, a 6-digit main-icon code and the
 * edition ("D" | "E"), and return its milsymbol SVG (friend affiliation), or
 * "" when the code isn't a concrete icon (ranges like "25-99", reserved
 * placeholders, etc.).
 */
function symbolSvg(symbolSet, code, edition = "E") {
  if (!/^\d{6}$/.test(code)) return "";
  return cachedSvg(sidcFor(symbolSet, code, edition));
}

// ---- modifier amplifiers -------------------------------------------------
// Modifiers are amplifiers, not standalone symbols, so to preview each one we
// stamp it onto an otherwise-bare frame using a 30-digit 2525E SIDC. A modifier
// code is placed in the sector-one (pos 17-18) or sector-two (pos 19-20) field;
// any hundreds digit (the shared common modifiers are coded 100+) goes in the
// matching common-modifier position (pos 21 / 22). Example:
//   13 03 10 0 0 00 000000 | 07 00 | 1 0 | 0 0000 000
//   └ver └aff└set│ │ └ech  └entity  m1 m2  c1c2 └frame └genc
// encodes common modifier-one 107 (Armored) on a friend land-unit frame.
//
// Set-specific modifiers (1- or 2-digit codes) render on their own symbol set;
// the shared common modifiers, which apply across every set, are stamped onto a
// representative Land-unit (set 10) frame.
const COMMON_SET = "10";

function modifierSidc(symbolSet, code, sector, edition = "E") {
  const xy = code.slice(-2).padStart(2, "0"); // tens+units → sector modifier field
  const hundreds = code.length > 2 ? code.slice(0, -2) : "0"; // → common-modifier digit
  const mod1 = sector === 1 ? xy : "00";
  const mod2 = sector === 2 ? xy : "00";
  const ver = VERSION[edition];
  if (edition === "D") {
    //  ver  ctx/aff  set        st  hq ech entity     m1    m2
    return `${ver}03${symbolSet}0000000000${mod1}${mod2}`;
  }
  const common1 = sector === 1 ? hundreds : "0";
  const common2 = sector === 2 ? hundreds : "0";
  //  ver  ctx/aff  set        st  hq ech entity     m1    m2   c1       c2       frame rsv    genc
  return `${ver}03${symbolSet}0000000000${mod1}${mod2}${common1}${common2}00000000`;
}

/** milsymbol SVG for a modifier amplifier in the given sector (1|2). */
function modifierSvg(symbolSet, code, sector, edition = "E") {
  if (!/^\d{1,3}$/.test(code)) return "";
  return cachedSvg(modifierSidc(symbolSet, code, sector, edition));
}

// null        -> not applicable (modifier rows): empty cell
// ""          -> main icon with no concrete glyph (ranges/reserved): dash
// svg string  -> the rendered symbol
// {d, e}      -> two icons side-by-side (relocated modifier rows)
const symCell = (svg) => {
  if (svg == null) return `<span class="sym"></span>`;
  if (typeof svg === "object") {
    const iconD = svg.d || '<span class="sym-none">—</span>';
    const iconE = svg.e || '<span class="sym-none">—</span>';
    return `<span class="sym sym-pair">${iconD}<span class="sym-arrow">→</span>${iconE}</span>`;
  }
  return `<span class="sym">${svg || '<span class="sym-none">—</span>'}</span>`;
};

// Field layout for the drawer / field-level diff, per entry kind.
const ICON_FIELDS = [
  ["Entity", "entity"],
  ["Type", "entityType"],
  ["Subtype", "entitySubtype"],
  ["Geometry", "geometry"],
  ["Remarks", "remarks"],
];
const MOD_FIELDS = [
  ["Modifier", "modifier"],
  ["Category", "category"],
  ["Remarks", "remarks"],
];

/** A `<dl>` of every populated field on one entry, for the expand drawer. */
function entryFields(entry, isIcon) {
  if (!entry) return `<p class="ed-none">— absent —</p>`;
  const fields = isIcon ? ICON_FIELDS : MOD_FIELDS;
  const rows = fields
    .filter(([, k]) => entry[k])
    .map(([lbl, k]) => `<dt>${lbl}</dt><dd>${esc(entry[k])}</dd>`)
    .concat(`<dt>Code</dt><dd class="mono">${esc(entry.code)}</dd>`);
  return `<dl class="fields">${rows.join("")}</dl>`;
}

/** Field-level diff between a D and E entry; returns { html, search }. */
function fieldDiff(d, e, isIcon) {
  const fields = isIcon ? ICON_FIELDS : MOD_FIELDS;
  const parts = [];
  let search = "";
  for (const [lbl, k] of fields) {
    const a = (d && d[k]) || "";
    const b = (e && e[k]) || "";
    if (norm(a) === norm(b)) continue; // ignore whitespace-only differences
    const from = a
      ? `<span class="from">${esc(a)}</span>`
      : `<span class="empty">∅</span>`;
    const to = b ? `<span class="to">${esc(b)}</span>` : `<span class="empty">∅</span>`;
    parts.push(
      `<span class="fd"><span class="fk">${lbl}</span>${from}<span class="arrow">→</span>${to}</span>`,
    );
    search += " " + a + " " + b;
  }
  if (!parts.length) parts.push(`<span class="to">relabelled</span>`);
  return { html: `<span class="fielddiff">${parts.join("")}</span>`, search };
}

/**
 * One edition column in the drawer: its own symbol rendered from that
 * edition's SIDC (2525D → 20-digit version 10, 2525E → 30-digit version 13),
 * the SIDC string, and the full field list. For a `changed` row this shows the
 * D and E symbols side by side; for `recoded` (different codes) they can differ.
 */
function editionCol(entry, edition, isIcon, symbolSet, modSector) {
  let sym = "";
  if (modSector) {
    const svg = modifierSvg(symbolSet, entry.code, modSector, edition);
    sym =
      `<div class="ed-sym">` +
      (svg ? `<div class="drawer-sym">${svg}</div>` : `<span class="sym-none">—</span>`) +
      `<code class="sidc">${formatSidc(modifierSidc(symbolSet, entry.code, modSector, edition))}</code>` +
      `</div>`;
  } else if (isIcon && /^\d{6}$/.test(entry.code)) {
    const svg = symbolSvg(symbolSet, entry.code, edition);
    sym =
      `<div class="ed-sym">` +
      (svg ? `<div class="drawer-sym">${svg}</div>` : `<span class="sym-none">—</span>`) +
      `<code class="sidc">${formatSidc(sidcFor(symbolSet, entry.code, edition))}</code>` +
      `</div>`;
  }
  const ed = edition === "D" ? "d" : "e";
  const digits = modSector
    ? ` · ${edition === "E" ? 30 : 20}-digit SIDC`
    : isIcon
      ? ` · ${edition === "E" ? 30 : 20}-digit SIDC`
      : "";
  return (
    `<div class="ed ed-${ed}">` +
    `<h6>2525${edition}${digits}</h6>${sym}${entryFields(entry, isIcon)}</div>`
  );
}

/** Expandable detail drawer: per-edition symbol + SIDC + full fields. */
function drawer({ d, e, isIcon, symbolSet, modSector, commonMatch }) {
  const cols = [];
  if (d) cols.push(editionCol(d, "D", isIcon, symbolSet, modSector));
  if (e) cols.push(editionCol(e, "E", isIcon, symbolSet, modSector));
  // Relocated modifier: no E entry in this set, but show the common-table entry as the E side.
  // Use the same symbolSet as the D entry so both columns share the same frame shape.
  if (!e && commonMatch)
    cols.push(editionCol(commonMatch, "E", false, symbolSet, commonMatch.sector));
  return `<div class="drawer"><div class="ed-cols">${cols.join("")}</div></div>`;
}

/**
 * Assemble one expandable diff row from a descriptor.
 * o: { type, glyph, isIcon, symbolSet, code, fromCode?, toCode?, label?,
 *      d?, e?, changed?, tag?, commonMatch? }
 */
function buildRow(o) {
  const { type, glyph, isIcon, symbolSet } = o;
  const iconCode = o.toCode || o.code;
  // removed/relocated entries belong to 2525D; everything else to 2525E.
  const edition = type === "removed" || type === "relocated" ? "D" : "E";

  // For relocated modifier rows show the D and E (common) icons side-by-side.
  let symHtml;
  if (o.modSector && type === "relocated" && o.commonMatch) {
    symHtml = modifierSvg(symbolSet, o.commonMatch.code, o.commonMatch.sector, "E");
  } else if (o.modSector) {
    symHtml = modifierSvg(symbolSet, iconCode, o.modSector, edition);
  } else if (isIcon) {
    symHtml = symbolSvg(symbolSet, iconCode, edition);
  } else {
    symHtml = null;
  }
  const codeHtml = o.fromCode
    ? `${chip(o.fromCode)}<span class="arrow">→</span>${chip(o.toCode)}`
    : chip(o.code);

  let labelHtml;
  let search;
  if (o.changed) {
    const fd = fieldDiff(o.d, o.e, isIcon);
    labelHtml = fd.html;
    search = o.code + fd.search;
  } else {
    labelHtml = `<span class="lbl">${esc(o.label)}</span>`;
    search = (o.fromCode ? `${o.fromCode} ${o.toCode}` : o.code) + " " + o.label;
    const rem = (o.e || o.d)?.remarks;
    if (rem) {
      labelHtml += `<span class="remark">${esc(rem)}</span>`;
      search += " " + rem;
    }
  }
  if (o.tag) labelHtml += `<span class="tag">${o.tag}</span>`;

  const detail = drawer({
    d: o.d,
    e: o.e,
    isIcon,
    symbolSet,
    modSector: o.modSector,
    commonMatch: o.commonMatch,
  });

  return (
    `<li class="row ${type}" data-type="${type}" data-q="${esc(search.toLowerCase())}">` +
    `<button type="button" class="row-head">` +
    `<span class="glyph">${glyph}</span>` +
    symCell(symHtml) +
    `<span class="codes">${codeHtml}</span>` +
    `<span class="label">${labelHtml}</span>` +
    `<span class="expand" aria-hidden="true">+</span>` +
    `</button>` +
    `<div class="drawer-wrap">${detail}</div>` +
    `</li>`
  );
}

/** Include all entries regardless of geometry. */
function includeByGeometry(entry) {
  return true;
}

/**
 * @param {string} title    section heading
 * @param {object} s        diff section
 * @param {object} opts      { symbolSet, modSector } — main-icon sections pass
 *                           just the set key; modifier sections also pass the
 *                           sector (1|2) so each amplifier renders its glyph.
 */
function renderSection(title, s, { symbolSet, modSector } = {}) {
  const isIcon = !!symbolSet && !modSector;
  const ctx = { isIcon, symbolSet, modSector };
  const rows = [];
  for (const a of s.added.filter((a) => includeByGeometry(a.e)))
    rows.push(
      buildRow({
        ...ctx,
        type: "added",
        glyph: "+",
        code: a.code,
        label: a.label,
        e: a.e,
      }),
    );
  for (const r of s.removed.filter((r) => includeByGeometry(r.d)))
    rows.push(
      buildRow({
        ...ctx,
        type: "removed",
        glyph: "&minus;",
        code: r.code,
        label: r.label,
        d: r.d,
      }),
    );
  for (const c of s.changed.filter(
    (c) => includeByGeometry(c.d) || includeByGeometry(c.e),
  ))
    rows.push(
      buildRow({
        ...ctx,
        type: "changed",
        glyph: "~",
        code: c.code,
        d: c.d,
        e: c.e,
        changed: true,
      }),
    );
  for (const r of s.recoded.filter(
    (r) => includeByGeometry(r.d) || includeByGeometry(r.e),
  ))
    rows.push(
      buildRow({
        ...ctx,
        type: "recoded",
        glyph: "»",
        fromCode: r.from,
        toCode: r.to,
        label: r.label,
        d: r.d,
        e: r.e,
      }),
    );
  for (const r of s.relocated.filter((r) => includeByGeometry(r.d)))
    rows.push(
      buildRow({
        ...ctx,
        type: "relocated",
        glyph: "→",
        code: r.code,
        label: r.label,
        d: r.d,
        commonMatch: r.commonMatch,
        tag: "to common",
      }),
    );

  if (!rows.length) return "";
  return (
    `<div class="subsection">` +
    `<h4 class="subhead">${esc(title)} <span class="n">${rows.length}</span></h4>` +
    `<ul class="rows">${rows.join("")}</ul>` +
    `</div>`
  );
}

const TYPES = [
  ["added", "Added", "New in 2525E"],
  ["removed", "Removed", "Gone from 2525E"],
  ["changed", "Changed", "Same code, new label"],
  ["recoded", "Recoded", "Same label, new code"],
  ["relocated", "To common", "Moved to shared table"],
];

function badge(type, n) {
  return n
    ? `<span class="badge ${type}" title="${esc(TYPES.find((t) => t[0] === type)[1])}">${n}</span>`
    : "";
}

const setBadges = (set) => TYPES.map(([t]) => badge(t, set.counts[t])).join("");

function renderSet(set) {
  const body = [
    renderSection("Main icons", set.sections.mainIcon, { symbolSet: set.key }),
    renderSection("Modifier 1", set.sections.modifierOne, {
      symbolSet: set.key,
      modSector: 1,
    }),
    renderSection("Modifier 2", set.sections.modifierTwo, {
      symbolSet: set.key,
      modSector: 2,
    }),
  ].join("");
  const was = set.prevName ? `<span class="was">was “${esc(set.prevName)}”</span>` : "";
  return (
    `<details class="set" open id="set-${esc(set.key)}">` +
    `<summary>` +
    `<span class="set-code">${esc(set.key)}</span>` +
    `<span class="set-name">${esc(set.name)}${was}` +
    `<span class="dim">${esc(set.dimension)}</span></span>` +
    `<span class="set-badges">${setBadges(set)}</span>` +
    `<span class="chev" aria-hidden="true">▾</span>` +
    `</summary>` +
    `<div class="set-body">${body}</div>` +
    `</details>`
  );
}

function renderCommon(common) {
  const rows = [
    ...common.modifierOne.map((m) => [1, m]),
    ...common.modifierTwo.map((m) => [2, m]),
  ].map(([sector, m]) =>
    buildRow({
      isIcon: false,
      symbolSet: COMMON_SET,
      modSector: sector,
      type: "added",
      glyph: "+",
      code: m.code,
      label: modifierLabel(m),
      e: m,
      tag: `mod ${sector}`,
    }),
  );
  return `<ul class="rows">${rows.join("")}</ul>`;
}

const sidcRefHtml = `
<h2 class="sectionhead"><span class="hash">§</span> SIDC reference · 30-position structure</h2>
<details class="set" id="sidc-ref">
  <summary>
    <span class="set-code">SIDC</span>
    <span class="set-name">Symbol Identification Code
      <span class="was">Appendix A · MIL-STD-2525E w/Change 1 · pp. 57–69</span>
    </span>
    <span class="set-badges"></span>
    <span class="chev" aria-hidden="true">▾</span>
  </summary>
  <div class="set-body sidc-ref-body">
    <p class="sidc-lede">A 30-position hexadecimal code (digits 0–9, A–F) split into three 10-position sets. Together they fully specify a joint military symbol — its identity, icon, modifiers, frame shape, and nationality.</p>

    <div class="sidc-diagram">
      <div class="sdb-group sdb-a">
        <div class="sdb-label">Set A · positions 1–10</div>
        <div class="sdb-cells">
          <div class="sdb-cell" style="flex:2"><span class="sdb-top">1–2</span><div class="sdb-bot">Version</div></div>
          <div class="sdb-cell" style="flex:2"><span class="sdb-top">3–4</span><div class="sdb-bot">Std Identity</div></div>
          <div class="sdb-cell" style="flex:2"><span class="sdb-top">5–6</span><div class="sdb-bot">Symbol Set</div></div>
          <div class="sdb-cell" style="flex:1"><span class="sdb-top">7</span><div class="sdb-bot">Status</div></div>
          <div class="sdb-cell" style="flex:1"><span class="sdb-top">8</span><div class="sdb-bot">HQ/TF/Dmmy</div></div>
          <div class="sdb-cell" style="flex:2"><span class="sdb-top">9–10</span><div class="sdb-bot">Amp. Desc.</div></div>
        </div>
      </div>
      <div class="sdb-group sdb-b">
        <div class="sdb-label">Set B · positions 11–20</div>
        <div class="sdb-cells">
          <div class="sdb-cell" style="flex:2"><span class="sdb-top">11–12</span><div class="sdb-bot">Entity</div></div>
          <div class="sdb-cell" style="flex:2"><span class="sdb-top">13–14</span><div class="sdb-bot">Ent. Type</div></div>
          <div class="sdb-cell" style="flex:2"><span class="sdb-top">15–16</span><div class="sdb-bot">Ent. Subtype</div></div>
          <div class="sdb-cell" style="flex:2"><span class="sdb-top">17–18</span><div class="sdb-bot">Sector 1</div></div>
          <div class="sdb-cell" style="flex:2"><span class="sdb-top">19–20</span><div class="sdb-bot">Sector 2</div></div>
        </div>
      </div>
      <div class="sdb-group sdb-c">
        <div class="sdb-label">Set C · positions 21–30</div>
        <div class="sdb-cells">
          <div class="sdb-cell" style="flex:1"><span class="sdb-top">21</span><div class="sdb-bot">C1 Mod</div></div>
          <div class="sdb-cell" style="flex:1"><span class="sdb-top">22</span><div class="sdb-bot">C2 Mod</div></div>
          <div class="sdb-cell" style="flex:1"><span class="sdb-top">23</span><div class="sdb-bot">Frame</div></div>
          <div class="sdb-cell sdb-reserved" style="flex:4"><span class="sdb-top">24–27</span><div class="sdb-bot">Reserved</div></div>
          <div class="sdb-cell" style="flex:3"><span class="sdb-top">28–30</span><div class="sdb-bot">GENC</div></div>
        </div>
      </div>
    </div>

    <div class="sidc-example">
      <span class="sidc-ex-label">Example (2525E · friend land unit · present):</span>
      <code class="sidc"><span class="sidc-set sidc-s1">1303100000</span><span class="sidc-dot" aria-hidden="true">·</span><span class="sidc-set sidc-s2">0000000000</span><span class="sidc-dot" aria-hidden="true">·</span><span class="sidc-set sidc-s3">0300000840</span></code>
    </div>

    <div class="sidc-sets-wrap">
      <div class="sidc-set-block sa">
        <h5>Set A · Identity &amp; Context</h5>
        <ul class="sidc-fl">
          <li><span class="sfl-pos">1–2</span><span class="sfl-body"><strong>Version</strong><span>Edition of the standard. <code class="sfl-code">13</code> = 2525E, <code class="sfl-code">15</code> = 2525E w/Change 1.</span></span></li>
          <li><span class="sfl-pos">3–4</span><span class="sfl-body"><strong>Standard Identity</strong><span>Two digits: <em>Context</em> (reality / exercise / simulation / restricted / no-strike) and <em>Affiliation</em> (pending / unknown / assumed friend / friend / neutral / suspect / hostile).</span></span></li>
          <li><span class="sfl-pos">5–6</span><span class="sfl-body"><strong>Symbol Set</strong><span>Operational domain — <code class="sfl-code">01</code> Air, <code class="sfl-code">10</code> Land Unit, <code class="sfl-code">25</code> Control Measures, <code class="sfl-code">30</code> Sea Surface, <code class="sfl-code">60</code> Cyberspace.</span></span></li>
          <li><span class="sfl-pos">7</span><span class="sfl-body"><strong>Status</strong><span>Present / planned / anticipated / fully capable / damaged / destroyed / full to capacity.</span></span></li>
          <li><span class="sfl-pos">8</span><span class="sfl-body"><strong>HQ / Task Force / Dummy</strong><span>Selects graphic modifier bracket, staff indicator, or feint indicator (values 0–7).</span></span></li>
          <li><span class="sfl-pos">9–10</span><span class="sfl-body"><strong>Amplifying Descriptor</strong><span>Common graphic amplifier: echelon (team → brigade), mobility type (tracked / wheeled / towed / amphibious), naval towed array, or dismounted leader.</span></span></li>
        </ul>
      </div>
      <div class="sidc-set-block sb">
        <h5>Set B · Icon &amp; Modifiers</h5>
        <ul class="sidc-fl">
          <li><span class="sfl-pos">11–12</span><span class="sfl-body"><strong>Entity</strong><span>First-order military function — broad grouping such as maneuver, fires, or support.</span></span></li>
          <li><span class="sfl-pos">13–14</span><span class="sfl-body"><strong>Entity Type</strong><span>Second-order function — specific system or role (e.g., fighter aircraft, tank, air-defense launcher).</span></span></li>
          <li><span class="sfl-pos">15–16</span><span class="sfl-body"><strong>Entity Subtype</strong><span>Most-specific discriminator (e.g., armored, heavy, MEDEVAC). Software renders the lowest non-zero tier in the 11–16 hierarchy.</span></span></li>
          <li><span class="sfl-pos">17–18</span><span class="sfl-body"><strong>Sector 1 Modifier</strong><span>Abstract pictorial or alphanumeric component displayed in the upper graphic sector inside the frame.</span></span></li>
          <li><span class="sfl-pos">19–20</span><span class="sfl-body"><strong>Sector 2 Modifier</strong><span>Component in the lower graphic sector. Positions 13–20 are <code class="sfl-code">0</code>-padded when the entity is "Unspecified".</span></span></li>
        </ul>
      </div>
      <div class="sidc-set-block sc">
        <h5>Set C · Frame, Metadata &amp; Nationality</h5>
        <ul class="sidc-fl">
          <li><span class="sfl-pos">21</span><span class="sfl-body"><strong>Sector 1 Common Modifier</strong><span><code class="sfl-code">0</code> = set-specific modifier; <code class="sfl-code">&gt;0</code> flags a cross-domain Common Modifier from Appendix B (e.g., <code class="sfl-code">107</code> Armored, <code class="sfl-code">127</code> Medical). The full 3-digit code is formed from this digit combined with positions 17–18.</span></span></li>
          <li><span class="sfl-pos">22</span><span class="sfl-body"><strong>Sector 2 Common Modifier</strong><span>Same toggle logic as position 21, applied to the sector-2 amplifier.</span></span></li>
          <li><span class="sfl-pos">23</span><span class="sfl-body"><strong>Frame Shape Identifier</strong><span>Selects the outer-frame SVG geometry and fill-color rules — e.g., <code class="sfl-code">2</code> Air, <code class="sfl-code">3</code> Land Unit, <code class="sfl-code">7</code> Sea Subsurface, <code class="sfl-code">A</code> Sea Surface.</span></span></li>
          <li><span class="sfl-pos">24–27</span><span class="sfl-body"><strong>Reserved</strong><span>Placeholder positions reserved for future expansion by the Symbology Standard Management Committee (SSMC).</span></span></li>
          <li><span class="sfl-pos">28–30</span><span class="sfl-body"><strong>Nationality / GENC</strong><span>Three-position alphanumeric country code. US systems use the GENC standard — <code class="sfl-code">840</code> or <code class="sfl-code">USA</code> for United States.</span></span></li>
        </ul>
      </div>
    </div>

    <div class="sidc-note">
      <strong>Frame rendering:</strong> The combination of Context, Standard Identity, Symbol Set, Status, and Frame Shape collectively determines which SVG file to reference for the outer frame border and its translucent fill. <strong>Icon selection</strong> follows the lowest non-zero tier in positions 11–16 — an Entity Subtype overrides the broader Entity Type icon.
    </div>
  </div>
</details>
`;

const diff = await computeDiff();
const t = diff.totals;

const statCards = [
  ["added", t.added, "Added", "entries new in E"],
  ["removed", t.removed, "Removed", "dropped from E"],
  ["changed", t.changed, "Changed", "same code, relabelled"],
  ["recoded", t.recoded, "Recoded", "same label, new code"],
  ["relocated", t.relocated, "To common", "moved to shared table"],
]
  .map(
    ([type, n, label, sub], i) =>
      `<div class="stat ${type}" style="--i:${i}">` +
      `<div class="stat-n">${n}</div>` +
      `<div class="stat-l">${label}</div>` +
      `<div class="stat-s">${sub}</div>` +
      `</div>`,
  )
  .join("");

// Per-dimension summary: a labelled stacked bar of the five change types.
const dimMax = Math.max(
  1,
  ...diff.dimensions.map(
    (d) => d.added + d.removed + d.changed + d.recoded + d.relocated,
  ),
);
const dimensionCards = diff.dimensions
  .map((d) => {
    const total = d.added + d.removed + d.changed + d.recoded + d.relocated;
    const seg = (type) =>
      d[type]
        ? `<span class="seg ${type}" style="flex:${d[type]}" title="${d[type]} ${type}"></span>`
        : "";
    const tally = TYPES.filter(([t]) => d[t]).map(
      ([t]) => `<span class="t ${t}">${d[t]}</span>`,
    );
    return (
      `<div class="dim-card" style="--w:${(total / dimMax) * 100}%">` +
      `<div class="dim-top"><span class="dim-name">${esc(d.name)}</span>` +
      `<span class="dim-total">${total}</span></div>` +
      `<div class="bar">${TYPES.map(([t]) => seg(t)).join("")}</div>` +
      `<div class="dim-tally">${tally.join("")}<span class="dim-sets">${d.sets} set${d.sets > 1 ? "s" : ""}</span></div>` +
      `</div>`
    );
  })
  .join("");

// Table of contents: jump chips for every changed set.
const toc = diff.sets
  .filter((s) => s.changeCount > 0)
  .map(
    (s) =>
      `<a class="toc-item" href="#set-${esc(s.key)}">` +
      `<span class="toc-code">${esc(s.key)}</span>` +
      `<span class="toc-name">${esc(s.name)}</span>` +
      `<span class="toc-n">${s.changeCount}</span></a>`,
  )
  .join("");

const filterChips = TYPES.map(
  ([t, label]) =>
    `<button class="chip ${t}" data-filter="${t}" aria-pressed="true">` +
    `<span class="dot"></span>${label}</button>`,
).join("");

const onlyInE = diff.onlyInE
  .map(
    (s) =>
      `<div class="newset"><span class="set-code">${esc(s.key)}</span>` +
      `<span>${esc(s.name)}</span><span class="tag">new symbol set</span></div>`,
  )
  .join("");
const onlyInD = diff.onlyInD
  .map(
    (s) =>
      `<div class="newset gone"><span class="set-code">${esc(s.key)}</span>` +
      `<span>${esc(s.name)}</span><span class="tag">removed set</span></div>`,
  )
  .join("");

const setsHtml = diff.sets
  .filter((s) => s.changeCount > 0)
  .map(renderSet)
  .join("");

const totalRows = t.added + t.removed + t.changed + t.recoded + t.relocated;
const genDate = new Date(diff.generatedAt).toUTCString();

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>MIL-STD-2525 D → E · Change Analysis</title>
<script>
  // Apply the saved (or system) theme before first paint to avoid a flash.
  (function () {
    try {
      var t = localStorage.getItem("milstd-theme");
      if (!t) t = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      if (t === "light") document.documentElement.classList.add("light");
    } catch (e) {}
  })();
</script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
  :root {
    --bg: #0a0c0b;
    --glow-1: #11251c;
    --glow-2: #1a1505;
    --ink: #d7e2da;
    --muted: #7f9088;
    --line: #20302a;
    --amber: #ffb000;
    --amber-ink: #06140d;       /* text on amber fills */
    --added: #54dd8b;
    --removed: #ff5d5d;
    --changed: #ffb000;
    --recoded: #41d4ea;
    --relocated: #b794ff;
    /* surfaces */
    --set: #0c0f0e88;
    --inset: #0c100e;           /* inputs, chips, toc, drawer */
    --drawer: #0a0d0c;
    --chip-bg: #ffffff0a;
    --hover: #ffffff06;
    --hover-strong: #ffffff09;
    --hover-amber: #ffb00008;
    --row-sep: #ffffff08;
    --stat-grad: #ffffff05;
    --grid: rgba(255,176,0,.04);
    --sym-shadow: 0 0 1px #0008;
    --mono: "IBM Plex Mono", ui-monospace, monospace;
    --sans: "IBM Plex Sans", system-ui, sans-serif;
    --disp: "Chakra Petch", var(--sans);
  }
  :root.light {
    --bg: #f3f1ea;
    --glow-1: #e3eee4;
    --glow-2: #f6ecd2;
    --ink: #1b211e;
    --muted: #5e6b63;
    --line: #d6d2c4;
    --amber: #a86a00;
    --amber-ink: #fff6e6;
    --added: #1c9a57;
    --removed: #cf2b2b;
    --changed: #b4760a;
    --recoded: #0c8197;
    --relocated: #6f47c9;
    --set: #fffefb99;
    --inset: #ece9df;
    --drawer: #faf8f1;
    --chip-bg: #00000008;
    --hover: #0000000a;
    --hover-strong: #00000010;
    --hover-amber: #a86a000f;
    --row-sep: #0000000f;
    --stat-grad: #00000006;
    --grid: rgba(168,106,0,.06);
    --sym-shadow: 0 0 1px #fff8;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    background:
      radial-gradient(1200px 600px at 80% -10%, var(--glow-1) 0%, transparent 60%),
      radial-gradient(900px 500px at -10% 10%, var(--glow-2) 0%, transparent 55%),
      var(--bg);
    color: var(--ink);
    font-family: var(--sans);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  body::before {
    content: "";
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(transparent 95%, var(--grid) 95%),
      linear-gradient(90deg, transparent 95%, var(--grid) 95%);
    background-size: 28px 28px;
    mask-image: radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 90%);
  }
  .wrap { position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 0 24px 100px; }

  /* Masthead */
  .classbar {
    font-family: var(--mono); font-size: 11px; letter-spacing: .42em;
    text-transform: uppercase; color: var(--amber-ink); background: var(--amber);
    text-align: center; padding: 6px; font-weight: 600;
    margin: 0 -24px 0; position: relative; z-index: 1;
  }
  header.mast { padding: 64px 0 40px; border-bottom: 1px solid var(--line); position: relative; }
  .eyebrow { font-family: var(--mono); color: var(--amber); letter-spacing: .35em;
    text-transform: uppercase; font-size: 12px; margin: 0 0 18px; display:flex; gap:14px; align-items:center;}
  .eyebrow::before { content:""; width: 34px; height: 1px; background: var(--amber); display:inline-block;}
  h1 {
    font-family: var(--disp); font-weight: 700; font-size: clamp(40px, 7vw, 86px);
    line-height: .96; margin: 0; letter-spacing: -.01em; text-transform: uppercase;
  }
  h1 .arrow { color: var(--amber); -webkit-text-stroke: 0; }
  h1 .ed { color: var(--ink); }
  .lede { color: var(--muted); max-width: 62ch; margin: 22px 0 0; font-size: 16px; }
  .meta { display:flex; flex-wrap: wrap; gap: 8px 28px; margin-top: 26px;
    font-family: var(--mono); font-size: 12px; color: var(--muted); }
  .meta b { color: var(--ink); font-weight: 500; }

  /* Stats */
  .stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin: 40px 0 8px; }
  .stat {
    border: 1px solid var(--line); border-top: 2px solid var(--c);
    padding: 18px 18px 16px; background: linear-gradient(180deg, var(--stat-grad), transparent);
    position: relative; overflow: hidden;
    opacity: 0; transform: translateY(14px); animation: rise .6s cubic-bezier(.2,.7,.2,1) forwards;
    animation-delay: calc(var(--i) * 70ms + 120ms);
  }
  .stat-n { font-family: var(--disp); font-weight: 700; font-size: 46px; line-height: 1; color: var(--c); }
  .stat-l { font-family: var(--mono); text-transform: uppercase; letter-spacing: .12em;
    font-size: 12px; margin-top: 8px; color: var(--ink); font-weight: 600; }
  .stat-s { color: var(--muted); font-size: 12px; margin-top: 3px; }
  .stat.added { --c: var(--added); } .stat.removed { --c: var(--removed); }
  .stat.changed { --c: var(--changed); } .stat.recoded { --c: var(--recoded); }
  .stat.relocated { --c: var(--relocated); }
  @keyframes rise { to { opacity: 1; transform: none; } }

  /* New / removed sets */
  .callouts { display:flex; flex-wrap: wrap; gap: 12px; margin: 22px 0 4px; }
  .newset { display:flex; align-items:center; gap: 12px; border: 1px dashed var(--added);
    padding: 12px 16px; font-family: var(--mono); font-size: 14px; background: color-mix(in srgb, var(--added) 8%, transparent); }
  .newset.gone { border-color: var(--removed); background: color-mix(in srgb, var(--removed) 8%, transparent); }

  /* Controls */
  .controls { position: sticky; top: 0; z-index: 5; display:flex; flex-wrap: wrap; gap: 12px;
    align-items: center; padding: 16px 0; margin: 30px 0 8px;
    background: linear-gradient(180deg, var(--bg) 70%, transparent);
    border-bottom: 1px solid var(--line); }
  .search { flex: 1 1 280px; display:flex; align-items:center; gap:10px;
    border: 1px solid var(--line); background: var(--inset); padding: 10px 14px; }
  .search:focus-within { border-color: var(--amber); }
  .search input { flex:1; background: transparent; border: 0; color: var(--ink);
    font-family: var(--mono); font-size: 14px; outline: none; }
  .search span { font-family: var(--mono); color: var(--amber); font-size: 13px; }
  .chips { display:flex; flex-wrap: wrap; gap: 8px; }
  .chip { display:flex; align-items:center; gap: 8px; cursor: pointer; user-select:none;
    font-family: var(--mono); font-size: 12px; text-transform: uppercase; letter-spacing: .08em;
    color: var(--ink); background: var(--inset); border: 1px solid var(--line); padding: 9px 12px; }
  .chip .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--c); box-shadow: 0 0 8px var(--c); }
  .chip[aria-pressed="false"] { color: var(--muted); opacity: .5; }
  .chip[aria-pressed="false"] .dot { box-shadow:none; opacity:.4; }
  .chip.added { --c: var(--added); } .chip.removed { --c: var(--removed); }
  .chip.changed { --c: var(--changed); } .chip.recoded { --c: var(--recoded); }
  .chip.relocated { --c: var(--relocated); }
  .btn { font-family: var(--mono); font-size: 12px; text-transform: uppercase; letter-spacing:.08em;
    background: transparent; border: 1px solid var(--line); color: var(--muted); padding: 9px 12px; cursor:pointer; }
  .btn:hover { color: var(--amber); border-color: var(--amber); }
  .countline { font-family: var(--mono); font-size: 12px; color: var(--muted); margin: 6px 2px 0; }

  /* Sets */
  .sectionhead { font-family: var(--disp); text-transform: uppercase; letter-spacing: .04em;
    font-size: 22px; margin: 46px 0 16px; padding-bottom: 10px; border-bottom: 1px solid var(--line);
    display:flex; align-items:baseline; gap: 14px; }
  .sectionhead .hash { color: var(--amber); font-family: var(--mono); font-size: 14px; }

  details.set { border: 1px solid var(--line); margin: 12px 0; background: var(--set); }
  details.set[open] { border-color: #2c4035; }
  summary { list-style: none; cursor: pointer; display: grid;
    grid-template-columns: auto 1fr auto auto; align-items: center; gap: 16px;
    padding: 16px 18px; }
  summary::-webkit-details-marker { display: none; }
  summary:hover { background: var(--hover-amber); }
  .set-code { font-family: var(--disp); font-weight: 700; font-size: 20px; color: var(--amber);
    border: 1px solid var(--amber); padding: 2px 10px; letter-spacing: .04em; }
  .set-name { font-family: var(--disp); font-weight: 600; font-size: 19px; text-transform: uppercase; letter-spacing:.02em; }
  .set-name .was { font-family: var(--sans); font-weight: 400; text-transform: none;
    color: var(--muted); font-size: 13px; margin-left: 10px; letter-spacing: 0; }
  .set-badges { display:flex; gap: 6px; }
  .badge { font-family: var(--mono); font-size: 12px; font-weight: 600; padding: 2px 8px;
    border: 1px solid var(--c); color: var(--c); --c: var(--muted); }
  .badge.added { --c: var(--added); } .badge.removed { --c: var(--removed); }
  .badge.changed { --c: var(--changed); } .badge.recoded { --c: var(--recoded); }
  .badge.relocated { --c: var(--relocated); }
  .chev { color: var(--muted); transition: transform .2s; }
  details[open] .chev { transform: rotate(180deg); }
  .set-body { padding: 4px 18px 20px; border-top: 1px solid var(--line); }

  .subsection { margin-top: 18px; }
  .subhead { font-family: var(--mono); text-transform: uppercase; letter-spacing: .14em;
    font-size: 12px; color: var(--muted); margin: 0 0 8px; display:flex; align-items:center; gap:10px; }
  .subhead .n { color: var(--amber); border:1px solid var(--line); padding: 0 7px; font-size: 11px; }
  ul.rows { list-style: none; margin: 0; padding: 0; }
  .row { border-left: 2px solid var(--c); --c: var(--line); }
  .row + .row { border-top: 1px solid var(--row-sep); }
  .row.added { --c: var(--added); } .row.removed { --c: var(--removed); }
  .row.changed { --c: var(--changed); } .row.recoded { --c: var(--recoded); }
  .row.relocated { --c: var(--relocated); }
  .row-head { width: 100%; text-align: left; background: transparent; border: 0; cursor: pointer;
    color: inherit; font: inherit; display: grid;
    grid-template-columns: 18px 34px auto 1fr 18px; gap: 12px; align-items: center;
    padding: 6px 10px; transition: background .15s; }
  .row-head:hover { background: var(--hover); }
  .row.open > .row-head { background: var(--hover-strong); }
  .glyph { font-family: var(--mono); font-weight: 600; color: var(--c); text-align:center; align-self:center; }
  .sym { display:flex; align-items:center; justify-content:center; height: 30px; }
  .sym svg { height: 30px; width: auto; display: block; filter: drop-shadow(var(--sym-shadow)); }
  .sym-pair { gap: 3px; }
  .sym-pair svg { height: 22px; }
  .sym-arrow { font-family: var(--mono); font-size: 9px; color: var(--relocated); opacity: .7; }
  .sym-none { color: var(--muted); opacity: .5; font-family: var(--mono); }
  .codes { display:flex; align-items:center; gap: 6px; white-space: nowrap; }
  .code { font-family: var(--mono); font-size: 12.5px; color: var(--ink);
    background: var(--chip-bg); border: 1px solid var(--line); padding: 1px 7px; }
  .arrow { color: var(--muted); font-family: var(--mono); padding: 0 2px; }
  .label { color: var(--ink); display:flex; flex-wrap:wrap; align-items:baseline; gap: 4px 8px; }
  .label .from { color: var(--muted); text-decoration: line-through; text-decoration-color: #ff5d5d66; }
  .label .to { color: var(--ink); }
  .label .remark { width:100%; color: var(--muted); font-size: 12px; font-style: italic; }
  .expand { font-family: var(--mono); color: var(--muted); text-align:center; transition: transform .2s, color .2s; }
  .row.open .expand { transform: rotate(45deg); color: var(--amber); }
  .tag { font-family: var(--mono); font-size: 10.5px; text-transform: uppercase; letter-spacing: .1em;
    color: var(--muted); border: 1px solid var(--line); padding: 1px 6px; }
  .row.relocated .tag { color: var(--relocated); border-color: var(--relocated); }

  /* field-level change diff */
  .fielddiff { display:flex; flex-direction:column; gap: 3px; }
  .fd { display:flex; flex-wrap:wrap; align-items:baseline; gap: 6px; }
  .fk { font-family: var(--mono); font-size: 10.5px; text-transform: uppercase; letter-spacing: .1em;
    color: var(--muted); min-width: 64px; }
  .fd .from { color: var(--muted); text-decoration: line-through; text-decoration-color: #ff5d5d66; }
  .fd .to { color: var(--ink); }
  .fd .empty { color: var(--muted); opacity: .7; }

  /* expand drawer */
  .drawer-wrap { display: none; }
  .row.open .drawer-wrap { display: block; }
  .drawer { margin: 2px 10px 12px 42px; padding: 14px 16px; border: 1px solid var(--line);
    background: var(--drawer); }
  .ed-sym { display:flex; align-items:center; gap: 12px; margin-bottom: 12px;
    padding-bottom: 12px; border-bottom: 1px dashed var(--line); }
  .drawer-sym svg { height: 44px; width: auto; display:block; }
  .sidc { font-family: var(--mono); font-size: 11.5px; color: var(--ink);
    letter-spacing: .04em; word-break: break-all; line-height: 1.4; }
  .sidc-dot { color: var(--amber); opacity: .35; padding: 0 3px; user-select: none; }
  .sidc-s1 { color: var(--muted); }
  .sidc-s2 { color: var(--ink); }
  .sidc-s3 { color: var(--muted); opacity: .7; }
  .ed-cols { display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; }
  .ed h6 { font-family: var(--mono); text-transform: uppercase; letter-spacing: .12em; font-size: 11px;
    color: var(--amber); margin: 0 0 10px; }
  .ed-d h6 { color: var(--muted); }
  .ed-d .drawer-sym svg { filter: grayscale(.15); }
  .ed-none { color: var(--muted); font-style: italic; margin: 0; }
  dl.fields { display:grid; grid-template-columns: auto 1fr; gap: 4px 14px; margin: 0; font-size: 13px; }
  dl.fields dt { font-family: var(--mono); font-size: 11px; text-transform: uppercase;
    letter-spacing: .08em; color: var(--muted); }
  dl.fields dd { margin: 0; color: var(--ink); }
  dl.fields dd.mono { font-family: var(--mono); }

  /* dimension summary band */
  .dims { display:grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 8px 0 4px; }
  .dim-card { border: 1px solid var(--line); padding: 14px 16px; background: linear-gradient(180deg, var(--stat-grad), transparent); }
  .dim-top { display:flex; justify-content:space-between; align-items:baseline; margin-bottom: 9px; }
  .dim-name { font-family: var(--disp); font-weight: 600; text-transform: uppercase; letter-spacing: .03em; font-size: 16px; }
  .dim-total { font-family: var(--mono); color: var(--amber); font-size: 13px; }
  .bar { display:flex; height: 8px; gap: 2px; background: var(--inset); overflow: hidden; }
  .bar .seg.added { background: var(--added); } .bar .seg.removed { background: var(--removed); }
  .bar .seg.changed { background: var(--changed); } .bar .seg.recoded { background: var(--recoded); }
  .bar .seg.relocated { background: var(--relocated); }
  .dim-tally { display:flex; flex-wrap:wrap; gap: 4px 8px; margin-top: 9px;
    font-family: var(--mono); font-size: 12px; }
  .dim-tally .t.added { color: var(--added); } .dim-tally .t.removed { color: var(--removed); }
  .dim-tally .t.changed { color: var(--changed); } .dim-tally .t.recoded { color: var(--recoded); }
  .dim-tally .t.relocated { color: var(--relocated); }
  .dim-tally .t::before { content: "■ "; }
  .dim-sets { margin-left: auto; color: var(--muted); }

  /* table of contents */
  .toc { display:grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 8px; margin: 14px 0 4px; }
  .toc-item { display:flex; align-items:center; gap: 10px; text-decoration:none; color: var(--ink);
    border: 1px solid var(--line); padding: 8px 11px; background: var(--inset); transition: border-color .15s, background .15s; }
  .toc-item:hover { border-color: var(--amber); background: var(--hover-amber); }
  .toc-code { font-family: var(--mono); font-weight: 600; color: var(--amber); font-size: 12px; }
  .toc-name { font-size: 13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .toc-n { margin-left:auto; font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .dim { font-family: var(--mono); font-size: 10.5px; text-transform: uppercase; letter-spacing:.12em;
    color: var(--amber); border: 1px solid color-mix(in srgb, var(--amber) 45%, transparent);
    padding: 1px 7px; margin-left: 12px; }
  details.set { scroll-margin-top: 84px; }

  .set.empty, .subsection.empty, .row.hide { display: none; }
  .noresults { display:none; text-align:center; color: var(--muted); font-family: var(--mono);
    padding: 60px 0; }
  .noresults.show { display:block; }

  footer { margin-top: 56px; padding-top: 22px; border-top: 1px solid var(--line);
    font-family: var(--mono); font-size: 12px; color: var(--muted); display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;}

  @media (max-width: 900px) { .dims { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 760px) {
    .stats, .dims { grid-template-columns: repeat(2, 1fr); }
    summary { grid-template-columns: auto 1fr auto; }
    .set-badges { grid-column: 1 / -1; }
    .set-name .dim { display:none; }
    .ed-cols { grid-template-columns: 1fr; }
    .row-head { grid-template-columns: 18px 28px auto 1fr 16px; gap: 8px; }
    .chev { display:none; }
  }

  /* SIDC reference section */
  .sidc-ref-body { padding-top: 6px; }
  .sidc-lede { color: var(--muted); font-size: 14px; margin: 0 0 18px; max-width: 76ch; }
  .sidc-diagram { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin: 0 0 8px; }
  .sdb-group { border: 1px solid var(--line); padding: 10px 12px 12px; }
  .sdb-a { border-color: color-mix(in srgb, var(--recoded) 30%, transparent); }
  .sdb-a .sdb-label { color: var(--recoded); }
  .sdb-a .sdb-cell { background: color-mix(in srgb, var(--recoded) 7%, transparent); border-color: color-mix(in srgb, var(--recoded) 20%, transparent); }
  .sdb-a .sdb-top { color: var(--recoded); }
  .sdb-b { border-color: color-mix(in srgb, var(--added) 30%, transparent); }
  .sdb-b .sdb-label { color: var(--added); }
  .sdb-b .sdb-cell { background: color-mix(in srgb, var(--added) 7%, transparent); border-color: color-mix(in srgb, var(--added) 20%, transparent); }
  .sdb-b .sdb-top { color: var(--added); }
  .sdb-c { border-color: color-mix(in srgb, var(--relocated) 30%, transparent); }
  .sdb-c .sdb-label { color: var(--relocated); }
  .sdb-c .sdb-cell { background: color-mix(in srgb, var(--relocated) 7%, transparent); border-color: color-mix(in srgb, var(--relocated) 20%, transparent); }
  .sdb-c .sdb-top { color: var(--relocated); }
  .sdb-cells { display: flex; gap: 3px; }
  .sdb-cell { border: 1px solid var(--line); padding: 6px 4px 4px; text-align: center; flex: 1; min-width: 0; }
  .sdb-cell.sdb-reserved { opacity: .45; }
  .sdb-label { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 8px; }
  .sdb-top { font-family: var(--mono); font-size: 10px; font-weight: 600; display: block; white-space: nowrap; }
  .sdb-bot { font-size: 9px; color: var(--muted); margin-top: 3px; line-height: 1.2; }
  .sidc-example { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 10px 0 22px; }
  .sidc-ex-label { font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .sidc-sets-wrap { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 0 0 16px; }
  .sidc-set-block { border: 1px solid var(--line); padding: 16px; }
  .sidc-set-block h5 { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .13em; margin: 0 0 14px; }
  .sidc-set-block.sa h5 { color: var(--recoded); }
  .sidc-set-block.sb h5 { color: var(--added); }
  .sidc-set-block.sc h5 { color: var(--relocated); }
  ul.sidc-fl { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
  ul.sidc-fl li { display: grid; grid-template-columns: 42px 1fr; gap: 8px; align-items: start; }
  .sfl-pos { font-family: var(--mono); font-size: 10.5px; color: var(--amber); font-weight: 600; padding-top: 1px; white-space: nowrap; }
  .sfl-body { font-size: 12.5px; }
  .sfl-body strong { color: var(--ink); font-weight: 600; display: block; }
  .sfl-body span { color: var(--muted); font-size: 12px; line-height: 1.45; }
  .sfl-body em { font-style: italic; }
  .sfl-code { font-family: var(--mono); font-size: 11px; color: var(--ink); background: var(--chip-bg); border: 1px solid var(--line); padding: 0 4px; }
  .sidc-note { margin: 4px 0 0; padding: 12px 16px; border-left: 2px solid var(--amber); background: color-mix(in srgb, var(--amber) 5%, transparent); font-size: 13px; color: var(--muted); line-height: 1.5; }
  .sidc-note strong { color: var(--ink); font-weight: 600; }
  @media (max-width: 900px) { .sidc-diagram { grid-template-columns: 1fr; } .sidc-sets-wrap { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="classbar">Symbology Change Analysis · Unclassified · For Reference Only</div>
<div class="wrap">
  <header class="mast">
    <p class="eyebrow">MIL-STD-2525 / STANAG APP-6 · Edition Delta</p>
    <h1><span class="ed">2525D</span> <span class="arrow">→</span> <span class="ed">2525E</span></h1>
    <p class="lede">A field-by-field comparison of the military symbology datasets — which symbol sets,
      main icons, and modifiers were added, removed, relabelled, recoded, or relocated into the new
      shared common-modifier table.</p>
    <div class="meta">
      <span>SETS · D <b>${diff.counts.setsD}</b> / E <b>${diff.counts.setsE}</b></span>
      <span>TOTAL DELTAS <b>${totalRows}</b></span>
      <span>SOURCE <b>milstd2525.ts → milstd2525e.ts</b></span>
      <span>GENERATED <b>${esc(genDate)}</b></span>
    </div>
  </header>

  <div class="stats">${statCards}</div>

  <div class="callouts">${onlyInE}${onlyInD}</div>

  <h2 class="sectionhead"><span class="hash">§</span> By battle dimension</h2>
  <div class="dims">${dimensionCards}</div>

  <h2 class="sectionhead"><span class="hash">§</span> Jump to set</h2>
  <nav class="toc">${toc}</nav>

  <div class="controls">
    <label class="search">
      <span>▸</span>
      <input id="q" type="search" placeholder="Filter by code or label…" autocomplete="off" />
    </label>
    <div class="chips">${filterChips}</div>
    <button class="btn" id="toggleAll">Collapse all</button>
    <button class="btn" id="themeToggle" aria-label="Toggle light/dark theme">Theme</button>
  </div>
  <div class="countline" id="countline"></div>

  <h2 class="sectionhead"><span class="hash">§</span> Per symbol set</h2>
  ${setsHtml}
  <div class="noresults" id="noresults">// no entries match the current filter</div>

  <h2 class="sectionhead"><span class="hash">§</span> New in 2525E · Shared common modifiers
    <span class="badge added" style="--c:var(--added)">${diff.common.modifierOne.length + diff.common.modifierTwo.length}</span>
  </h2>
  <details class="set" open id="commonset">
    <summary>
      <span class="set-code">★</span>
      <span class="set-name">Common modifier table<span class="was">applies across all symbol sets — no 2525D equivalent</span></span>
      <span class="set-badges"></span>
      <span class="chev" aria-hidden="true">▾</span>
    </summary>
    <div class="set-body"><div class="subsection">${renderCommon(diff.common)}</div></div>
  </details>

  ${sidcRefHtml}

  <footer>
    <span>MIL-STD-2525 D→E delta · generated by scripts/diff-milstd-report.mjs</span>
    <span>Data © Måns Beckman · spatialillusions · MIT</span>
  </footer>
</div>

<script>
(function () {
  const q = document.getElementById("q");
  const chips = [...document.querySelectorAll(".chip")];
  const sets = [...document.querySelectorAll("details.set")];
  const rows = [...document.querySelectorAll(".row")];
  const countline = document.getElementById("countline");
  const noresults = document.getElementById("noresults");
  const active = new Set(chips.map((c) => c.dataset.filter));

  function apply() {
    const term = q.value.trim().toLowerCase();
    let shown = 0;
    for (const r of rows) {
      const okType = active.has(r.dataset.type);
      const okTerm = !term || r.dataset.q.includes(term);
      const visible = okType && okTerm;
      r.classList.toggle("hide", !visible);
      if (visible) shown++;
    }
    // hide empty subsections and sets
    for (const sub of document.querySelectorAll(".subsection")) {
      const any = sub.querySelector(".row:not(.hide)");
      sub.classList.toggle("empty", !any && sub.querySelector(".row"));
    }
    for (const s of sets) {
      const any = s.querySelector(".row:not(.hide)");
      s.classList.toggle("empty", !any && !!s.querySelector(".row"));
      if (term && any) s.open = true;
    }
    noresults.classList.toggle("show", shown === 0);
    countline.textContent = "// showing " + shown + " of " + rows.length + " deltas";
  }

  // Expand/collapse a row's detail drawer.
  for (const head of document.querySelectorAll(".row-head")) {
    head.addEventListener("click", () => {
      head.parentElement.classList.toggle("open");
    });
  }

  q.addEventListener("input", apply);
  chips.forEach((c) =>
    c.addEventListener("click", () => {
      const f = c.dataset.filter;
      if (active.has(f)) active.delete(f); else active.add(f);
      c.setAttribute("aria-pressed", active.has(f));
      apply();
    }),
  );

  const toggleAll = document.getElementById("toggleAll");
  toggleAll.addEventListener("click", () => {
    const anyOpen = sets.some((s) => s.open);
    sets.forEach((s) => (s.open = !anyOpen));
    toggleAll.textContent = anyOpen ? "Expand all" : "Collapse all";
  });

  // Light / dark theme toggle (persisted; initial value set in <head>).
  const themeToggle = document.getElementById("themeToggle");
  const syncTheme = () => {
    themeToggle.textContent = document.documentElement.classList.contains("light")
      ? "◐ Dark"
      : "◑ Light";
  };
  themeToggle.addEventListener("click", () => {
    const light = document.documentElement.classList.toggle("light");
    try {
      localStorage.setItem("milstd-theme", light ? "light" : "dark");
    } catch (e) {}
    syncTheme();
  });
  syncTheme();

  apply();
})();
</script>
</body>
</html>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, html);
const renderedIcons = [...symCache.values()].filter(Boolean).length;
console.log(
  `Wrote report (${totalRows} deltas across ${diff.sets.filter((s) => s.changeCount).length} sets, ` +
    `${renderedIcons} unique milsymbol icons) to ${OUT_FILE}`,
);
