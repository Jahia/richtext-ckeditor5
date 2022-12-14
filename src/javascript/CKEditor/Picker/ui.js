import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import browseFilesIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';

export class PickerUI extends Plugin {
    static get pluginName() {
        return 'JahiaNodePickerUI';
    }

    init() {
        const editor = this.editor;
        const componentFactory = editor.ui.componentFactory;
        const t = editor.t;

        componentFactory.add('jahiapicker', locale => {
            const command = editor.commands.get('jahiapicker');

            const button = new ButtonView(locale);

            button.set({
                label: t('Insert image or file'),
                icon: browseFilesIcon,
                tooltip: true
            });

            button.bind('isEnabled').to(command);

            button.on('execute', () => {
                editor.execute('jahiapicker');
                editor.editing.view.focus();
            });

            return button;
        });
    }
}
