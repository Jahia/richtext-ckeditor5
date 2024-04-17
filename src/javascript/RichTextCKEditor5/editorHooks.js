import {registry} from '@jahia/ui-extender';

let originalRichText;

export const editorOnBeforeContextHook = async (editContext) => {
    if (!originalRichText) {
        originalRichText = registry.get('selectorType', 'RichText');
    }

    return new Promise(resolve => {
        const siteKey = editContext.siteInfo.path.split('/')[2];
        if ((contextJsParameters.config.ckeditor5.enabledByDefault && !contextJsParameters.config.ckeditor5.exclude.includes(siteKey)) ||
            (!contextJsParameters.config.ckeditor5.enabledByDefault && contextJsParameters.config.ckeditor5.include.includes(siteKey))) {
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
