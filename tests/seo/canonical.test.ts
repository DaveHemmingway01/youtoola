import { describe, expect, it } from "vitest";

import {
  assertCanonicalPath,
  assertCanonicalUrl,
  canonicalizePublicUrl,
  createCanonicalUrl,
} from "@/lib/seo/canonical";

describe("canonical URL governance", () => {
  it("uses the approved host and root-path policy", () => {
    expect(createCanonicalUrl("/")).toBe("https://www.youtoola.com");
    expect(createCanonicalUrl("/tools")).toBe("https://www.youtoola.com/tools");
    expect(() => assertCanonicalUrl("https://www.youtoola.com/about")).not.toThrow();
  });

  it.each(["tools", "/tools/", "/tools?utm_source=test", "/tools#section", "//tools"])(
    "rejects invalid canonical path %s",
    (path) => expect(() => assertCanonicalPath(path)).toThrow(),
  );

  it("rejects Preview, Vercel, non-www, and insecure canonical hosts", () => {
    for (const url of [
      "https://youtoola.com/tools",
      "https://youtoola-git-example.vercel.app/tools",
      "http://www.youtoola.com/tools",
    ]) {
      expect(() => assertCanonicalUrl(url)).toThrow();
    }
  });

  it("removes query parameters, tracking parameters, fragments, and trailing slashes", () => {
    expect(
      canonicalizePublicUrl(
        "https://preview.example/tools/?utm_source=test&view=grid#directory",
      ),
    ).toBe("https://www.youtoola.com/tools");
  });
});
