import type { EntityId, EntityType } from "./types";

export const ENTITY_ID_PATTERN =
  /^(platform|utility|category|journey|intent|concept|formula-family|unit|source|jurisdiction):[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function getEntityType(entityId: string): EntityType | undefined {
  if (!ENTITY_ID_PATTERN.test(entityId)) return undefined;
  return entityId.slice(0, entityId.indexOf(":")) as EntityType;
}

export function isEntityId(value: string): value is EntityId {
  return ENTITY_ID_PATTERN.test(value);
}
