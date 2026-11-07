import { describe, expect, it } from "vitest";

// The folder must stay copyable into other apps (tactrace) and publishable as
// a package, so it may only import its own files and these packages.
const ALLOWED_PACKAGES = [/^nanoid$/, /^@codemirror\//, /^vitest$/];

const sources = import.meta.glob<string>("./**/*.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});

describe("textToOrbat module", () => {
  it("imports nothing from the host app", () => {
    expect(Object.keys(sources)).toContain("./codemirror/index.ts");
    const offending = Object.entries(sources).flatMap(([file, source]) =>
      [...source.matchAll(/^\s*(?:import|export)[^"']*?from\s+["']([^"']+)["']/gm)]
        .map((match) => match[1])
        .filter((specifier) => !specifier.startsWith("."))
        .filter(
          (specifier) => !ALLOWED_PACKAGES.some((allowed) => allowed.test(specifier)),
        )
        .map((specifier) => `${file}: ${specifier}`),
    );

    expect(offending).toEqual([]);
  });
});
