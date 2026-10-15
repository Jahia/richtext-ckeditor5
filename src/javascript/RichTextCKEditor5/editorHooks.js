import {registry} from '@jahia/ui-extender';

let originalRichText;

export const editorOnBeforeContextHook = async editContext => {
    if (!originalRichText) {
        originalRichText = registry.get('selectorType', 'RichText');
    }

    return new Promise(resolve => {
        const siteKey = editContext.siteInfo.path.split('/')[2];
        const config = contextJsParameters.config.ckeditor5;

        if (config.ckeditor4Installed === false) {
            registry.addOrReplace('selectorType', 'RichText', registry.get('selectorType', 'RichText5'));
            resolve();
            return;
        }

        if (config.excludeSites.includes(siteKey) && config.includeSites.includes(siteKey)) {
            console.warn('The site is marked to be used with both CKEditor 4 and 5, version 5 will be used. See configuration for details.');
        }

        if ((config.enabledByDefault && !config.excludeSites.includes(siteKey)) || config.includeSites.includes(siteKey)) {
            registry.addOrReplace('selectorType', 'RichText', registry.get('selectorType', 'RichText5'));
        } else {
            registry.addOrReplace('selectorType', 'RichText', originalRichText);
        }

        resolve();
    });
};

export const editorOnCloseHook = () => {
    if (contextJsParameters.config.ckeditor5.ckeditor4Installed === false) {
        return;
    }

    // The exiting dialog is still in the DOM when its onExited runs, so a second one is a parent editor still open.
    if (document.querySelectorAll('[aria-labelledby="dialog-content-editor"]').length > 1) {
        return;
    }

    if (originalRichText) {
        registry.addOrReplace('selectorType', 'RichText', originalRichText);
    }
};
