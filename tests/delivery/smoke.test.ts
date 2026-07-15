import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  EXPECTED_PUBLIC_PATHS,
  EXPECTED_SECURITY_HEADERS,
  EXPECTED_SITEMAP_URLS,
  FROZEN_BRAND_HASHES,
} from "@/lib/delivery/contracts";
import {
  assertApprovedSmokeOrigin,
  runProductionSmoke,
  type SmokeFetcher,
  type SmokeResponse,
} from "@/lib/delivery/validation";

function response(
  url: string,
  status: number,
  body = "",
  headers: Record<string, string> = {},
): SmokeResponse {
  return {
    body: new TextEncoder().encode(body),
    headers,
    status,
    url,
  };
}

function fixtureFetcher(overrides: Record<string, SmokeResponse> = {}): SmokeFetcher {
  return async (url) => {
    if (overrides[url]) return overrides[url];
    const parsed = new URL(url);
    if (parsed.origin === "https://youtoola.com") {
      return response(url, 308, "", { location: "https://www.youtoola.com/" });
    }
    if (parsed.pathname === "/robots.txt") {
      return response(
        url,
        200,
        "User-Agent: *\nAllow: /\n\nUser-Agent: OAI-SearchBot\nAllow: /\n\nUser-Agent: GPTBot\nDisallow: /\n\nSitemap: https://www.youtoola.com/sitemap.xml\n",
      );
    }
    if (parsed.pathname === "/sitemap.xml") {
      return response(
        url,
        200,
        `<urlset>${EXPECTED_SITEMAP_URLS.map((item) => `<url><loc>${item}</loc></url>`).join("")}</urlset>`,
      );
    }
    if (parsed.pathname in FROZEN_BRAND_HASHES) {
      throw new Error("Hash fixtures are supplied separately.");
    }
    if (parsed.pathname === "/fuel-trip-calculator" || parsed.pathname === "/design-system-review") {
      return response(url, 404);
    }
    if (EXPECTED_PUBLIC_PATHS.includes(parsed.pathname as (typeof EXPECTED_PUBLIC_PATHS)[number])) {
      const canonical = parsed.pathname === "/" ? parsed.origin : url;
      return response(
        url,
        200,
        `<html><head><link rel="canonical" href="${canonical}"></head></html>`,
        parsed.pathname === "/"
          ? {
              ...EXPECTED_SECURITY_HEADERS,
              "strict-transport-security": "max-age=63072000",
            }
          : {},
      );
    }
    return response(url, 500);
  };
}

function withBrandFixtures(fetcher: SmokeFetcher): SmokeFetcher {
  return async (url, init) => {
    const path = new URL(url).pathname;
    const expected = FROZEN_BRAND_HASHES[path as keyof typeof FROZEN_BRAND_HASHES];
    if (!expected) return fetcher(url, init);
    return {
      body: new Uint8Array(
        await readFile(join(process.cwd(), "public", path.replace(/^\//, ""))),
      ),
      headers: {},
      status: 200,
      url,
    };
  };
}

describe("Production smoke", () => {
  it("rejects every non-Youtoola target", () => {
    expect(() => assertApprovedSmokeOrigin("https://example.com")).toThrow("not approved");
    expect(() => assertApprovedSmokeOrigin("https://www.youtoola.com/path")).toThrow("not approved");
  });

  it("passes the complete approved offline fixture", async () => {
    const report = await runProductionSmoke(withBrandFixtures(fixtureFetcher()));
    expect(report.passed).toBe(true);
    expect(report.checks.every(({ passed }) => passed)).toBe(true);
  });

  it("reports deterministic failures for route and redirect defects", async () => {
    const broken = await runProductionSmoke(
      withBrandFixtures(
        fixtureFetcher({
          "https://www.youtoola.com/tools": response(
            "https://www.youtoola.com/tools",
            500,
          ),
          "https://youtoola.com": response("https://youtoola.com", 308, "", {
            location: "https://youtoola.com/",
          }),
        }),
      ),
    );
    expect(broken.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "status:/tools", passed: false }),
        expect.objectContaining({ id: "redirect:no-loop", passed: false }),
      ]),
    );
  });

  it("rejects an invalid brand hash", async () => {
    const brokenAssetFetcher: SmokeFetcher = async (url, init) => {
      if (new URL(url).pathname === "/brand/youtoola-logo.png") {
        return response(url, 200, "invalid");
      }
      return withBrandFixtures(fixtureFetcher())(url, init);
    };
    const report = await runProductionSmoke(brokenAssetFetcher);
    expect(report.checks).toContainEqual(
      expect.objectContaining({
        id: "brand-hash:/brand/youtoola-logo.png",
        passed: false,
      }),
    );
  });
});
