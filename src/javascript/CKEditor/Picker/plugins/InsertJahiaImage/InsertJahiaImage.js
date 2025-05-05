import {
    ButtonView,
    ImageEditing, LinkEditing, MenuBarMenuListItemButtonView, Notification,
    Plugin
} from 'ckeditor5';
import {JahiaInsertImageCommand} from '../../JahiaInsertImageCommand';
import {loadTranslations} from '../../../../RichTextCKEditor5/RichTextCKEditor5.utils';

// This is taken from moonstone as I did not find a way to import and use "react" component directly or import pure svg
const imageIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 3H3C2 3 1 4 1 5V19C1 20.1 1.9 21 3 21H21C22 21 23 20 23 19V5C23 4 22 3 21 3ZM5 17L8.5 12.5L11 15.51L14.5 11L19 17H5Z" fill="black"/></svg>';

export class InsertJahiaImage extends Plugin {
    static get pluginName() {
        return 'InsertJahiaImage';
    }

    static get requires() {
        return [Notification, ImageEditing, LinkEditing];
    }

    static get requiresTranslations() {
        return true;
    }

    static prefixedTranslationKey(key) {
        return `${InsertJahiaImage.pluginName}:${key}`;
    }

    static get translations() {
        const l = InsertJahiaImage.prefixedTranslationKey('label');
        const t = InsertJahiaImage.prefixedTranslationKey('tooltip');

        return {
            fr: {
                [l]: 'Image',
                [t]: 'insérer une image'
            },
            de: {
                [l]: 'Bild',
                [t]: 'bild einfügen'
            },
            en: {
                [l]: 'Image',
                [t]: 'insert image'
            }
        };
    }

    init() {
        const editor = this.editor;
        const t = editor.t;
        const ts = InsertJahiaImage.translations;
        loadTranslations(editor, ts);

        editor.commands.add('jahiaInsertImageCommand', new JahiaInsertImageCommand(editor, 'image'));

        // Override the existing 'uploadImage' component
        editor.ui.componentFactory.add('menuBar:insertImage', locale => {
            const view = new MenuBarMenuListItemButtonView(locale);

            view.set({
                label: t(InsertJahiaImage.prefixedTranslationKey('label')),
                tooltip: t(InsertJahiaImage.prefixedTranslationKey('tooltip')),
                withText: true,
                icon: imageIcon
            });

            view.on('execute', () => {
                editor.commands.execute('jahiaInsertImageCommand');
            });

            return view;
        });

        editor.ui.componentFactory.add('insertJahiaImage', locale => {
            const view = new ButtonView(locale);

            view.set({
                label: t(InsertJahiaImage.prefixedTranslationKey('label')),
                tooltip: t(InsertJahiaImage.prefixedTranslationKey('tooltip')),
                withText: false,
                icon: imageIcon
            });

            view.on('execute', () => {
                editor.commands.execute('jahiaInsertImageCommand');
            });

            return view;
        });
    }
}
