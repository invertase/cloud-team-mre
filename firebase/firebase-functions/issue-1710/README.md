# Reproduction of Firebase Functions v2 minInstances Update Issue

This section documents steps to reproduce the inability to update `minInstances` dynamically on Firebase Functions v2, along with observed errors.

## Background

Firebase Functions v2 run on Cloud Run under the hood. Cloud Run services normally allow updating `minInstances` dynamically via API or CLI (`gcloud run services update`). However, Firebase-managed Cloud Run services are not exposed to such direct modifications.

## Steps to Reproduce

### 1. Deploy a Firebase Functions v2 HTTP function with `minInstances`

Create a function in `functions/index.ts`:

```ts
import { initializeApp } from "firebase-admin/app";
import { onRequest as onRequestV2 } from "firebase-functions/v2/https";

initializeApp();

export const mininstancesrepro = onRequestV2(
  {
    minInstances: 0,
    maxInstances: 10,
    region: "us-central1",
  },
  (req, res) => {
    res.json({
      message: "Hello from Firebase Functions!",
      timestamp: new Date().toISOString(),
    });
  }
);
```

Deploy it:

```bash
firebase deploy --only functions --project=your_project
```


### 2. Attempt to update `minInstances` dynamically using Cloud Run CLI

Run the command:

```bash
gcloud run services update gcf-<project-id>-us-central1-mininstancesrepro \
  --platform managed \
  --region us-central1 \
  --min-instances=5
```

Replace `<project-id>` with your Firebase project ID, e.g.:

```bash
gcloud run services update gcf-extensions-testing-us-central1-mininstancesrepro \
  --platform managed \
  --region us-central1 \
  --min-instances=5
```

---

### 3. Observed Result

You receive this error:

```
ERROR: (gcloud.run.services.update) Service [gcf-extensions-testing-us-central1-mininstancesrepro] could not be found.
```

## Deduction

* The Firebase Functions v2 Cloud Run service is **not accessible** via Cloud Run API or CLI.
* This prevents runtime updates to `minInstances` without a full `firebase deploy`.
* This matches [GitHub issue #1710](https://github.com/firebase/firebase-functions/issues/1710).


## Conclusion

Currently, there is **no supported way to update `minInstances` programmatically at runtime** for Firebase Functions v2. This requires a redeploy to change scaling settings.


## References

* [Firebase Functions v2 GitHub Issue #1710](https://github.com/firebase/firebase-functions/issues/1710)
* [Google Cloud Run Services Update Docs](https://cloud.google.com/sdk/gcloud/reference/run/services/update)
* [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
