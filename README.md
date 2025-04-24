![GitHub tag (latest by version)](https://img.shields.io/github/v/tag/Jahia/richtext-ckeditor5?sort=semver)

<a href="https://www.jahia.com/">
    <img src="https://www.jahia.com/modules/jahiacom-templates/images/jahia-3x.png" alt="Jahia logo" title="Jahia" align="right" height="60" />
</a>

# richtext-ckeditor 5

Implementation of CKEditor 5 for Jahia.

## Getting Started

Compile and deploy the module using:

    mvn clean install

By default the module compiles all the Javascript in production mode. If you want to compile in development mode
(Javascript is not compressed) you can use the "dev" Maven
profile as in the following example:

    mvn clean install -P dev 

## Configuration

Default configuration is defined in `src/javascript/CKEditor/configurations` directory. You can create your own configuration by copying one of the existing ones and modifying it. The plugins have a separate file declaration (see `plugins-default.js`)

There are also a few configuration-related functions available in the registry by accessing `jahia.uiExtender.registry.get
('@jahia/ckeditor5', 'shared')` in the console.

To see the current default configuration, you can use the `jahia.uiExtender.registry.get('@jahia/ckeditor5', 'shared').getDefaultConfig()` function.

## CK5 enterprise/development license

Enterprise license is embedded in the builds through the use of secrets as part of the github actions workflow. 

For development, you would need to set CKEDITOR_PRODUCTIVITY_LICENSE environment variable locally to the development license key 


## Updating/Adding CKEditor5 plugins

When updating version ckeditor 5 version and its plugins, or adding new plugins, we need to make sure that all ckeditor5 versions across the plugins (including any 3rd party plugins) have the same version numbers, otherwise we will run into [ckeditor-duplicated-modules](https://support.ckeditor.com/hc/en-us/articles/10515221487388-How-can-I-fix-the-duplicated-modules-error-in-CKEditor-5) error, which is shown in the console log during ckeditor5 module init.

Specifically need to make sure that ckeditor dependencies are synced across plugins and we do not run into conflicts like these in `yarn.lock` (as in the case of `@webspellchecker/wproofreader-ckeditor5 plugin` for example):

```
ckeditor5@>=16.0.0:
  version "40.2.0"
  [...]

ckeditor5@^37.1.0:
  version "37.1.0"
  [...]
```

## Resources

Follow the guides available on https://ckeditor.com/docs/ckeditor5/latest/framework and enjoy the document editing.
