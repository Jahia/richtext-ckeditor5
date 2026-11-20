import {ButtonView, MenuBarMenuListItemButtonView, Plugin} from 'ckeditor5';
import ContentReferenceIcon from './ContentReference.svg';
import {JahiaContentReferenceEditing} from './JahiaContentReferenceEditing';

const key = k => `JahiaContentReference:${k}`;

export class JahiaContentReferenceUI extends Plugin {
    static get pluginName() {
        return 'JahiaContentReferenceUI';
    }

    static get requires() {
        return [JahiaContentReferenceEditing];
    }

    init() {
        const editor = this.editor;
        const t = editor.t;
        const command = editor.commands.get('jahiaContentReference');

        const setUp = view => {
            view.set({
                label: t(key('label')),
                tooltip: true,
                icon: ContentReferenceIcon
            });

            view.bind('isEnabled').to(command);

            view.on('execute', () => {
                editor.execute('jahiaContentReference');
                editor.editing.view.focus();
            });

            return view;
        };

        editor.ui.componentFactory.add('jahiaContentReference', locale => {
            const view = setUp(new ButtonView(locale));
            view.set({withText: false});
            view.bind('isOn').to(command, 'value', value => Boolean(value));
            return view;
        });

        editor.ui.componentFactory.add('menuBar:jahiaContentReference', locale => {
            const view = setUp(new MenuBarMenuListItemButtonView(locale));
            view.set({withText: true});
            return view;
        });
    }
}
