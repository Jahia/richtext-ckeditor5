import {RichTextCKEditor5} from './RichTextCKEditor5';
import {registry} from '@jahia/ui-extender';
import {editorOnBeforeContextHook, editorOnCloseHook} from './editorHooks';

export const registerRichTextCKEditor5 = () => {
    registry.addOrReplace('selectorType', 'RichText5', {cmp: RichTextCKEditor5, supportMultiple: false});
    registry.addOrReplace('jcontent-editor-onbefore-context-hook', 'richtext-ckeditor5', {hook: editorOnBeforeContextHook});
    registry.addOrReplace('jcontent-editor-onclose-hook', 'richtext-ckeditor5', {hook: editorOnCloseHook});
};
