import {registry} from '@jahia/ui-extender';
import {JahiaClassicEditor} from '~/CKEditor/JahiaClassicEditor';
import {JahiaBalloonEditor} from '~/CKEditor/JahiaBalloonEditor';
import {config} from '~/CKEditor/configurations';
import Constants from '~/RichTextCKEditor5.constants';

const {
    MODULE_KEY,
    CONFIG_KEY,
    PLUGINS_KEY,
    BALLOON_PLUGINS_KEY
} = Constants.registry;

export function registerConfig() {
    defineConfig('default', config);

    /**
     * Make config override function available through registry (to be tested) e.g.
     * 
     * ```
     * const defineConfig = window.jahia.uiExtender.registry.get('richtext-ckeditor5', 'init');
     * defineConfig('my-override', {...[config override]})
     * ```
     */
    registry.addOrReplace(MODULE_KEY, 'init', defineConfig);
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
    registry.addOrReplace(PLUGINS_KEY, key, {targets: ['classic'], plugins: plugins?.classic || plugins || []});
    registry.addOrReplace(BALLOON_PLUGINS_KEY, key, {targets: ['balloon'], plugins: plugins?.balloon || []});

    initConfig();
}

function initConfig() {
    JahiaClassicEditor.builtinPlugins = registry.find({type: PLUGINS_KEY}).map(m => m.plugins).flat();
    JahiaBalloonEditor.builtinPlugins = registry.find({type: BALLOON_PLUGINS_KEY}).map(m => m.plugins).flat();

    const defaultConfig = registry.get(CONFIG_KEY, 'default');
    // TODO how do we deal with global overrides
    JahiaClassicEditor.defaultConfig = defaultConfig;
}
