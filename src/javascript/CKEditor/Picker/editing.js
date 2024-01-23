import {Plugin} from '@ckeditor/ckeditor5-core';
import {ImageEditing} from '@ckeditor/ckeditor5-image';
import {LinkEditing} from '@ckeditor/ckeditor5-link';
import {Notification} from '@ckeditor/ckeditor5-ui';
import {JahiaInsertImageCommand} from '~/CKEditor/Picker/JahiaInsertImageCommand';
import {JahiaLinkCommand} from '~/CKEditor/Picker/JahiaLinkCommand';

export class PickerEditing extends Plugin {
    static get pluginName() {
        return 'JahiaNodePickerEditing';
    }

    static get requires() {
        return [Notification, ImageEditing, LinkEditing];
    }

    init() {
        const editor = this.editor;

        editor.commands.add('jahiaInsertImage', new JahiaInsertImageCommand(editor, 'image'));
        editor.commands.add('jahiaLink', new JahiaLinkCommand(editor, 'editoriallink'));
    }
}
