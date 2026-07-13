# Utility Retrieval and Registry Operations

## Read an exact opportunity

```bash
npm run utility:read -- --tab "Travel & Mobility" --row 5
```

The row is the literal number shown in the Sheet margin. Use mismatch protection when a specific utility is expected:

```bash
npm run utility:read -- --tab "Travel & Mobility" --row 5 --expect-name "Fuel Trip Calculator"
```

Manual fixture verification:

```bash
npm run utility:read:live
npm run utility:read -- --tab "Travel & Mobility" --row 5 --transport csv-export
```

`--out path.json` writes a new file only and refuses to overwrite an existing file. JSON goes to stdout; categorized diagnostics go to stderr.

## Failure categories

- exit `2`: invalid arguments
- exit `3`: public access or transport failure
- exit `4`: metadata, unknown tab or missing approved worksheet mapping
- exit `6`: missing headers, empty row, malformed ID or formula error
- exit `7`: unexpected row validation failure
- exit `8`: expected-name mismatch
- exit `9`: output write failure

Never substitute a nearby row. If public access is removed, stop and request a separately approved authenticated-access plan.

## Add an idea

1. Retrieve the exact tab and visible row.
2. Review all raw, normalized, unknown and missing fields.
3. Confirm expected name and source hash.
4. Add only approved mappings to `data/registry/tools.ts`.
5. Leave unresearched fields absent.
6. Run `npm run registry:validate` and the full test suite.
7. Obtain owner approval for controlled status transitions.

An idea must not enter public selectors, sitemap, navigation or search.

## Source changes

Before release, record the changed hash for review in the next approved planning task. After release, stop and obtain owner impact review before changing specification, slug, formula, metadata or behavior.

## Future authenticated access

If public access ends or merge metadata becomes essential, create a new owner-approved plan for minimum-permission Google Sheets API access. Do not add credentials to client code, Preview, Production or tracked files.
