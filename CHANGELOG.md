# richtext-ckeditor5 Changelog

## 1.1.0

* Mask openai key in config (#340)

* Downgrade org.apache.commons#commons-lang3 from 3.18.0 to 3.12.0 for compatibility.

## 1.0.0

### New Features

* Changed YAML config to CFG config for better compatibility. (#307)

* Allow to exclude toolbar items using config (#295)

  This is a breaking change, richtext API response has changed.

* Update default z-index of ck to 1 (#292)

* Add optional richtext max-height (`richtextMaxHeight`) in CK5 configuration (#325)

* Document how macros is used in CK5 (#311)

* Prevent null value from breaking the editor (#291)

* Properly refresh image command (#298)

* Added AI Assistant support with a server-side proxy for OpenAI (#316, #317, #319)

  * OpenAI request parameters and key configured through OSGi configuration

* Remove references to deprecated methods (#297)

* Configurable style templates for easier editing and injectable template set styles into the editor content.

* CK5 is now disabled by default, and existing sites are no longer marked as ignored in config. If CK4 is not installed, CK5 will be used at all times.

* Use choicelist values for macros (#301)

* Enable mention plugin and add macros (#296)

### Bug Fixes

* Links coming from link picker and image picker are encoded now, and support `+` symbols in them.

* Fix UI issue with clipping for long toolbar menus (#178, #188)

* Ckeditor library version bump to v47 (#290)

* Fix for config resolution in case the CND config is invalid.
