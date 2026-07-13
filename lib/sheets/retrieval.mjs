import {
  APPROVED_SOURCE_RECORDS,
  APPROVED_WORKSHEETS,
  SOURCE_SCHEMA_VERSION,
  YOUTOOLA_SPREADSHEET_ID,
  YOUTOOLA_SPREADSHEET_TITLE,
  YOUTOOLA_SPREADSHEET_URL,
} from "./constants.mjs";
import { parseCsv } from "./csv.mjs";
import {
  SourceValidationError,
  findHeaderRow,
  normalizeSourceRow,
  normalizeWhitespace,
} from "./normalization.mjs";
import { createSourceHash } from "./source-hash.mjs";

const A1_MAX_COLUMN = "ZZ";
const FETCH_TIMEOUT_MS = 15_000;

export class SheetReadError extends Error {
  constructor(code, exitCode, message, cause) {
    super(message, { cause });
    this.name = "SheetReadError";
    this.code = code;
    this.exitCode = exitCode;
  }
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

async function fetchText(url, fetchImpl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, {
      cache: "no-store",
      headers: { "cache-control": "no-cache", pragma: "no-cache" },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export function parseSpreadsheetMetadata(html) {
  const titleMatch = html.match(/<title>([^<]+?)(?:\s+-\s+Google Sheets)?<\/title>/i);
  const tabMatches = [
    ...html.matchAll(/docs-sheet-tab-caption[^>]*>([^<]+)<\/div>/gi),
  ].map((match) => normalizeWhitespace(decodeHtml(match[1])));

  if (!titleMatch || tabMatches.length === 0) {
    throw new SheetReadError(
      "METADATA_UNAVAILABLE",
      4,
      "Public spreadsheet metadata could not be resolved.",
    );
  }

  return {
    title: normalizeWhitespace(decodeHtml(titleMatch[1])),
    tabs: [...new Set(tabMatches)],
  };
}

async function readMetadata(fetchImpl, cacheBust) {
  try {
    const separator = YOUTOOLA_SPREADSHEET_URL.includes("?") ? "&" : "?";
    const html = await fetchText(
      `${YOUTOOLA_SPREADSHEET_URL}${separator}cacheBust=${cacheBust}`,
      fetchImpl,
    );
    return parseSpreadsheetMetadata(html);
  } catch (error) {
    if (error instanceof SheetReadError) throw error;
    throw new SheetReadError(
      "SPREADSHEET_INACCESSIBLE",
      3,
      "The public spreadsheet could not be accessed. Public access may have been removed.",
      error,
    );
  }
}

function buildGvizUrl(tab, range, cacheBust) {
  const query = new URLSearchParams({
    tqx: "out:csv",
    sheet: tab,
    range,
    headers: "0",
    cacheBust,
  });
  return `https://docs.google.com/spreadsheets/d/${YOUTOOLA_SPREADSHEET_ID}/gviz/tq?${query}`;
}

function buildCsvExportUrl(gid, range, cacheBust) {
  const query = new URLSearchParams({
    format: "csv",
    gid: String(gid),
    range,
    cacheBust,
  });
  return `https://docs.google.com/spreadsheets/d/${YOUTOOLA_SPREADSHEET_ID}/export?${query}`;
}

async function readRanges({ tab, row, transport, fetchImpl, cacheBust }) {
  const worksheet = APPROVED_WORKSHEETS[tab];
  const headerRange = `A1:${A1_MAX_COLUMN}${row - 1}`;
  const rowRange = `A${row}:${A1_MAX_COLUMN}${row}`;
  const builder = transport === "csv-export"
    ? (range) => buildCsvExportUrl(worksheet.gid, range, cacheBust)
    : (range) => buildGvizUrl(tab, range, cacheBust);

  if (transport === "csv-export" && !worksheet?.gid) {
    throw new SheetReadError(
      "CSV_GID_UNAVAILABLE",
      4,
      `CSV fallback has no approved gid for tab "${tab}".`,
    );
  }

  try {
    const [headerText, rowText] = await Promise.all([
      fetchText(builder(headerRange), fetchImpl),
      fetchText(builder(rowRange), fetchImpl),
    ]);
    return {
      headerRows: parseCsv(headerText),
      targetRows: parseCsv(rowText),
      transport,
    };
  } catch (error) {
    if (error instanceof SheetReadError) throw error;
    throw new SheetReadError(
      "TRANSPORT_FAILURE",
      3,
      `${transport === "gviz" ? "GViz" : "CSV export"} retrieval failed.`,
      error,
    );
  }
}

async function readWithTransport(options) {
  if (options.transport === "gviz" || options.transport === "csv-export") {
    return readRanges(options);
  }

  try {
    return await readRanges({ ...options, transport: "gviz" });
  } catch (primaryError) {
    if (!(primaryError instanceof SheetReadError) || primaryError.code !== "TRANSPORT_FAILURE") {
      throw primaryError;
    }
    return readRanges({ ...options, transport: "csv-export" });
  }
}

export async function readYoutoolaOpportunity({
  tab,
  row,
  expectName,
  transport = "auto",
  fetchImpl = fetch,
  now = () => new Date(),
} = {}) {
  if (typeof tab !== "string" || normalizeWhitespace(tab) === "") {
    throw new SheetReadError("INVALID_TAB_ARGUMENT", 2, "--tab is required.");
  }
  if (!Number.isSafeInteger(row) || row < 2) {
    throw new SheetReadError(
      "INVALID_ROW_ARGUMENT",
      2,
      "--row must be a literal 1-based visible row greater than 1.",
    );
  }
  if (!new Set(["auto", "gviz", "csv-export"]).has(transport)) {
    throw new SheetReadError(
      "INVALID_TRANSPORT_ARGUMENT",
      2,
      "--transport must be auto, gviz, or csv-export.",
    );
  }

  const exactTab = normalizeWhitespace(tab);
  const cacheBust = `${now().getTime()}-${Math.random().toString(36).slice(2)}`;
  const metadata = await readMetadata(fetchImpl, cacheBust);

  if (!metadata.tabs.includes(exactTab)) {
    throw new SheetReadError(
      "UNKNOWN_TAB",
      4,
      `Unknown tab "${exactTab}". Exact available tabs: ${metadata.tabs.join(", ")}.`,
    );
  }
  const rangeResult = await readWithTransport({
    tab: exactTab,
    row,
    transport,
    fetchImpl,
    cacheBust,
  });

  try {
    const headers = findHeaderRow(rangeResult.headerRows);
    const targetRows = rangeResult.targetRows.filter((candidate) =>
      candidate.some((value) => normalizeWhitespace(value) !== ""),
    );
    if (targetRows.length === 0) {
      throw new SourceValidationError(
        "EMPTY_OR_OUT_OF_RANGE",
        `Visible row ${row} is empty or outside the populated range.`,
      );
    }
    if (targetRows.length > 1) {
      throw new SourceValidationError(
        "MALFORMED_ROW_RESPONSE",
        `Visible row ${row} returned more than one row.`,
      );
    }

    const values = normalizeSourceRow(headers, targetRows[0]);
    if (expectName && values.normalized.utilityName !== normalizeWhitespace(expectName)) {
      throw new SheetReadError(
        "EXPECTED_NAME_MISMATCH",
        8,
        `Expected "${normalizeWhitespace(expectName)}" at ${exactTab} row ${row}, found "${values.normalized.utilityName}".`,
      );
    }

    const worksheet = APPROVED_WORKSHEETS[exactTab];
    const source = {
      spreadsheetId: YOUTOOLA_SPREADSHEET_ID,
      spreadsheetTitle: metadata.title || YOUTOOLA_SPREADSHEET_TITLE,
      tabName: exactTab,
      ...(worksheet?.gid ? { worksheetIdentifier: worksheet.gid } : {}),
      visibleRow: row,
      sourceUrl: worksheet?.gid
        ? `https://docs.google.com/spreadsheets/d/${YOUTOOLA_SPREADSHEET_ID}/edit?gid=${worksheet.gid}#gid=${worksheet.gid}`
        : YOUTOOLA_SPREADSHEET_URL,
    };
    const warnings = [
      {
        code: "PUBLIC_SOURCE",
        message: "The V1 workflow depends on the source Sheet remaining publicly readable.",
      },
      {
        code: "GVIZ_LIMITATION",
        message: "GViz and CSV expose displayed values but cannot reliably detect merged cells.",
      },
    ];
    if (metadata.title !== YOUTOOLA_SPREADSHEET_TITLE) {
      warnings.push({
        code: "SPREADSHEET_TITLE_CHANGED",
        message: `Expected spreadsheet title "${YOUTOOLA_SPREADSHEET_TITLE}", found "${metadata.title}".`,
      });
    }
    if (!worksheet?.gid) {
      warnings.push({
        code: "WORKSHEET_IDENTIFIER_UNAVAILABLE",
        message: `No approved CSV worksheet gid is recorded for "${exactTab}"; GViz retrieval remains available.`,
      });
    }
    if (exactTab === "Travel & Mobility" && values.missingFields.includes("category")) {
      warnings.push({
        code: "CATEGORY_FROM_TAB_CONTEXT",
        message: "Category is not a row field; Travel & Mobility maps to travel-mobility by owner decision.",
      });
    }

    const opportunity = {
      schemaVersion: SOURCE_SCHEMA_VERSION,
      source,
      rawFields: values.rawFields,
      normalized: values.normalized,
      unknownFields: values.unknownFields,
      missingFields: values.missingFields,
      warnings,
      retrieval: {
        retrievedAt: now().toISOString(),
        transport: rangeResult.transport,
      },
    };

    const result = {
      ...opportunity,
      sourceContentHash: createSourceHash(opportunity),
    };
    const approvedSource = APPROVED_SOURCE_RECORDS[`${exactTab}:${row}`];
    if (approvedSource && approvedSource.sourceContentHash !== result.sourceContentHash) {
      result.warnings.push({
        code: "SOURCE_HASH_CHANGED",
        message:
          approvedSource.releaseStatus === "released"
            ? "The released source has changed and requires mandatory owner impact review."
            : "The approved source has changed and requires review in the next approved planning task.",
      });
    }
    return result;
  } catch (error) {
    if (error instanceof SheetReadError) throw error;
    if (error instanceof SourceValidationError) {
      throw new SheetReadError(error.code, 6, error.message, error);
    }
    throw new SheetReadError(
      "ROW_VALIDATION_FAILURE",
      7,
      "The requested source row could not be validated.",
      error,
    );
  }
}
