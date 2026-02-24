# Firestore BigQuery Export v0.2.6 MRE (Issue #2535)

This Minimal Reproducible Example (MRE) demonstrates the YAML parsing error encountered when deploying the `firebase/firestore-bigquery-export` extension version **0.2.6** with a **multi-wildcard** `COLLECTION_PATH`, as reported in [firebase/extensions#2535](https://github.com/firebase/extensions/issues/2535).

## Environment

- **Extension:** `firebase/firestore-bigquery-export@0.2.6`
- **Working version (for comparison):** `firebase/firestore-bigquery-export@0.1.56` (not used in this MRE, but referenced in the issue)
- **Firebase CLI:** 13.x (any recent CLI that supports extensions should reproduce the issue)
- **Project type:** Firestore multi-region (issue used `nam5`) via `DATABASE_REGION=nam5`

## Project Structure

This MRE follows the `cloud-team-mre` convention `<organization>/<repository>/<mre-directory>`:

- `firebase/extensions/issue-2535/`
  - `firebase.json`
  - `.firebaserc`
  - `extensions/`
    - `firestore-bigquery-export-callinsights.env`

## Configuration

### `firebase.json`

Configures a single extension instance using the broken version **0.2.6**:

```json
{
  "extensions": {
    "firestore-bigquery-export-callinsights": "firebase/firestore-bigquery-export@0.2.6"
  }
}
```

### `extensions/firestore-bigquery-export-callinsights.env`

Environment configuration matching the issue, including the **multi-wildcard** `COLLECTION_PATH`:

```bash
BIGQUERY_PROJECT_ID=${param:PROJECT_ID}
DATABASE_REGION=nam5
COLLECTION_PATH={org_id}/{client_id}/data/call_records/data
DATASET_ID=my_dataset
DATASET_LOCATION=us
TABLE_ID=call_insights
WILDCARD_IDS=true
```

This is sufficient to reach the Deployment Manager stage where the YAML parsing fails because the `value` in the extension spec is unquoted:

```yaml
eventFilters:
  - attribute: document
    value: ${COLLECTION_PATH}/{documentId}
    operator: match-path-pattern
```

With the above env, this becomes:

```yaml
value: {org_id}/{client_id}/data/call_records/data/{documentId}
```

which the YAML parser misinterprets as a flow mapping and fails to parse.

### `.firebaserc`

Default project placeholder (replace with your own project if needed):

```json
{
  "projects": {
    "default": "dev-extensions-testing"
  }
}
```

You can update the default project with:

```bash
firebase use <your-project-id>
```

## Prerequisites

- Firebase project on Blaze plan
- Firestore and BigQuery APIs enabled
- Firebase CLI installed and authenticated:
  - `npm install -g firebase-tools`
  - `firebase login`

## Steps to Reproduce

1. Change directory into this MRE:

   ```bash
   cd cloud-team-mre/firebase/extensions/issue-2535
   ```

2. Ensure you are targeting the correct Firebase project (or update `.firebaserc`):

   ```bash
   firebase use <your-project-id>
   ```

3. Deploy the extension:

   ```bash
   firebase deploy --only extensions --force
   ```

4. Observe the deployment failure from Google Cloud Deployment Manager with an HTTP 412 error and YAML parsing error similar to:

   ```text
   error updating deployment: DM HTTP 412 error

   Error parsing configuration: while parsing a block mapping
   in 'string', line 71, column 19:
       - attribute: document
         ^
   expected <block end>, but found '<scalar>'
   in 'string', line 73, column 34:
       value: {org_id}/{client_id}/data/call_records/data/{documentId}
              ^
   ```

## Expected vs Actual Behavior

- **Expected (per v0.1.56):**
  - Deployment succeeds for collection paths with:
    - Single wildcard: `posts/{postId}/comments`
    - Multiple wildcards: `{org_id}/{client_id}/data/call_records/data`

- **Actual (v0.2.6):**
  - Deployment succeeds for simple/single-wildcard paths.
  - Deployment **fails** for multi-wildcard paths like `{org_id}/{client_id}/data/call_records/data` with a YAML parsing error from Deployment Manager.

## Notes

- The failure is triggered purely by the combination of:
  - v2 functions event trigger using `eventFilters.document.value` unquoted, and
  - a `COLLECTION_PATH` containing multiple `{...}` wildcards.

