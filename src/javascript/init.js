import {registry} from '@jahia/ui-extender';
import {registerRichTextCKEditor5} from './RichTextCKEditor5/registerRichTextCKEditor5';
import {registerConfig} from '~/CKEditor/registerConfig';

export default function () {
    registry.add('callback', 'richtext-ckeditor5', {
        targets: ['jahiaApp-init:50'],
        callback: registerRichTextCKEditor5
    });

    registry.add('callback', 'richtext-ckeditor5-config', {
        targets: ['jahiaApp-init:99'],
        callback: registerConfig
    });
}
