import {RichTextCKEditor5} from './RichTextCKEditor5';
import {registry} from '@jahia/ui-extender';
import {inlineEdit} from '~/RichTextCKEditor5/InlineCKEditor5';

export const registerRichTextCKEditor5 = () => {
    registry.addOrReplace('selectorType', 'RichText', {cmp: RichTextCKEditor5, supportMultiple: false});
    registry.addOrReplace('inline-editor', 'ckeditor5', {callback: inlineEdit});
};
