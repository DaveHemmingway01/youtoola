import { getPublicEligibleUtilities, getPublicRelationshipsForUtility } from "@/lib/knowledge";

export interface PublicRelatedTool {
  description: string;
  href: string;
  name: string;
  rationale: string;
  utilityId: string;
}

export function getPublicRelatedToolsForUtility(utilityId: string): readonly PublicRelatedTool[] {
  const publicUtilities = getPublicEligibleUtilities();
  return getPublicRelationshipsForUtility(utilityId)
    .flatMap((relationship) => {
      const target = publicUtilities.find(
        (utility) => utility.entityId === relationship.targetEntityId,
      );
      if (!target?.description) return [];
      return [
        Object.freeze({
          description: target.description,
          href: `/${target.slug}`,
          name: target.name,
          rationale: relationship.rationale,
          utilityId: target.utilityId,
        }),
      ];
    })
    .toSorted((left, right) => left.name.localeCompare(right.name, "en"));
}
