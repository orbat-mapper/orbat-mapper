// Lists every import edge from a non-legacy file into a file covered by
// LEGACY_OPENLAYERS_FILES in eslint.config.ts. On OpenLayers deletion day this
// must print only the /legacy route registration in src/router/index.ts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
process.chdir(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));

const eslintConfig = fs.readFileSync("eslint.config.ts", "utf8");
const listSource = eslintConfig.match(
  /LEGACY_OPENLAYERS_FILES\s*=\s*\[([\s\S]*?)\]/,
)?.[1];
if (!listSource) throw new Error("LEGACY_OPENLAYERS_FILES not found in eslint.config.ts");
const LEGACY = [...listSource.matchAll(/"([^"]+)"/g)].map((m) => m[1]);

function toRegex(pattern) {
  // expand {a,b}
  let src = "";
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === "{") {
      const end = pattern.indexOf("}", i);
      src += "(?:" + pattern.slice(i + 1, end).split(",").map((s) => s.replace(/\./g, "\\.")).join("|") + ")";
      i = end;
    } else if (c === "*") {
      if (pattern[i + 1] === "*") { src += ".*"; i++; if (pattern[i+1] === "/") i++; }
      else src += "[^/]*";
    } else if (c === ".") src += "\\.";
    else src += c;
  }
  return new RegExp("^" + src + "$");
}
const regexes = LEGACY.map(toRegex);
const isLegacy = (f) => regexes.some((r) => r.test(f));

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|vue|tsx|mts)$/.test(e.name)) out.push(p);
  }
  return out;
}
const all = walk("src");

function resolveSpec(spec, fromFile) {
  let base;
  if (spec.startsWith("@/")) base = path.join("src", spec.slice(2));
  else if (spec.startsWith(".")) base = path.normalize(path.join(path.dirname(fromFile), spec));
  else return null;
  for (const c of [base, base + ".ts", base + ".vue", base + ".tsx", path.join(base, "index.ts")])
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  return null;
}

const edges = new Set();
for (const f of all) {
  if (isLegacy(f)) continue;
  const src = fs.readFileSync(f, "utf8");
  const re = /(?:from|import)\s*\(?\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(src))) {
    const t = resolveSpec(m[1], f);
    if (t && isLegacy(t)) edges.add(`${f} -> ${t}`);
  }
}
console.log([...edges].sort().join("\n") || "(none)");
console.log("EDGES:", edges.size);
