import {registry} from '@jahia/ui-extender';
import {completeConfig, minimalConfig, lightConfig, advancedConfig} from '~/CKEditor/configurations';
import {REGISTRY_KEY} from '~/RichTextCKEditor5.constants';
import * as ckeditor5 from 'ckeditor5';

export function registerConfig() {
    registry.addOrReplace(REGISTRY_KEY, 'complete', completeConfig);
    registry.addOrReplace(REGISTRY_KEY, 'advanced', advancedConfig);
    registry.addOrReplace(REGISTRY_KEY, 'light', lightConfig);
    registry.addOrReplace(REGISTRY_KEY, 'minimal', minimalConfig);
}

/**
 * Allows developers to create simple custom configuration without a functional
 * federation setup.
 *
 * This is the case in e.g. JavaScript Modules, that are not, as far as
 * customers are told, compatible with UI extensions.
 */
export function registerUserConfigs() {
    const hooks = window.jahiaCk5Init || [];

    if (!Array.isArray(hooks)) {
        console.error('window.jahiaCk5Init is not an array, ignoring it. Ensure your bootstrap script looks like this: `(window.jahiaCk5Init ??= []).push(/* callback function */)`');
        return;
    }

    for (const hook of hooks) {
        if (typeof hook === 'function') {
            hook({ckeditor5, registry});
        } else {
            console.error('Ignoring non-function hook in window.jahiaCk5Init. Ensure your bootstrap script looks like this: `(window.jahiaCk5Init ??= []).push(/* callback function */)`. Bogus hook:', hook);
        }
    }
}
