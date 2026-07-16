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

Operational response targets are: Critical containment begins immediately with a 15-minute target; High within four hours; Medium remediation normally within seven days; Low in the next maintenance cycle. Every incident record names the trigger, severity, authority, response target, containment, source alignment, evidence, follow-up and whether user notice is warranted.

The same classification covers failed builds/deployments, smoke failures, deployment-commit mismatches, alias/DNS incidents, outages, wrong calculations, data exposure, secret leaks, indexing failures, analytics-before-consent, provider outages, commercial misrepresentation, environment defects, header regressions, temporary 503 use and release-record corrections. Provider-specific cases remain inactive until their provider is approved.

For GA4 containment, remove or disable the two Production-only analytics variables, allow the resulting Production build to reach Ready, and verify pre-consent and post-rejection provider silence. Record the configuration change and deployment, then revert or correct source through protected `main`. Do not promise deletion of provider cookies unless the qualified privacy decision explicitly requires and defines it.

Route withdrawal must preserve an explicit indexing decision. Provider and commercial integrations must have an owner-approved disablement path before activation. Phase 9 creates policy only and activates nothing.

Only the Youtoola owner authorises a rollback or emergency hotfix. The operator records the affected and rollback deployment IDs/commits before acting, runs the package-free Production smoke after containment, and then restores repository alignment through a protected-main revert. Vercel restoration alone is not the durable source fix.

Recovery sources and quarterly checks are defined in `docs/operations/domain-and-recovery.md`. Staging, automated rollback and paid incident monitoring remain deferred until measured risk justifies them.
