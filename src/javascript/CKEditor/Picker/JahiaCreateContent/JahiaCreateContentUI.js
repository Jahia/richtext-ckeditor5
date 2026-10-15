import {ButtonView, MenuBarMenuListItemButtonView, Plugin} from 'ckeditor5';
import CreateContentIcon from './CreateContent.svg';
import {JahiaCreateContentEditing} from './JahiaCreateContentEditing';

const key = k => `JahiaCreateContent:${k}`;

export class JahiaCreateContentUI extends Plugin {
    static get pluginName() {
        return 'JahiaCreateContentUI';
    }

    static get requires() {
        return [JahiaCreateContentEditing];
    }

    init() {
        const editor = this.editor;
        const t = editor.t;
        const command = editor.commands.get('jahiaCreateContent');
        const label = editor.config.get('jahiaCreateContent.mode') === 'create' ? key('saveFirst') : key('label');

        const setUp = view => {
            view.set({
                label: t(label),
                tooltip: true,
                icon: CreateContentIcon
            });

            view.bind('isEnabled').to(command);

            view.on('execute', () => {
                editor.execute('jahiaCreateContent');
            });

            return view;
        };

        editor.ui.componentFactory.add('jahiaCreateContent', locale => {
            const view = setUp(new ButtonView(locale));
            view.set({withText: false});
            return view;
        });

        editor.ui.componentFactory.add('menuBar:jahiaCreateContent', locale => {
            const view = setUp(new MenuBarMenuListItemButtonView(locale));
            view.set({withText: true});
            return view;
        });
    }
}
