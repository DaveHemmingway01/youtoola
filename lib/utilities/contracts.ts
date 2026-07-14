import type { SourceAuthorityClass, SourceEntityId } from "@/lib/knowledge/types";

export type UtilityRiskProfile =
  | "standard"
  | "data-dependent"
  | "regulated-high-consequence"
  | "unclassified";

export type UtilityInputType =
  | "text"
  | "number"
  | "currency"
  | "percentage"
  | "select"
  | "radio"
  | "checkbox"
  | "toggle";

export interface UtilityInputDefinition {
  accessibilityInstructions?: string;
  defaultValue?: string | boolean;
  errorMessages: Readonly<{
    invalid: string;
    max?: string;
    min?: string;
    required?: string;
  }>;
  helpText?: string;
  id: string;
  inputMode?: "decimal" | "email" | "numeric" | "search" | "tel" | "text" | "url";
  label: string;
  max?: number;
  min?: number;
  placeholder?: string;
  required: boolean;
  step?: number;
  type: UtilityInputType;
  unit?: string;
}

export interface UtilityOutputDefinition {
  id: string;
  label: string;
  unit?: string;
}

export interface UtilityCitation {
  authorityClass: SourceAuthorityClass;
  label: string;
  reviewedDate: string;
  sourceEntityId?: SourceEntityId;
  url?: `https://${string}`;
}

export interface UtilityMethodology {
  assumptions: readonly string[];
  calculationVersion: number;
  citations: readonly UtilityCitation[];
  formulaSteps: readonly string[];
  freshnessExpectation: string;
  limitations: readonly string[];
  methodologyVersion: number;
  reviewedDate: string;
  summary: string;
  workedExamples: readonly string[];
}

export type CommercialCapability = "advertising" | "affiliate" | "premium" | "lead";

export interface UtilityDefinition {
  analyticsEligibility: readonly UtilityAnalyticsEventName[];
  assumptions: readonly string[];
  calculationVersion: number;
  commercialEligibility: readonly CommercialCapability[];
  contentVersion: number;
  inputs: readonly UtilityInputDefinition[];
  methodology: UtilityMethodology;
  methodologyVersion: number;
  outputs: readonly UtilityOutputDefinition[];
  reviewAuthority: "Youtoola owner";
  reviewedDate: string;
  riskProfile: UtilityRiskProfile;
  supportedUnits: readonly string[];
  utilityId: string;
  warnings: readonly string[];
}

export type UtilityResultClassification = "exact" | "estimate";

export interface UtilityResultValue {
  displayUnit?: string;
  formatted: string;
  id: string;
  label: string;
  rawValue: number | string;
}

export interface UtilityCopyPayload {
  text: string;
  title: string;
}

export interface UtilityResult {
  assumptions: readonly string[];
  calculationVersion: number;
  classification: UtilityResultClassification;
  copyPayload?: UtilityCopyPayload;
  futureCapabilities: Readonly<{
    export: boolean;
    nativeShare: boolean;
  }>;
  limitations: readonly string[];
  methodologyReference: Readonly<{
    calculationVersion: number;
    methodologyVersion: number;
  }>;
  nonSensitiveResultType?: string;
  primary: UtilityResultValue;
  supporting: readonly UtilityResultValue[];
  warnings: readonly string[];
}

export type UtilityCalculationOutcome<T extends UtilityResult = UtilityResult> =
  | Readonly<{ ok: true; result: T }>
  | Readonly<{ error: UtilityCalculationError; ok: false }>;

export interface UtilityCalculationError {
  code: string;
  message: string;
}

export type UtilityAnalyticsEventName =
  | "tool_view"
  | "tool_start"
  | "tool_validation_error"
  | "tool_complete"
  | "result_share"
  | "result_export"
  | "related_tool_click"
  | "affiliate_click"
  | "premium_click"
  | "lead_start"
  | "lead_submit";
