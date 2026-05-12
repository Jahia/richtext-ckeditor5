# richtext-ckeditor5 Changelog

## 0.1.0

### New Features

* Changed YAML config to CFG config for better compatibility. (#307)

* Allow to exclude toolbar items using config (#295)

  This is a breaking change, richtext API response has changed.

* Update default z-index of ck to 1 (#292)

* Document how macros is used in CK5 (#311)

* Prevent null value from breaking the editor (#291)

* Properly refresh image command (#298)

* Added AI Assistant support with a server-side proxy for OpenAI (#316, #317, #319)

  * OpenAI request parameters and key configured through OSGi configuration

* Remove references to deprecated methods (#297)

* Use CK5 is CK4 is not installed.

* Use choicelist values for macros (#301)

* Enable mention plugin and add macros (#296)

### Bug Fixes

* Fix UI issue with clipping for long toolbar menus (#178, #188)

* Ckeditor library version bump to v47 (#290)

* Fix for config resolution in case the CND config is invalid.
