import {registry} from '@jahia/ui-extender';
import {JahiaClassicEditor} from '~/CKEditor/JahiaClassicEditor';
import {config} from '~/CKEditor/configurations';
import Constants from '~/RichTextCKEditor5.constants';

const {
    MODULE_KEY,
    CONFIG_KEY,
    PLUGINS_KEY
} = Constants.registry;

const productivityPluginsNameAndKey = {
    "FormatPainter": true,
    'formatPainter': true,
    'ExportPdf': true,
    'exportPdf': true,
    'ExportWord': true,
    'exportWord': true
}

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

    const isProductivityEnabled = window?.contextJsParameters?.valid && CKEDITOR_PRODUCTIVITY_LICENSE;
    defaultConfig.licenseKey = isProductivityEnabled ? CKEDITOR_PRODUCTIVITY_LICENSE : 'CKEDITOR_COMMUNITY';

    if (!isProductivityEnabled) {
        JahiaClassicEditor.builtinPlugins = JahiaClassicEditor.builtinPlugins.filter(p => !productivityPluginsNameAndKey[p.pluginName]);
        defaultConfig.toolbar.items = defaultConfig.toolbar.items.filter(i => !productivityPluginsNameAndKey[i]);
    }

    // TODO how do we deal with global overrides
    JahiaClassicEditor.defaultConfig = defaultConfig;
}
