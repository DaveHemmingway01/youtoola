import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

describe("Fuel Trip framework fixture isolation", () => {
  it("keeps the implementation private without creating a Production utility route", async () => {
    expect(await exists(path.join(process.cwd(), "app/fuel-trip-calculator/page.tsx"))).toBe(false);
    expect(await exists(path.join(process.cwd(), "utilities/fuel-trip-calculator"))).toBe(true);
    expect(await exists(path.join(process.cwd(), "app/design-system-review/fuel-trip-calculator/page.tsx"))).toBe(true);
  });

  it("does not import the test fixture from application or shared runtime code", async () => {
    const files = [
      "app/design-system-review/page.tsx",
      "app/design-system-review/utility-framework-example.tsx",
      "components/tools/utility-page-shell.tsx",
      "lib/utilities/contracts.ts",
    ];
    for (const file of files) {
      const source = await readFile(path.join(process.cwd(), file), "utf8");
      expect(source).not.toContain("fuel-trip-framework");
      expect(source).not.toContain("Fuel Trip Calculator");
    }
  });
});
