---
# Allowed version bumps: patch, minor, major
richtext-ckeditor5: minor
---

Fixed resized images so that their URL carries the width, letting image optimization serve a smaller file. Custom configurations get this behavior with the `ImageResizeUrl` plugin, which the `ckeditor5` remote now exports (#354)
