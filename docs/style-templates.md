---
page:
  '$path': '/sites/academy/home/documentation/jahia/8_2/developer/extending-and-customizing-jahia-ui/configuring-and-customizing-ckeditor-menu/ckeditor-5-style-templates'
  'jcr:title': CKEditor 5 Style Templates
  'j:templateName': documentation
content:
  '$subpath': document-area/content
---

Style templates let your contributors apply pre-defined CSS classes to elements inside CKEditor 5 via a dedicated "Styles" dropdown in the toolbar. This page describes how to declare templates, the JSON shape, and how the editor loads the associated stylesheet.

The feature is intentionally limited to **styling**: a template applies CSS classes to an existing HTML element (paragraph, heading, etc.) — it never injects new markup, structure or content.

## Where the configuration lives

The configuration is read from the **current site's templates-set module** — the module declared by `j:templatesSet` on the site node. Ship a file named `ckeditor_styles.json` at the **root of your templates-set bundle** (typically `src/main/resources/ckeditor_styles.json`).

```
my-templates-set/
└── src/main/resources/
    ├── ckeditor_styles.json
    └── styles/
        └── templates.css
```

There is no per-node, per-content-type, or per-permission lookup. The same configuration applies to every CKEditor 5 instance opened on the site.

If the file is missing, malformed, or violates the schema below, the feature is silently disabled (no dropdown, no stylesheet) and a warning is logged under the `org.jahia.modules.ckeditor.styletemplates` logger.

## JSON shape

```json
{
  "templateStylesheet": "/css/templates.css",
  "templates": [
    { "name": "Red Paragraph",       "element": "p",  "classes": ["red-paragraph"] },
    { "name": "Highlighted Heading", "element": "h2", "classes": ["highlight"] },
    { "name": "Boxed Block",         "element": "p",  "classes": ["boxed", "padded"] }
  ]
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `templateStylesheet` | `string` | optional | Path of a CSS file inside the templates-set bundle. When present, the file is fetched, automatically scoped (see below), and injected into the document for every editor instance. The path must live under a folder that the module exposes as a static resource (see note below). |
| `templates` | `array` | optional | Style template definitions exposed in the toolbar dropdown. |
| `templates[].name` | `string` | required | Label shown to contributors in the dropdown. |
| `templates[].element` | `string` | required | HTML element the style applies to (`p`, `h1`, `h2`, `div`, ...). The contributor must place their caret inside an element of this type for the style to be applicable. |
| `templates[].classes` | `string[]` | required | CSS classes that get applied to the element when the style is selected. The array must be non-empty and every entry must be a non-empty string — a missing, empty, or partially-invalid `classes` array rejects the whole definition (and therefore the entire `ckeditor_styles.json`). |

Either field can be omitted independently: a configuration with only `templateStylesheet` loads the CSS without showing a dropdown; a configuration with only `templates` shows the dropdown without an associated stylesheet.

> **Note — the stylesheet must be statically served.** The editor fetches the CSS over HTTP from `/modules/<your-templates-set>/<templateStylesheet>`. A module only serves files from folders declared in its `Jahia-Static-Resources` manifest header, which by default is `/css,/icons,/images,/img,/javascript`. Put your stylesheet under one of those folders (for example `/css/templates.css`) — a file under an undeclared folder such as `/styles` will return `404` and the stylesheet will be silently skipped.

## CSS scoping (automatic)

You write **plain CSS** in your stylesheet — no scoping prefix required:

```css
p.red-paragraph {
    color: rgb(220, 38, 38);
    font-weight: bold;
}

h2.highlight {
    background-color: rgb(255, 235, 59);
}
```

When the editor opens, the module fetches the file, rewrites every selector to be prefixed with `.ck-content` (CK5's class for the editable area) using the `scope-css` library, and injects the result as a `<style>` element in `document.head`. Your rules therefore only affect content inside the editor and never leak into the surrounding Jahia UI.

The style element is automatically removed when the editor unmounts.

## Important — rendering styles on published pages

`templateStylesheet` is **only** loaded inside the editor. To make these styles visible on actual rendered pages, your templates-set MUST also include the same CSS in its page-rendering output. Without this, contributors will see styled content while editing but the live site will render the same content unstyled.

The recommended approach is to reference the very same CSS file from your templates-set's page template JSP:

```jsp
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<head>
    <link rel="stylesheet" type="text/css"
          href="<c:url value='/modules/my-templates-set/css/templates.css'/>"/>
</head>
```

Or via `<template:addResources type="css" resources="templates.css"/>` if you ship the file under `css/`. Whatever the mechanism, the same rules need to apply on the live page (without the `.ck-content` prefix that the editor adds internally).

## Toolbar interaction

The dropdown is bound to CK5's `style` toolbar item. It shows up whenever **both** conditions are met:

1. The resolved CKEditor configuration includes `style` in its toolbar.
2. `ckeditor_styles.json` provides at least one entry in `templates`.

If the `style` item is removed (either by the configuration's `toolbar.items` definition or globally via the `excludeToolbarItems` admin setting), the dropdown disappears — but the `templateStylesheet` keeps loading. This is deliberate: the same stylesheet can declare general content classes used outside the dropdown (for example, applied via the source-editing view, or via macros), and removing the dropdown should not strip that styling away.

## Fallback behavior

Any of the following collapses to "feature off" for that site:

- The site's templates-set has no `j:templatesSet` property.
- The declared module is not installed/active.
- The bundle does not contain `/ckeditor_styles.json`.
- The JSON cannot be parsed.
- The schema is violated (missing required field, wrong type, empty `name`, empty `classes` array, an empty or non-string entry inside `classes`, ...).
- `templateStylesheet` points to a file that does not exist in the bundle. (In this case templates are still loaded; only the stylesheet is skipped.)

In all these cases the editor falls back to its default behavior — no dropdown, no extra stylesheet — and the failure is recorded as a `WARN` log entry under `org.jahia.modules.ckeditor.styletemplates`.

## Caveats
- **Stylesheet scoping limitations.** Selectors that target `html`, `body`, or `:root` may not behave as authors expect once `scope-css` has rewritten them. Keep rules anchored to element + class combinations.
