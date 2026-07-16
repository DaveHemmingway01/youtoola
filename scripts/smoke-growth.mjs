import { createHash } from "node:crypto";
import activation from "../data/growth/activation.json" with { type: "json" };

const canonicalOrigin = "https://www.youtoola.com";
const apexOrigin = "https://youtoola.com";
const publicRoutes = ["/", "/tools", "/about", "/methodology", "/privacy"];
const unavailableRoutes = ["/fuel-trip-calculator", "/design-system-review"];
const expectedAssetHash = "9a6c7ac46773ff6d8a6d2fe0de7aeaa5f0fc6c5ff272bc848d9da171d8aedcbc";
const expectedSitemapUrls = publicRoutes.map((route) => `${canonicalOrigin}${route === "/" ? "" : route}`);
const providerMustBeAbsent = ["dormant", "disabled", "incident-disabled"].includes(activation.activationState);

async function request(url, init = {}) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(15_000) });
}

function assertion(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const checks = [];
  for (const route of publicRoutes) {
    const response = await request(`${canonicalOrigin}${route}`);
    const html = await response.text();
    assertion(response.status === 200, `${route} did not return 200.`);
    assertion(!response.headers.get("x-robots-tag")?.includes("noindex"), `${route} is noindexed.`);
    assertion(response.headers.has("content-security-policy-report-only"), `${route} lacks report-only CSP.`);
    assertion(!response.headers.has("content-security-policy"), `${route} has an enforced CSP.`);
    assertion(response.headers.get("x-content-type-options") === "nosniff", `${route} lacks nosniff.`);
    assertion(html.includes("/brand/og-default.png"), `${route} lacks default Open Graph metadata.`);
    assertion(html.includes("summary_large_image"), `${route} lacks large Twitter card metadata.`);
    if (providerMustBeAbsent) {
      assertion(!/G-[A-Z0-9]{4,20}/.test(html), `${route} exposes a provider identifier.`);
      assertion(!/googletagmanager|google-analytics|clarity\.ms/i.test(html), `${route} exposes a dormant provider.`);
    }
    assertion(!response.headers.get("set-cookie")?.includes("youtoola_consent"), `${route} writes an analytics cookie.`);
    checks.push(`public:${route}`);
  }

  for (const route of unavailableRoutes) {
    const response = await request(`${canonicalOrigin}${route}`);
    assertion(response.status === 404, `${route} did not return 404.`);
    checks.push(`unavailable:${route}`);
  }

  const apex = await request(apexOrigin, { redirect: "manual" });
  assertion(apex.status === 308, "Apex did not return 308.");
  assertion(apex.headers.get("location") === `${canonicalOrigin}/`, "Apex destination is wrong.");
  checks.push("apex-308");

  const sitemap = await (await request(`${canonicalOrigin}/sitemap.xml`)).text();
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assertion(JSON.stringify(sitemapUrls) === JSON.stringify(expectedSitemapUrls), "Sitemap membership changed.");
  checks.push("sitemap");

  const assetResponse = await request(`${canonicalOrigin}/brand/og-default.png`);
  const asset = Buffer.from(await assetResponse.arrayBuffer());
  assertion(assetResponse.status === 200, "Open Graph asset did not return 200.");
  assertion(asset.length === 167_092, "Open Graph asset byte size changed.");
  assertion(asset.readUInt32BE(16) === 1200 && asset.readUInt32BE(20) === 630, "Open Graph asset dimensions changed.");
  assertion(createHash("sha256").update(asset).digest("hex") === expectedAssetHash, "Open Graph asset hash changed.");
  checks.push("open-graph-asset");

  console.log(JSON.stringify({ activationState: activation.activationState, checks, passed: true }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
