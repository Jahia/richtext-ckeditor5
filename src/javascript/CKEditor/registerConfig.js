import {registry} from '@jahia/ui-extender';
import {JahiaClassicEditor} from '~/CKEditor/JahiaClassicEditor';
import {completeConfig, minimalConfig, lightConfig, advancedConfig} from '~/CKEditor/configurations';
import {REGISTRY_KEY} from '~/RichTextCKEditor5.constants';

export function registerConfig() {
    registry.addOrReplace(REGISTRY_KEY, 'complete', completeConfig);
    registry.addOrReplace(REGISTRY_KEY, 'advanced', advancedConfig);
    registry.addOrReplace(REGISTRY_KEY, 'light', lightConfig);
    registry.addOrReplace(REGISTRY_KEY, 'minimal', minimalConfig);

    JahiaClassicEditor.builtinPlugins = minimalConfig.plugins;
    JahiaClassicEditor.defaultConfig = minimalConfig;
}

