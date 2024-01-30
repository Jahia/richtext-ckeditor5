import {registry} from '@jahia/ui-extender';
import {JahiaClassicEditor} from '~/CKEditor/JahiaClassicEditor';
import {config} from '~/CKEditor/configurations';
import Constants from '~/RichTextCKEditor5.constants';

const {
    MODULE_KEY,
    CONFIG_KEY,
    PLUGINS_KEY
} = Constants.registry;

export function registerConfig() {
    defineConfig('default', config);

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

export function defineConfig(key, config) {
    const {plugins, ...configProps} = config;
    if (registry.get(CONFIG_KEY, key)) {
        console.warn(`Config ${key} already exists. Overriding...`);
    }
    registry.addOrReplace(CONFIG_KEY, key, configProps);

    if (registry.get(PLUGINS_KEY, key)) {
        console.warn(`Plugin with ${key} already exists. Overriding...`);
    }
    registry.addOrReplace(PLUGINS_KEY, key, {plugins: plugins || []});

    initConfig();
}

export function getDefaultConfig() {
    return registry.get('ckeditor5-config', 'default');
}

function initConfig() {
    JahiaClassicEditor.builtinPlugins = registry.find({type: PLUGINS_KEY}).map(m => m.plugins).flat();

    const defaultConfig = registry.get(CONFIG_KEY, 'default');
    // TODO how do we deal with global overrides
    JahiaClassicEditor.defaultConfig = defaultConfig;
}
