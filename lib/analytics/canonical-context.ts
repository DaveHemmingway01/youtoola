import { getPublicDiscoveryTools, type PublicDiscoveryTool } from "@/lib/discovery";

import type { CanonicalAnalyticsContext } from "./contracts";

type AnalyticsIdentitySource = Pick<
  PublicDiscoveryTool,
  "categoryId" | "slug" | "utilityId"
>;

export function resolveCanonicalAnalyticsContext(
  utilityId: string,
  releasedTools: readonly AnalyticsIdentitySource[] = getPublicDiscoveryTools(),
  releaseReference?: string,
): CanonicalAnalyticsContext | undefined {
  const utility = releasedTools.find((candidate) => candidate.utilityId === utilityId);
  if (!utility) return undefined;

  return Object.freeze({
    categoryId: utility.categoryId,
    releasedTargetUtilityIds: Object.freeze(
      releasedTools
        .filter((candidate) => candidate.utilityId !== utility.utilityId)
        .map((candidate) => candidate.utilityId),
    ),
    ...(releaseReference ? { releaseReference } : {}),
    utilityId: utility.utilityId,
    utilitySlug: utility.slug,
  });
}
