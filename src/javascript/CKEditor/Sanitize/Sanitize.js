import {Plugin, ButtonView} from 'ckeditor5';
import {SanitizeCommand} from '~/CKEditor/Sanitize/SanitizeCommand';

export class Sanitize extends Plugin {
    init() {
        const editor = this.editor;
        // Register command
        editor.commands.add('sanitize', new SanitizeCommand(editor));

        editor.ui.componentFactory.add('sanitize', () => {
            console.log('Sanitize plugin - Register button');

            const button = new ButtonView();
            button.set({
                label: 'Sanitize',
                withText: true
            });
            // Make the button disbaled when source is selected
            button.bind('isEnabled').to(editor.commands.get('sanitize'), 'isEnabled');
            button.bind('isOn').to(editor.commands.get('sanitize'), 'value');

            button.on('execute', () => {
                editor.execute('sanitize');
            });
            return button;
        });
    }
}
