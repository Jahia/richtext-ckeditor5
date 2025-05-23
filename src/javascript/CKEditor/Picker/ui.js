import {
    ButtonView,
    IconBrowseFiles,
    Plugin
} from 'ckeditor5';

let createButton = function (editor, commandName, label, icon) {
    return locale => {
        const command = editor.commands.get(commandName);

        const button = new ButtonView(locale);

        button.set({label, icon, tooltip: true});

        button.bind('isEnabled').to(command);
        button.bind('isOn').to(command, 'value', value => Boolean(value));

        button.on('execute', () => {
            editor.execute(commandName);
            editor.editing.view.focus();
        });

        return button;
    };
};

export class PickerUI extends Plugin {
    static get pluginName() {
        return 'JahiaNodePickerUI';
    }

    init() {
        const editor = this.editor;
        const componentFactory = editor.ui.componentFactory;
        const t = editor.t;

        componentFactory.add('jahiaInsertImage', createButton(editor, 'jahiaInsertImage', t('Insert image or file'), IconBrowseFiles));
    }
}
