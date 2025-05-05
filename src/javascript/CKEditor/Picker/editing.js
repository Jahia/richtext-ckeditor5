import {
    ImageEditing,
    LinkEditing,
    Notification,
    Plugin
} from 'ckeditor5';
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

        editor.commands.add('jahiaLink', new JahiaLinkCommand(editor, 'editoriallink'));
    }
}
