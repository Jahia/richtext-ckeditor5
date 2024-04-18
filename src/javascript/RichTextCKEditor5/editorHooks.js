import {registry} from '@jahia/ui-extender';

let originalRichText;

export const editorOnBeforeContextHook = async editContext => {
    if (!originalRichText) {
        originalRichText = registry.get('selectorType', 'RichText');
    }

    return new Promise(resolve => {
        const siteKey = editContext.siteInfo.path.split('/')[2];
        const config = contextJsParameters.config.ckeditor5;

        if (config.excludeSites.includes(siteKey) && config.ckeditor5.includeSites.includes(siteKey)) {
            console.warn('The site is marked to be used with both CKEditor 4 and 5, version 5 will be used. See configuration for details.');
        }

        if ((config.enabledByDefault && !config.excludeSites.includes(siteKey)) || config.ckeditor5.includeSites.includes(siteKey)) {
            registry.addOrReplace('selectorType', 'RichText', registry.get('selectorType', 'RichText5'));
        } else {
            registry.addOrReplace('selectorType', 'RichText', originalRichText);
        }

        resolve();
    });
};

export const editorOnCloseHook = () => {
    if (originalRichText) {
        registry.addOrReplace('selectorType', 'RichText', originalRichText);
    }
};
