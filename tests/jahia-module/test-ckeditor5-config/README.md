# test-ckeditor5-config

Using Jahia 8 funcionality this module provides CKEditor 5 configuration.

You can find this configuration in `/javscript/apps/registerExtensions.js`.

That file registers configurations through both supported mechanisms:

- `window.jahia.uiExtender.registry` on the `jahiaApp-init:99.5` hook (`testConfigCK5`,
  `testConfigCK5Cnd`);
- the `window.jahiaCk5Init` hook (`hookConfigCK5`, `hookConfigCK5AfterFailure`), which is the
  mechanism available to modules without module federation. It also declares a hook that throws
  and a non-function entry, so the tests can check they are contained.
