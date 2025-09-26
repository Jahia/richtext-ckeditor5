![GitHub tag (latest by version)](https://img.shields.io/github/v/tag/Jahia/richtext-ckeditor5)

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

Default configuration is defined in `src/javascript/CKEditor/configurations` directory. You can create your own configuration by copying one of the existing ones and modifying it. The plugins have a separate file declaration (see `plugins-complete.js`)

There are also a few configuration-related functions available in the registry by accessing `jahia.uiExtender.registry.get
('@jahia/ckeditor5', 'shared')` in the console.

To see configurations, you can use `jahia.uiExtender.registry.get('ckeditor5-config', '<configuration-name>')`. Available configurations are: `complete`, `advanced`, `light`, `minimal`.

To register custom configuration, you can use the `jahia.uiExtender.registry.get('@jahia/ckeditor5', 'shared').defaultConfig('configKey', {plugins...})` function.

You can look at [test-richtext-config](https://github.com/Jahia/test-ckeditor5-config) module for an example.

### Setting up configuration

Configuration setup is done via `org.jahia.modules.richtextCKEditor5.yaml` file. Configuration can be applied to specific sites by specifying 
site keys or globally by omitting site keys. Additionally, you can choose to have a permission-backed configuration, in which case only users with that permission 
will be able to access it. Note that the system will look for first available configuration (in the order they appear). Therefor configurations with the strongest permissions must come first for them to be considered.

Here's an example of configuration:

```
configs:
  - siteKeys:
      - site4
      - site5
    name: "customConfig"
  - siteKeys:
      - site6
    name: "site6Config"
    permission: "somePermission"
  - name: "defaultConfigWithPermission"
    permission: "somePermissionForDefaultConfig"  
 - name: "defaultConfigWITHOUTPermission"
```
As long as CK5 is enabled sites _site4_ and _site5_ will always use `customConfig`.

Site _site6_ will only use `site6Config` if the user has `somePermission`. Otherwise, it will be a choice between `defaultConfigWithPermission` and `defaultConfigWITHOUTPermission` 
depending on if the user has `somePermissionForDefaultConfig`.

All other sites will use either `defaultConfigWithPermission` or `defaultConfigWITHOUTPermission` depending on availability of `somePermissionForDefaultConfig`permission.

Note that this can be combined with `excludeSites` and `includeSites` to achieve powerful results.

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
