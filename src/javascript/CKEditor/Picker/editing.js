import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageEditing from '@ckeditor/ckeditor5-image/src/image/imageediting';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';
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
