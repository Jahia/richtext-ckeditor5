import {
    ButtonView,
    ImageEditing, LinkEditing, MenuBarMenuListItemButtonView, Notification,
    Plugin
} from 'ckeditor5';
import {InsertJahiaImageCommand} from './InsertJahiaImageCommand';
import {loadTranslations} from '../../../RichTextCKEditor5/RichTextCKEditor5.utils';
import {JahiaImageIcon} from '~/CKEditor/Picker';

export class InsertJahiaImage extends Plugin {
    static get pluginName() {
        return 'InsertJahiaImage';
    }

    static get requires() {
        return [Notification, ImageEditing, LinkEditing];
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
                [t]: 'Insérer une image'
            },
            de: {
                [l]: 'Bild',
                [t]: 'Bild einfügen'
            },
            en: {
                [l]: 'Image',
                [t]: 'Insert image'
            }
        };
    }

    init() {
        const editor = this.editor;
        const t = editor.t;
        const ts = InsertJahiaImage.translations;
        loadTranslations(editor, ts);

        editor.commands.add('jahiaInsertImageCommand', new InsertJahiaImageCommand(editor, 'image'));

        // Override the existing 'uploadImage' component
        editor.ui.componentFactory.add('menuBar:insertImage', locale => {
            const view = new MenuBarMenuListItemButtonView(locale);

            view.set({
                label: t(InsertJahiaImage.prefixedTranslationKey('label')),
                tooltip: t(InsertJahiaImage.prefixedTranslationKey('tooltip')),
                withText: true,
                icon: JahiaImageIcon
            });

            view.bind('isEnabled').to(editor, 'isReadOnly', isReadOnly => !isReadOnly);

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
                icon: JahiaImageIcon
            });

            view.bind('isEnabled').to(editor, 'isReadOnly', isReadOnly => !isReadOnly);

            view.on('execute', () => {
                editor.commands.execute('jahiaInsertImageCommand');
            });

            return view;
        });
    }
}
