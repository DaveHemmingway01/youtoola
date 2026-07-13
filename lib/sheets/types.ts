export interface SourceWarning {
  code: string;
  message: string;
}

export interface RetrievedOpportunity {
  schemaVersion: 1;
  source: {
    spreadsheetId: string;
    spreadsheetTitle: string;
    tabName: string;
    worksheetIdentifier?: number;
    visibleRow: number;
    sourceUrl: string;
  };
  rawFields: Record<string, string>;
  normalized: {
    sourceUtilityId: string;
    utilityName: string;
    coreUse?: string;
    category?: string;
    searchIntent?: string;
    monetisationRoute?: string;
    premiumOpportunity?: string;
    complexity?: string;
    priority?: string;
  };
  unknownFields: Record<string, string>;
  missingFields: string[];
  warnings: SourceWarning[];
  retrieval: {
    retrievedAt: string;
    transport: "gviz" | "csv-export";
  };
  sourceContentHash: `sha256:${string}`;
}
