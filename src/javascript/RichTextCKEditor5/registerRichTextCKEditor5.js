import {RichTextCKEditor5} from './RichTextCKEditor5';
import {registry} from '@jahia/ui-extender';

export const registerRichTextCKEditor5 = () => {
    registry.addOrReplace('selectorType', 'RichText', {cmp: RichTextCKEditor5, supportMultiple: false});
};
