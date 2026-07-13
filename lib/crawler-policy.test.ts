import { describe, expect, it } from "vitest";

import { createCrawlerPolicy } from "./crawler-policy";

describe("createCrawlerPolicy", () => {
  it("allows ordinary search and OAI-SearchBot while blocking GPTBot in production", () => {
    expect(createCrawlerPolicy("production")).toEqual({
      rules: [
        {
          userAgent: "*",
          allow: "/",
        },
        {
          userAgent: "OAI-SearchBot",
          allow: "/",
        },
        {
          userAgent: "GPTBot",
          disallow: "/",
        },
      ],
      sitemap: "https://www.youtoola.com/sitemap.xml",
    });
  });

  it.each(["preview", "local"] as const)(
    "disallows all crawlers in %s",
    (environment) => {
      expect(createCrawlerPolicy(environment)).toEqual({
        rules: {
          userAgent: "*",
          disallow: "/",
        },
      });
    },
  );
});
