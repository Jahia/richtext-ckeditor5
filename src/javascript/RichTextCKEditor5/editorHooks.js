import {getEditorVersionInfo} from './RichTextCKEditor5.gql-queries';
import {registry} from '@jahia/ui-extender';

let originalRichText;

export const editorOnBeforeContextHook = async (editContext, client) => {
    if (!originalRichText) {
        originalRichText = registry.get('selectorType', 'RichText');
    }

    return new Promise((resolve, reject) => {
        client.query({
            query: getEditorVersionInfo,
            variables: {siteId: editContext.siteInfo.uuid}
        }).then(result => {
            if (!result.data.jcr.nodeById?.property?.booleanValue) {
                registry.addOrReplace('selectorType', 'RichText', registry.get('selectorType', 'RichText5'));
            } else {
                registry.addOrReplace('selectorType', 'RichText', originalRichText);
            }

            resolve();
        }).catch(e => {
            console.error(e);
            reject();
        });
    });
};

export const editorOnCloseHook = () => {
    if (originalRichText) {
        registry.addOrReplace('selectorType', 'RichText', originalRichText);
    }
};
