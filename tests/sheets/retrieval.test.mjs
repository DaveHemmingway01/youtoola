import { describe, expect, it } from "vitest";

import { readYoutoolaOpportunity } from "../../lib/sheets/retrieval.mjs";

const metadataHtml = `
  <title>Youtoola Utility Opportunity Map - Google Sheets</title>
  <div class="docs-sheet-tab-caption">Overview</div>
  <div class="docs-sheet-tab-caption">Travel &amp; Mobility</div>
`;
const headerCsv = [
  '"Travel & Mobility","","","",""',
  '"ID","Utility idea","Core use","Monetisation","Priority","Unmapped"',
].join("\n");
const rowCsv =
  '"21","Fuel Trip Calculator","Calculate fuel, tolls, return journeys and cost per passenger.","Fuel, rental car and travel affiliates","Tier 1","Preserved"';

function response(body, status = 200) {
  return new Response(body, { status, headers: { "content-type": "text/plain" } });
}

function mockFetch({ gvizStatus = 200, rowBody = rowCsv } = {}) {
  return async (input) => {
    const url = String(input);
    if (url.includes("/edit?")) return response(metadataHtml);
    if (url.includes("/gviz/") && gvizStatus !== 200) return response("unavailable", gvizStatus);
    if (url.includes("range=A1%3AZZ4")) return response(headerCsv);
    if (url.includes("range=A5%3AZZ5")) return response(rowBody);
    throw new Error(`Unexpected URL: ${url}`);
  };
}

describe("Exact live-opportunity retrieval contract", () => {
  it("addresses the literal visible row and preserves unknown fields", async () => {
    const result = await readYoutoolaOpportunity({
      tab: "Travel & Mobility",
      row: 5,
      expectName: "Fuel Trip Calculator",
      fetchImpl: mockFetch(),
      now: () => new Date("2026-07-13T19:49:48.000Z"),
    });

    expect(result.source.visibleRow).toBe(5);
    expect(result.source.worksheetIdentifier).toBe(818425885);
    expect(result.normalized.sourceUtilityId).toBe("21");
    expect(result.normalized.utilityName).toBe("Fuel Trip Calculator");
    expect(result.unknownFields).toEqual({ Unmapped: "Preserved" });
    expect(result.retrieval.transport).toBe("gviz");
  });

  it("rejects an unknown tab without reading a nearby tab", async () => {
    await expect(
      readYoutoolaOpportunity({
        tab: "Travel and Mobility",
        row: 5,
        fetchImpl: mockFetch(),
      }),
    ).rejects.toMatchObject({ code: "UNKNOWN_TAB", exitCode: 4 });
  });

  it("rejects expected-name mismatches", async () => {
    await expect(
      readYoutoolaOpportunity({
        tab: "Travel & Mobility",
        row: 5,
        expectName: "Another Calculator",
        fetchImpl: mockFetch(),
      }),
    ).rejects.toMatchObject({ code: "EXPECTED_NAME_MISMATCH", exitCode: 8 });
  });

  it("rejects empty or out-of-range rows", async () => {
    await expect(
      readYoutoolaOpportunity({
        tab: "Travel & Mobility",
        row: 5,
        fetchImpl: mockFetch({ rowBody: "" }),
      }),
    ).rejects.toMatchObject({ code: "EMPTY_OR_OUT_OF_RANGE", exitCode: 6 });
  });

  it("falls back to public CSV only when GViz transport fails", async () => {
    const result = await readYoutoolaOpportunity({
      tab: "Travel & Mobility",
      row: 5,
      fetchImpl: mockFetch({ gvizStatus: 503 }),
    });
    expect(result.retrieval.transport).toBe("csv-export");
  });

  it("warns without mutating anything when approved source content changes", async () => {
    const result = await readYoutoolaOpportunity({
      tab: "Travel & Mobility",
      row: 5,
      fetchImpl: mockFetch({
        rowBody:
          '"21","Fuel Trip Calculator","Changed source text","Fuel affiliates","Tier 1","Preserved"',
      }),
    });
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "SOURCE_HASH_CHANGED" }),
    );
  });
});
