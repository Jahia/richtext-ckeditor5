import {registry} from '@jahia/ui-extender';
import {registerRichTextCKEditor5} from './RichTextCKEditor5/registerRichTextCKEditor5';

export default function () {
    registry.add('callback', 'richtext-ckeditor5', {
        targets: ['jahiaApp-init:50'],
        callback: registerRichTextCKEditor5
    });
}
