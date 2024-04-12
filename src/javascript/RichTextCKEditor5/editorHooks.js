import {getEditorVersionInfo} from './RichTextCKEditor5.gql-queries';
import {registry} from '@jahia/ui-extender';

let originalRichText;

export const editorOnBeforeContextHook = async (editContext, client) => {
    if (!originalRichText) {
        originalRichText = registry.get('selectorType', 'RichText');
    }

    return new Promise((resolve, reject) => {
        if ((contextJsParameters.config.ckeditor5.enabledByDefault && !contextJsParameters.config.ckeditor5.exclude.includes(editContext.siteInfo.path.split('/')[2])) ||
            (!contextJsParameters.config.ckeditor5.enabledByDefault && contextJsParameters.config.ckeditor5.include.includes(editContext.siteInfo.path.split('/')[2]))) {
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
