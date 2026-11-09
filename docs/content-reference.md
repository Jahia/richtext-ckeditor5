# Reference existing content (proof of concept)

An author can place an existing content item inside a rich text. The text stores a reference to the
item, not a copy of it. When the page renders, Jahia renders the referenced item in place, so the text
always shows the current version of the item.

## In the editor

The toolbar button **Reference existing content** opens the content picker. The picker offers the
droppable content of the site (`jmix:droppableContent`), so an author cannot pick a page or a folder. In
the configurations with a menu bar, the **Insert** menu holds the same entry.

The editor shows each reference as a card. The card shows the display name of the item, its system
name, its type, and the view it renders with. Clicking the card opens a balloon toolbar:

- **Replace referenced content** opens the picker on the current item.
- The view dropdown lists the default view and the views of the item's type that the site can use. A
  stored view that no longer exists appears as unavailable.
- **Remove reference** deletes the reference from the text.

The editor refuses a page, a folder, a content list and the rich text itself as a reference. The card of
a reference whose item is missing or not readable says so and shows the identifier.

## Stored HTML

The text holds an empty block element:

```html
<div class="jahia-content-reference" data-jahia-ref="0f3c2a51-7d7e-4c0b-9a51-2f1e3b9c8d10" data-jahia-view="refcard"></div>
```

- `class` is exactly `jahia-content-reference`.
- `data-jahia-ref` is the JCR identifier of the item, in lower case. An element whose identifier does
  not match `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$` is not a reference: the
  editor keeps it as plain HTML and the server leaves it alone.
- `data-jahia-view` names the view. It is absent for the default view. A value that does not match
  `^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$` is dropped, and the default view applies.
- The element has no content. The editor drops any content it finds inside, and the server ignores it.

The text stores no display name and no rendered output, so it never holds a stale copy of the item.

## Rendering

A render filter of this module expands the references in the HTML output of **any rich text**: a
`jnt:bigText` and the rich-text property of a custom type alike. It runs in edit, preview and live mode,
on the `html` template types, and skips the `wrapper` and `option` configurations. Output with no
`data-jahia-ref` passes through untouched.

For each reference, the filter renders the item as a module, with the stored view when the type has it
and the default view otherwise, under the current user, workspace and language. The result replaces the
placeholder:

```html
<div class="jahia-content-reference-rendered">…the rendered item…</div>
```

The rendered wrapper carries no `data-jahia-ref`, so the output is never expanded twice, and pasting
rendered HTML into an editor does not create a reference.

In page builder, the referenced item is part of the text: it has no module chrome of its own, and an
author selects and edits the rich text that holds it. To edit the item itself, open it from jContent.

When a reference cannot be rendered, the filter writes a notice in edit and preview mode, and nothing in
live mode:

```html
<div class="jahia-content-reference-rendered jahia-content-reference-missing">Referenced content not found or not accessible</div>
```

This happens when the item does not exist, the user cannot read it, its type is refused, the rendering
fails, or the reference makes a loop. A refused type is a page, a folder, a content list or a site, or
any type that derives from one of them, such as an area. A loop is a reference to a node that encloses
it in the current render, or a nesting of five levels or more.

Three limits bound the work of one request:

- A rich text expands at most 20 references; the rest render as missing.
- A rich text renders each pair of item and view once, and reuses the output for its repeated
  references.
- A request expands at most 100 references across all its rich texts; the rest render with the loop
  notice. Without this budget, five texts that each reference the next one 20 times would cost about
  160,000 renders.

The editor checks a refused type on the server too, through the type hierarchy, so it refuses a subtype
in the picker and shows its card as missing.

## Publication and cache

The referenced item is published on its own. Publishing the rich text does not publish the item, and a
reference to an unpublished item renders nothing in live.

The rendered rich text depends on the item in the cache, so publishing or editing the item flushes the
text. In live mode, a reference to an item that is not published yet also registers the item, so its
first publication flushes the text.

Each referenced item renders as its own cache fragment. Whether a nested reference shows the loop
notice depends on the texts that enclose it, so the filter passes their identifiers to the fragment as
the module parameter `contentReferenceAncestors`. The parameter is part of the cache key, so an item
nested under different texts, or at a different depth, gets a fragment of its own. When the cache
regenerates a fragment alone, the filter rebuilds the enclosing texts from that parameter.

## HTML filtering

A site that filters the HTML of rich texts must keep the placeholder:

- the `div` element. A site whose `j:filteredTags` lists `div` deletes every reference on save;
- the `class` attribute with the value `jahia-content-reference`;
- the `data-jahia-ref` and `data-jahia-view` attributes.

When the site uses the html-filtering module, its policy must allow these on `div`.

## Hiding the feature

Add `jahiaContentReference` to `excludeToolbarItems` in `org.jahia.modules.richtextCKEditor5.cfg`,
globally or in a configuration:

```properties
excludeToolbarItems[0]=jahiaContentReference
```

This hides the toolbar button and the menu entry. The editor still loads the plugin, so the references
already stored in a text keep their cards and round-trip unchanged. The server still renders them.

## Limits of the proof of concept

- **Weak reference.** The text holds the identifier in an HTML attribute, not in a reference property.
  Jahia does not list the text as a usage of the item, does not warn when the item is deleted, does not
  publish the item with the text, does not remap the identifier on import, and a copy to another site
  keeps pointing at the original item.
- **Live cache and permissions.** A reference that one reader cannot read renders as an empty string,
  and the cache keeps that result under the key of the rich text. Another reader who shares that key
  but can read the item then gets the empty result too.
- **Live cache and the request budget.** The budget of 100 references counts per request, and nothing
  of it enters the cache key. A fragment rendered after the budget ran out keeps the empty result in
  live until the item or the text changes.
- **Internal attribute.** Page builder chrome is suppressed through the `inWrapper` request attribute of
  the module tag, which is an internal contract of Jahia, not a public API.
- **Consumers that do not render.** A headless or GraphQL consumer, and the search index, read the
  stored HTML: they see an empty placeholder, not the item.
