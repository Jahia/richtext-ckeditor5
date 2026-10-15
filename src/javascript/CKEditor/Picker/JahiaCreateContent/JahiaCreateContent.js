import {Plugin} from 'ckeditor5';
import {loadTranslations} from '../../../RichTextCKEditor5/RichTextCKEditor5.utils';
import {JahiaCreateContentEditing} from './JahiaCreateContentEditing';
import {JahiaCreateContentUI} from './JahiaCreateContentUI';

export class JahiaCreateContent extends Plugin {
    static get pluginName() {
        return 'JahiaCreateContent';
    }

    static get requires() {
        return [JahiaCreateContentEditing, JahiaCreateContentUI];
    }

    static prefixedTranslationKey(key) {
        return `${JahiaCreateContent.pluginName}:${key}`;
    }

    static get translations() {
        const k = JahiaCreateContent.prefixedTranslationKey;

        return {
            fr: {
                [k('label')]: 'Créer un nouveau contenu',
                [k('saveFirst')]: 'Enregistrez d\'abord le texte riche pour y créer du contenu',
                [k('unavailable')]: 'La création de contenu n\'est pas disponible.',
                [k('noCreatableType')]: 'Aucun type de contenu ne peut être créé ici.',
                [k('error')]: 'Impossible d\'ouvrir la création de contenu.'
            },
            de: {
                [k('label')]: 'Neuen Inhalt erstellen',
                [k('saveFirst')]: 'Speichern Sie zuerst den Rich Text, um darin Inhalte zu erstellen',
                [k('unavailable')]: 'Die Inhaltserstellung ist nicht verfügbar.',
                [k('noCreatableType')]: 'Hier kann kein Inhaltstyp erstellt werden.',
                [k('error')]: 'Die Inhaltserstellung kann nicht geöffnet werden.'
            },
            en: {
                [k('label')]: 'Create new content',
                [k('saveFirst')]: 'Save the rich text first to create content in it',
                [k('unavailable')]: 'Content creation is not available.',
                [k('noCreatableType')]: 'No content type can be created here.',
                [k('error')]: 'Unable to open content creation.'
            }
        };
    }

    init() {
        loadTranslations(this.editor, JahiaCreateContent.translations);
    }
}
