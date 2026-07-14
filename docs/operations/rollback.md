# Rollback and Containment

Every candidate release identifies the current Ready Production deployment and a protected-main recovery plan before SHIP.

## Failure mapping

| Failure | Immediate containment | Durable source alignment |
| --- | --- | --- |
| Site-wide runtime, build or severe performance failure | Restore the previous Ready Vercel deployment | Revert the merge through protected `main` |
| Incorrect utility result | Withdraw or disable the affected route; restore the previous deployment when broad | Revert or approve a tested correction |
| Analytics or consent defect | Disable analytics/provider delivery immediately | Revert the integration or approved configuration |
| Commercial defect | Deactivate the capability/provider | Revert the activation record or implementation |
| Indexing or canonical defect | Restore the prior deployment when site-wide; correct crawl behavior urgently | Revert or merge the reviewed metadata fix |
| External provider failure | Disable the provider and preserve the free utility | Correct separately without coupling utility availability |
| Short transient infrastructure outage | Use a temporary 503 only with a defined recovery window | Remove it promptly and document the incident |

Vercel restoration is immediate containment; it does not rewrite Git history. A protected-main revert restores repository and deployment alignment. Do not force-push, silently edit Production or rely on an undocumented manual toggle.

Critical failures require immediate owner notification and containment. Material High failures require same-day notification and containment or rollback. Record the failure, decision, deployment IDs, commits, timestamps, smoke results and follow-up owner.

Route withdrawal must preserve an explicit indexing decision. Provider and commercial integrations must have an owner-approved disablement path before activation. Phase 9 creates policy only and activates nothing.
