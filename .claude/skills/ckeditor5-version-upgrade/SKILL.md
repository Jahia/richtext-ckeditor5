---
name: ckeditor5-version-upgrade
description: Check the licensing of a CKEditor 5 release before raising the CKEditor 5 packages of richtext-ckeditor5 (ckeditor5, ckeditor5-premium-features, @ckeditor/ckeditor5-theme-lark). Use before any CKEditor 5 version bump, and when the editor fails to start or every Cypress spec fails with CKEditorError license-key-lts-not-allowed.
---

# Upgrade CKEditor 5

## Check the release line before the bump

CKEditor 5 publishes Long-term Support (LTS) lines. An LTS line is open to every license for its
first six months (the Active phase). The releases of its Maintenance phase are for LTS subscribers
only.

The 47 line is an LTS line. Every release of the 47.7 line is for LTS subscribers only. CKEditor
states it in the
[error reference](https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-license-key-lts-not-allowed).
A bump to a later release of the 47 line, or of any later LTS line in its Maintenance phase, needs
the same check.

Before you raise the version, read the release notes and the
[LTS Edition page](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/using-lts-edition.html),
and confirm that the target release is not reserved for LTS subscribers.

## Why it breaks the module

`src/javascript/CKEditor/JahiaClassicEditor.js` sets the license key of the editor: the commercial
key in productivity mode, `'GPL'` otherwise.

A release reserved for LTS subscribers refuses both keys, unless the commercial key includes LTS
access. The editor throws on start:

```
CKEditorError: license-key-lts-not-allowed
```

In CI, every spec that opens an editor then fails in the `Integration Tests` job. The Cypress
output, in the job log and in `results/cypress.log` of the run's
`richtext-ckeditor5-standalone-artifacts-<n>` artifact, shows the error as an uncaught exception,
followed by element timeouts, while Jahia is healthy. A green build and lint prove
nothing here: the check runs in the browser, when the editor starts.

## What to do instead

- Stay on the last release of the line that every license can use, such as 47.6.x.
- Or move to the next regular major line. The move to v48 is tracked in
  [Jahia/richtext-ckeditor5#314](https://github.com/Jahia/richtext-ckeditor5/issues/314).
- A dependency of CKEditor 5 that needs a newer version can be raised alone with a `resolutions`
  entry in `package.json`, without changing the CKEditor 5 version.

The case that taught this rule:
[Jahia/richtext-ckeditor5#369](https://github.com/Jahia/richtext-ckeditor5/pull/369), a bump to
47.7.6, closed.
