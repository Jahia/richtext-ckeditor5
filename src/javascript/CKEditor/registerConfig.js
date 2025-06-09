import {registry} from '@jahia/ui-extender';
import {JahiaClassicEditor} from '~/CKEditor/JahiaClassicEditor';
import {defaultConfig, minimalConfig, lightConfig, advancedConfig} from '~/CKEditor/configurations';
import Constants from '~/RichTextCKEditor5.constants';

const {
    MODULE_KEY,
    CONFIG_KEY,
    PLUGINS_KEY
} = Constants.registry;

export function registerConfig() {
    defineConfig('default', defaultConfig);
    defineConfig('minimal', minimalConfig);
    defineConfig('light', lightConfig);
    defineConfig('advanced', advancedConfig);
    initConfig('default');

    /**
     * Make config override function available through registry (to be tested) e.g.
     * ```
     * const {defineConfig} = window.jahia.uiExtender.registry.get('@jahia/ckeditor5', 'shared');
     * defineConfig('my-override', {...[config override]})
     * ```
     */
    // expose (some) shared functions through registry with registry.get('@jahia/ckeditor5', 'shared');
    registry.addOrReplace(MODULE_KEY, 'shared', {
        defineConfig,
        getDefaultConfig
    });
}

export function getDefaultConfig() {
    return registry.get('ckeditor5-config', 'default');
}

/**
 * Define ckeditor5 config and plugins in the registry, and initialize them in the editor.
 */
export function defineConfig(key, config) {
    const {plugins, ...configProps} = config;
    if (registry.get(CONFIG_KEY, key)) {
        console.warn(`Config ${key} already exists.`);
    } else {
        registry.addOrReplace(CONFIG_KEY, key, configProps);
    }

    if (registry.get(PLUGINS_KEY, key)) {
        console.warn(`Plugin with ${key} already exists.`);
    } else {
        registry.addOrReplace(PLUGINS_KEY, key, {plugins: plugins || []});
    }
}

export function initConfig(key) {
    JahiaClassicEditor.builtinPlugins = registry.find({type: PLUGINS_KEY}).map(m => m.plugins).flat();
    JahiaClassicEditor.defaultConfig = registry.get(CONFIG_KEY, key);
}
